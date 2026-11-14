import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { convexHull, habitatDistance } from "../src/lib/geometry";
import { normalizeGravity } from "../src/lib/basis";

const appRoot = path.resolve(__dirname, "..");
const datasetDir = process.env.DATASET_DIR ?? path.join(os.homedir(), "Desktop/SpaceApps-Data/dataset");
const rawDir = path.join(appRoot, "src/data/raw");
const publicDataDir = path.join(appRoot, "public/data");
const publicCsvDir = path.join(publicDataDir, "csv");

const tables = [
  "burn_cards",
  "investigations",
  "investigation_envelope",
  "habitat_atmospheres",
  "family_tree_edges",
  "findings",
  "test_campaigns",
  "test_platforms",
  "sources",
  "known_discrepancies",
  "publications",
  "rejected_rows",
  "qa_reconciliation",
];

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFromDataset() {
  const jsonDir = path.join(datasetDir, "json");
  if (!fs.existsSync(jsonDir)) {
    console.log(`Dataset not found at ${datasetDir}; using committed copies in src/data/raw`);
    return;
  }
  ensureDir(rawDir);
  ensureDir(publicCsvDir);
  for (const table of tables) {
    fs.copyFileSync(path.join(jsonDir, `${table}.json`), path.join(rawDir, `${table}.json`));
    const csvPath = path.join(datasetDir, `${table}.csv`);
    if (fs.existsSync(csvPath)) fs.copyFileSync(csvPath, path.join(publicCsvDir, `${table}.csv`));
  }
  for (const extra of ["data_dictionary.csv", "datapackage.json", "README.md"]) {
    const source = path.join(datasetDir, extra);
    if (fs.existsSync(source)) fs.copyFileSync(source, path.join(rawDir, extra));
    if (fs.existsSync(source)) fs.copyFileSync(source, path.join(publicCsvDir, extra));
  }
  console.log(`Copied ${tables.length} tables from ${datasetDir}`);
}

function readTable<T = Record<string, unknown>>(table: string): T[] {
  return JSON.parse(fs.readFileSync(path.join(rawDir, `${table}.json`), "utf8"));
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function pascalCase(name: string) {
  return name
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
}

function inferType(values: unknown[]): string {
  const kinds = new Set<string>();
  let nullable = false;
  for (const value of values) {
    if (value === null || value === undefined) nullable = true;
    else if (Array.isArray(value)) kinds.add("string[]");
    else if (typeof value === "object") kinds.add("Record<string, unknown>");
    else kinds.add(typeof value);
  }
  if (kinds.size === 0) kinds.add("string");
  const base = [...kinds].sort().join(" | ");
  return nullable ? `${base} | null` : base;
}

function generateTypes() {
  const dictionaryRows = parseCsv(fs.readFileSync(path.join(rawDir, "data_dictionary.csv"), "utf8")).slice(1);
  const columnsByTable = new Map<string, { column: string; description: string }[]>();
  for (const [table, column, description] of dictionaryRows) {
    if (!table) continue;
    if (!columnsByTable.has(table)) columnsByTable.set(table, []);
    columnsByTable.get(table)!.push({ column, description });
  }
  const lines: string[] = [];
  const descriptions: Record<string, Record<string, string>> = {};
  for (const table of tables) {
    const rows = readTable(table);
    const dictionaryColumns = columnsByTable.get(table) ?? [];
    const columns = dictionaryColumns.length
      ? dictionaryColumns.map((entry) => entry.column)
      : Object.keys(rows[0] ?? {});
    for (const key of Object.keys(rows[0] ?? {})) if (!columns.includes(key)) columns.push(key);
    descriptions[table] = Object.fromEntries(dictionaryColumns.map((entry) => [entry.column, entry.description]));
    lines.push(`export interface ${pascalCase(table)}Row {`);
    for (const column of columns) {
      lines.push(`  ${column}: ${inferType(rows.map((row) => row[column]))};`);
    }
    lines.push("}", "");
  }
  lines.push(`export const columnDescriptions: Record<string, Record<string, string>> = ${JSON.stringify(descriptions, null, 2)};`, "");
  fs.writeFileSync(path.join(appRoot, "src/lib/generated-types.ts"), lines.join("\n"));
}

type Card = {
  card_id: string;
  investigation_id: string;
  acronym: string;
  fuel_class: string;
  fuel_name: string;
  o2_pct: number | null;
  pressure_kpa: number | null;
  gravity_regime: string;
  habitat_relevance_tier: string;
  o2_basis: string;
  outcome: string;
};

function computeDerived() {
  const cards = readTable<Card>("burn_cards");
  const located = cards.filter((card) => card.o2_pct !== null && card.pressure_kpa !== null);
  const hulls: { fuelClass: string; gravity: string; count: number; points: [number, number][] }[] = [];
  const groups = new Map<string, Card[]>();
  for (const card of located) {
    const key = `${card.fuel_class}|${normalizeGravity(card.gravity_regime)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(card);
  }
  for (const [key, members] of groups) {
    const [fuelClass, gravity] = key.split("|");
    const hull = convexHull(members.map((card) => [card.pressure_kpa!, card.o2_pct!] as [number, number]));
    hulls.push({ fuelClass, gravity, count: members.length, points: hull });
  }
  const solidsMicro = located.filter((card) => card.fuel_class === "solid" && normalizeGravity(card.gravity_regime) === "microgravity");
  const highestSolid = solidsMicro.reduce((best, card) => (card.o2_pct! > best.o2_pct! ? card : best));
  const tierA = cards.filter((card) => card.habitat_relevance_tier.startsWith("A_"));
  const partialGravity = cards.filter((card) => normalizeGravity(card.gravity_regime) === "lunar");
  const nonMicro = cards.filter((card) => normalizeGravity(card.gravity_regime) !== "microgravity");
  const closest = [...located].sort((a, b) => habitatDistance(a.o2_pct!, a.pressure_kpa!) - habitatDistance(b.o2_pct!, b.pressure_kpa!))[0];
  const tierCounts: Record<string, number> = {};
  for (const card of cards) tierCounts[card.habitat_relevance_tier] = (tierCounts[card.habitat_relevance_tier] ?? 0) + 1;
  const derived = {
    generatedFrom: "scripts/prepare-data.ts",
    totals: { cards: cards.length, located: located.length },
    tierCounts,
    headline: {
      tierA: { count: tierA.length, pct: Math.round((tierA.length / cards.length) * 1000) / 10, cardIds: tierA.map((card) => card.card_id) },
      highestSolidMicrogravity: {
        cardId: highestSolid.card_id,
        acronym: highestSolid.acronym,
        fuelName: highestSolid.fuel_name,
        o2Pct: highestSolid.o2_pct,
        pressureKpa: highestSolid.pressure_kpa,
      },
      partialGravity: {
        lunarCount: partialGravity.length,
        nonMicrogravityCount: nonMicro.length,
        cardIds: nonMicro.map((card) => card.card_id),
        acronyms: [...new Set(nonMicro.map((card) => card.acronym))],
      },
      closestCard: {
        cardId: closest.card_id,
        acronym: closest.acronym,
        distance: Math.round(habitatDistance(closest.o2_pct!, closest.pressure_kpa!) * 1000) / 1000,
      },
    },
    hulls,
  };
  fs.writeFileSync(path.join(appRoot, "src/data/derived.json"), JSON.stringify(derived, null, 1));
  ensureDir(publicDataDir);
  fs.copyFileSync(path.join(rawDir, "burn_cards.json"), path.join(publicDataDir, "burn_cards.json"));
  const publicJsonDir = path.join(publicDataDir, "json");
  ensureDir(publicJsonDir);
  for (const table of tables) fs.copyFileSync(path.join(rawDir, `${table}.json`), path.join(publicJsonDir, `${table}.json`));
  console.log(`Derived: ${hulls.length} hulls, tier A ${tierA.length}, highest solid ${highestSolid.card_id} at ${highestSolid.o2_pct}% O2`);
}

copyFromDataset();
generateTypes();
computeDerived();
