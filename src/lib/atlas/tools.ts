import MiniSearch from "minisearch";
import { burnCards, discrepancies, envelopes, findings, habitats, investigations, sources } from "../data";
import { normalizeGravity, type QueryGravity } from "../basis";
import { discrepanciesForInvestigation } from "../discrepancy";
import { classifyEvidence } from "../evidence";
import { habitatDistance, psiaToKpa } from "../geometry";
import type { BurnCard, ConditionQuery, EvidenceTier } from "../types";

interface Doc {
  id: string;
  kind: "finding" | "investigation" | "summary" | "discrepancy" | "habitat";
  title: string;
  text: string;
  sourceIds: string[];
  investigationIds: string[];
}

function investigationSummary(id: string): string {
  const cards = burnCards.filter((card) => card.investigation_id === id);
  const envelope = envelopes.find((entry) => entry.investigation_id === id);
  if (!cards.length) return "";
  const fuels = [...new Set(cards.map((card) => card.fuel_name))].slice(0, 8).join(", ");
  const outcomes = [...new Set(cards.map((card) => card.outcome))].join(", ");
  const range = envelope?.o2_pct_min != null ? `O2 ${envelope.o2_pct_min}-${envelope.o2_pct_max}%, pressure ${envelope.pressure_kpa_min}-${envelope.pressure_kpa_max} kPa` : "O2 or pressure not reported";
  return `${cards.length} burn cards; fuels ${fuels}; ${range}; outcomes ${outcomes}; closest card to 8.2 psia/34% O2 ${envelope?.closest_card_id ?? "none"} at distance ${envelope?.closest_distance_to_8p2psi_34pct ?? "n/a"}; best tier ${envelope?.best_tier ?? "n/a"}.`;
}

const docs: Doc[] = [
  ...findings.map((finding) => ({
    id: finding.finding_id,
    kind: "finding" as const,
    title: `${finding.area}: ${finding.subarea}${finding.earth_domain ? ` (${finding.earth_domain.replace(/_/g, " ")})` : ""}`,
    text: finding.statement,
    sourceIds: finding.source_ids,
    investigationIds: finding.linked_investigations,
  })),
  ...investigations.map((investigation) => ({
    id: investigation.investigation_id,
    kind: "investigation" as const,
    title: `${investigation.acronym} ${investigation.title}`,
    text: `${investigation.objective} ${investigation.approach ?? ""} ${investigation.research_impacts_earth_benefits ?? ""} ${investigation.keywords ?? ""} ${investigation.fire_safety_roles ?? ""}`,
    sourceIds: sources.some((source) => source.source_id === investigation.investigation_id) ? [investigation.investigation_id] : [],
    investigationIds: [investigation.investigation_id],
  })),
  ...investigations
    .map((investigation) => ({
      id: `SUM-${investigation.investigation_id}`,
      kind: "summary" as const,
      title: `${investigation.acronym} card summary`,
      text: investigationSummary(investigation.investigation_id),
      sourceIds: [...new Set(burnCards.filter((card) => card.investigation_id === investigation.investigation_id).flatMap((card) => card.source_ids))],
      investigationIds: [investigation.investigation_id],
    }))
    .filter((doc) => doc.text),
  ...discrepancies.map((discrepancy, index) => ({
    id: `DISC-${index + 1}`,
    kind: "discrepancy" as const,
    title: `${discrepancy.investigation} ${discrepancy.record} ${discrepancy.field}`,
    text: `${discrepancy.psi_or_primary_value} vs ${discrepancy.conflicting_or_expected_value}. ${discrepancy.handling}`,
    sourceIds: discrepancy.investigation.split(";").filter((id) => sources.some((source) => source.source_id === id)),
    investigationIds: discrepancy.investigation.split(";"),
  })),
  ...habitats.map((habitat) => ({
    id: habitat.habitat_id,
    kind: "habitat" as const,
    title: habitat.name,
    text: `${habitat.role} ${habitat.o2_pct}% O2 at ${habitat.pressure_psia} psia (${habitat.pressure_kpa} kPa); ppO2 ${habitat.ppo2_kpa} kPa. ${habitat.note}`,
    sourceIds: habitat.source_ids,
    investigationIds: [],
  })),
];

const acronymBoost = new Map(investigations.map((investigation) => [investigation.acronym.toLowerCase(), investigation.investigation_id]));

const index = new MiniSearch<Doc>({
  fields: ["title", "text"],
  storeFields: ["id", "kind", "title", "text", "sourceIds", "investigationIds"],
  searchOptions: { prefix: true, fuzzy: 0.2, boost: { title: 2 }, combineWith: "OR" },
});
index.addAll(docs);

const stopWords = new Set(["what", "does", "the", "how", "well", "which", "are", "is", "a", "an", "of", "to", "in", "at", "and", "or", "do", "say", "about", "would", "data", "with", "for", "on", "from", "this", "that", "be", "can", "it", "we", "know"]);

export interface SearchHit {
  id: string;
  kind: Doc["kind"];
  title: string;
  text: string;
  sourceIds: string[];
  investigationIds: string[];
  score: number;
}

export function searchFindings(q: string, limit = 6): SearchHit[] {
  const cleaned = q
    .toLowerCase()
    .replace(/[^\w\s%.-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !stopWords.has(word))
    .join(" ");
  if (!cleaned) return [];
  return index.search(cleaned).slice(0, limit).map((hit) => ({
    id: hit.id as string,
    kind: hit.kind,
    title: hit.title,
    text: hit.text,
    sourceIds: hit.sourceIds,
    investigationIds: hit.investigationIds,
    score: Math.round(hit.score * 100) / 100,
  }));
}

export interface CardFilters {
  investigation_id?: string;
  acronym?: string;
  fuel_class?: string;
  fuel_name_contains?: string;
  gravity?: string;
  o2_min?: number;
  o2_max?: number;
  pressure_min_kpa?: number;
  pressure_max_kpa?: number;
  outcome?: string;
  limit?: number;
}

export function compactCard(card: BurnCard) {
  return {
    card_id: card.card_id,
    acronym: card.acronym,
    investigation_id: card.investigation_id,
    fuel_name: card.fuel_name,
    fuel_class: card.fuel_class,
    o2_pct: card.o2_pct,
    o2_basis: card.o2_basis,
    pressure_kpa: card.pressure_kpa,
    pressure_basis: card.pressure_basis,
    gravity: normalizeGravity(card.gravity_regime),
    flow_cm_s: card.flow_cm_s,
    outcome: card.outcome,
    burn_time_s: card.burn_time_s,
    tier: card.habitat_relevance_tier,
    distance_to_exploration: card.o2_pct !== null && card.pressure_kpa !== null ? Math.round(habitatDistance(card.o2_pct, card.pressure_kpa) * 1000) / 1000 : null,
    quality_flags: card.quality_flags,
    source_ids: card.source_ids,
  };
}

export function queryCards(filters: CardFilters) {
  const matches = burnCards.filter((card) => {
    if (filters.investigation_id && card.investigation_id !== filters.investigation_id) return false;
    if (filters.acronym && card.acronym.toLowerCase() !== filters.acronym.toLowerCase()) return false;
    if (filters.fuel_class && card.fuel_class !== filters.fuel_class) return false;
    if (filters.fuel_name_contains && !card.fuel_name.toLowerCase().includes(filters.fuel_name_contains.toLowerCase())) return false;
    if (filters.gravity && normalizeGravity(card.gravity_regime) !== filters.gravity) return false;
    if (filters.outcome && card.outcome !== filters.outcome) return false;
    if (filters.o2_min !== undefined && (card.o2_pct === null || card.o2_pct < filters.o2_min)) return false;
    if (filters.o2_max !== undefined && (card.o2_pct === null || card.o2_pct > filters.o2_max)) return false;
    if (filters.pressure_min_kpa !== undefined && (card.pressure_kpa === null || card.pressure_kpa < filters.pressure_min_kpa)) return false;
    if (filters.pressure_max_kpa !== undefined && (card.pressure_kpa === null || card.pressure_kpa > filters.pressure_max_kpa)) return false;
    return true;
  });
  const sorted = [...matches].sort((a, b) => (a.o2_pct !== null && a.pressure_kpa !== null ? habitatDistance(a.o2_pct, a.pressure_kpa) : 99) - (b.o2_pct !== null && b.pressure_kpa !== null ? habitatDistance(b.o2_pct, b.pressure_kpa) : 99));
  return { total: matches.length, cards: sorted.slice(0, Math.min(filters.limit ?? 10, 25)).map(compactCard) };
}

export function classifyCondition(condition: ConditionQuery) {
  const pool = condition.fuelName ? burnCards.filter((card) => card.fuel_name.toLowerCase().includes(condition.fuelName!.toLowerCase())) : burnCards;
  const result = classifyEvidence(condition, pool);
  return {
    tier: result.tier,
    distance: result.distance,
    gapStatement: result.gapStatement,
    closeGapStatement: result.closeGapStatement,
    comparisonSetSize: result.comparisonSetSize,
    nearestCards: result.nearestCards.map((entry) => ({ ...compactCard(entry.card as unknown as BurnCard), distance: Math.round(entry.distance * 1000) / 1000 })),
  };
}

export function getInvestigation(id: string) {
  const key = acronymBoost.get(id.toLowerCase()) ?? id;
  const investigation = investigations.find((entry) => entry.investigation_id.toLowerCase() === key.toLowerCase());
  if (!investigation) return { error: `No investigation ${id}` };
  return {
    investigation_id: investigation.investigation_id,
    acronym: investigation.acronym,
    title: investigation.title,
    status: investigation.status,
    fire_safety_roles: investigation.fire_safety_roles,
    objective: investigation.objective,
    approach: investigation.approach,
    platform: investigation.platform,
    start_date: investigation.start_date,
    envelope: envelopes.find((entry) => entry.investigation_id === investigation.investigation_id) ?? null,
    summary: investigationSummary(investigation.investigation_id),
    discrepancies: discrepanciesForInvestigation(investigation.investigation_id, discrepancies),
    findings: findings.filter((finding) => finding.linked_investigations.includes(investigation.investigation_id)).map((finding) => ({ id: finding.finding_id, statement: finding.statement, source_ids: finding.source_ids })),
    source_ids: [...new Set([...(sources.some((source) => source.source_id === investigation.investigation_id) ? [investigation.investigation_id] : []), ...burnCards.filter((card) => card.investigation_id === investigation.investigation_id).flatMap((card) => card.source_ids)])],
  };
}

export function getSources(ids: string[]) {
  return ids.map((id) => sources.find((source) => source.source_id === id) ?? { source_id: id, error: "not found" });
}

export function closestInvestigations(limit = 6) {
  return [...envelopes]
    .filter((envelope) => envelope.closest_distance_to_8p2psi_34pct !== null)
    .sort((a, b) => (a.closest_distance_to_8p2psi_34pct as number) - (b.closest_distance_to_8p2psi_34pct as number))
    .slice(0, limit);
}

const materialAliases: Record<string, string> = {
  acrylic: "PMMA",
  pmma: "PMMA",
  plexiglas: "PMMA",
  sibal: "SIBAL",
  cotton: "Cotton",
  nomex: "Nomex",
  kapton: "Kapton",
  teflon: "Teflon",
  silicone: "Silicone",
  ultem: "Ultem",
  candle: "Wax",
  wax: "Wax",
  heptane: "heptane",
  methanol: "Methanol",
  ethanol: "Ethanol",
  decane: "decane",
  ethylene: "Ethylene",
  ethane: "Ethane",
  methane: "Methane",
  propane: "Propane",
  butane: "Butane",
};

export interface ParsedQuestion {
  condition: ConditionQuery | null;
  material: string | null;
  fuelClass: ConditionQuery["fuelClass"];
  gravity: QueryGravity;
  gravityMentioned: boolean;
  investigationIds: string[];
  wantsClosest: boolean;
}

export function parseQuestion(question: string): ParsedQuestion {
  const text = question.toLowerCase();
  let gravity: QueryGravity = "microgravity";
  let gravityMentioned = true;
  if (/\b(mars|martian)\b/.test(text)) gravity = "mars";
  else if (/\b(lunar|moon|partial[- ]gravity|partial g)\b/.test(text)) gravity = "lunar";
  else if (/\b(earth gravity|1[- ]g|normal gravity)\b/.test(text)) gravity = "earth";
  else gravityMentioned = /microgravity|0[- ]g|space station|iss/.test(text);

  let material: string | null = null;
  for (const [alias, name] of Object.entries(materialAliases)) {
    if (new RegExp(`\\b${alias}\\b`).test(text)) {
      material = name;
      break;
    }
  }
  const materialCard = material ? burnCards.find((card) => card.fuel_name.toLowerCase().includes(material!.toLowerCase())) : undefined;
  const fuelClass = (materialCard?.fuel_class as ConditionQuery["fuelClass"]) ?? (/\b(solid|material|fabric)s?\b/.test(text) ? "solid" : /\bdroplet|liquid\b/.test(text) ? "liquid" : "any");

  let o2: number | null = null;
  let pressureKpa: number | null = null;
  const o2Match = text.match(/(\d+(?:\.\d+)?)\s*%\s*(?:o2|o₂|oxygen)?/);
  if (o2Match) o2 = Number(o2Match[1]);
  const pressureMatch = text.match(/(\d+(?:\.\d+)?)\s*(psia|psi|kpa|atm)\b/);
  if (pressureMatch) {
    const value = Number(pressureMatch[1]);
    pressureKpa = pressureMatch[2].startsWith("psi") ? psiaToKpa(value) : pressureMatch[2] === "atm" ? value * 101.325 : value;
  }
  if (/exploration atmosphere|8\.2\s*psi/.test(text)) {
    o2 = o2 ?? 34;
    pressureKpa = pressureKpa ?? 56.54;
  }
  const investigationIds = investigations
    .filter((investigation) => new RegExp(`\\b${investigation.acronym.toLowerCase().replace(/[/\-]/g, "[/\\- ]?")}\\b`).test(text) || text.includes(investigation.investigation_id.toLowerCase()))
    .map((investigation) => investigation.investigation_id);
  const condition: ConditionQuery | null =
    o2 !== null || pressureKpa !== null
      ? { o2Pct: o2 ?? 21, pressureKpa: pressureKpa ?? 101.3, gravity, fuelClass, fuelName: materialCard ? material : null }
      : null;
  return { condition, material, fuelClass, gravity, gravityMentioned, investigationIds, wantsClosest: /\b(closest|nearest)\b/.test(text) };
}

export type { EvidenceTier };
