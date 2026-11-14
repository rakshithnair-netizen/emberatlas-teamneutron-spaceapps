import { basisKind, isSolidBasis, normalizeGravity, type GravityRegime } from "./basis";
import { conditionDistance } from "./geometry";

export interface RankingWeights {
  proximity: number;
  evidence: number;
  consequence: number;
  gravity: number;
  recency: number;
}

export const defaultWeights: RankingWeights = {
  proximity: 0.3,
  evidence: 0.25,
  consequence: 0.25,
  gravity: 0.1,
  recency: 0.1,
};

export const weightLabels: Record<keyof RankingWeights, string> = {
  proximity: "Habitat proximity",
  evidence: "Evidence strength",
  consequence: "Safety consequence",
  gravity: "Gravity match",
  recency: "Recency / status",
};

export interface RankHabitat {
  habitat_id: string;
  name: string;
  o2_pct: number;
  pressure_kpa: number;
  role: string;
}

export interface RankCard {
  card_id: string;
  source_ids?: string[];
  investigation_id: string;
  o2_pct: number | null;
  o2_pct_low?: number | null;
  o2_basis: string;
  pressure_kpa: number | null;
  gravity_regime: string;
  habitat_relevance_tier: string;
}

export interface RankFinding {
  finding_id: string;
  area: string;
  subarea: string;
  statement: string;
  linked_investigations: string[];
  source_ids: string[];
}

export interface RankInvestigation {
  investigation_id: string;
  acronym: string;
  title: string;
  in_scope: boolean;
  start_date: string | null;
  status: string | null;
  fire_safety_roles: string | null;
}

export interface ScoreComponent {
  value: number;
  reason: string;
}

export interface RankedInsight {
  id: string;
  kind: "finding" | "investigation";
  title: string;
  statement: string;
  area: string;
  sourceIds: string[];
  investigationIds: string[];
  closestCardId: string | null;
  closestDistance: number | null;
  components: Record<keyof RankingWeights, ScoreComponent>;
  score: number;
}

export const STATED_CONDITION_AREAS: Record<string, { o2Pct: number; pressureKpa: number; reason: string }> = {
  habitat_materials: { o2Pct: 34, pressureKpa: 56.5, reason: "Finding is stated at 34–40% O₂, 8.2 psia (S03/S35)" },
};

const tierStrength: Record<string, number> = {
  A: 1,
  B: 0.6,
  C: 0.6,
  F: 0.5,
  D: 0.35,
  E: 0.1,
};

const areaConsequence: Record<string, number> = {
  detection: 1,
  suppression: 1,
  habitat_materials: 1,
  partial_gravity: 0.8,
  earth_application: 0.2,
};

export function habitatGravity(habitat: RankHabitat): GravityRegime {
  return habitat.role === "reference" ? "microgravity" : "lunar";
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function startYear(value: string | null): number | null {
  if (!value) return null;
  const match = value.match(/(19|20)\d{2}/);
  return match ? Number(match[0]) : null;
}

function cardStats(cards: RankCard[], habitat: RankHabitat) {
  const located = cards.filter((card) => card.o2_pct !== null && card.pressure_kpa !== null);
  let closest: RankCard | null = null;
  let closestDistance = Infinity;
  for (const card of located) {
    const distance = conditionDistance(card.o2_pct as number, card.pressure_kpa as number, habitat.o2_pct, habitat.pressure_kpa);
    if (distance < closestDistance) {
      closestDistance = distance;
      closest = card;
    }
  }
  const bestTier = cards.reduce((best, card) => Math.max(best, tierStrength[card.habitat_relevance_tier[0]] ?? 0), 0);
  const statedFraction = cards.length
    ? cards.filter((card) => isSolidBasis(basisKind(card.o2_basis, card.o2_pct_low != null))).length / cards.length
    : 0;
  const regimes = new Set(cards.map((card) => normalizeGravity(card.gravity_regime)));
  return { closest, closestDistance: closest ? closestDistance : null, bestTier, statedFraction, count: cards.length, regimes };
}

function proximityComponent(stats: ReturnType<typeof cardStats>, area: string, habitat: RankHabitat): ScoreComponent {
  if (stats.closestDistance !== null) {
    return {
      value: clamp(1 - Math.min(stats.closestDistance, 3) / 3),
      reason: `Closest card ${stats.closest!.card_id} at distance ${stats.closestDistance.toFixed(2)} from ${habitat.name}`,
    };
  }
  const stated = STATED_CONDITION_AREAS[area];
  if (stated) {
    const distance = conditionDistance(stated.o2Pct, stated.pressureKpa, habitat.o2_pct, habitat.pressure_kpa);
    return { value: clamp(1 - Math.min(distance, 3) / 3), reason: `${stated.reason}; distance ${distance.toFixed(2)}` };
  }
  return { value: 0, reason: "No linked burn cards with O₂ and pressure" };
}

function evidenceComponent(stats: ReturnType<typeof cardStats>): ScoreComponent {
  if (!stats.count) return { value: 0.3, reason: "Literature statement without linked burn cards" };
  const sampleScore = clamp(Math.log10(stats.count + 1) / 3);
  const value = clamp(0.5 * stats.bestTier + 0.25 * stats.statedFraction + 0.25 * sampleScore);
  return {
    value,
    reason: `${stats.count} cards, best tier score ${stats.bestTier.toFixed(2)}, ${Math.round(stats.statedFraction * 100)}% stated O₂`,
  };
}

function gravityComponent(stats: ReturnType<typeof cardStats>, area: string, target: GravityRegime): ScoreComponent {
  if (stats.regimes.has(target)) return { value: 1, reason: `Has ${target} burn cards` };
  if (area === "partial_gravity" && target === "lunar") return { value: 1, reason: "Partial-gravity finding" };
  if (area === "earth_application") return { value: 0.3, reason: "Earth application" };
  if (target === "microgravity") return { value: stats.count ? 0.9 : 0.6, reason: "Microgravity evidence for a microgravity habitat" };
  return { value: 0.5, reason: `Microgravity analog for a ${target} habitat` };
}

function recencyComponent(investigations: RankInvestigation[]): ScoreComponent {
  if (!investigations.length) return { value: 0.5, reason: "No linked investigation date" };
  const planned = investigations.some((investigation) => (investigation.status ?? "").startsWith("planned"));
  const years = investigations.map((investigation) => startYear(investigation.start_date)).filter((year): year is number => year !== null);
  const latest = years.length ? Math.max(...years) : null;
  const value = latest === null ? 0.5 : clamp((latest - 1995) / 30);
  if (planned) return { value: Math.max(value, 0.6), reason: "Includes a planned investigation (no results yet)" };
  return { value, reason: latest === null ? "Start date not given" : `Latest linked start year ${latest}` };
}

function investigationConsequence(roles: string | null): ScoreComponent {
  const list = (roles ?? "").split(";").filter(Boolean);
  if (list.some((role) => ["detection", "suppression", "prevention"].includes(role))) {
    return { value: 1, reason: `Fire-safety roles: ${list.join(", ")}` };
  }
  if (list.includes("modelling")) return { value: 0.5, reason: "Modelling role only" };
  return { value: 0.1, reason: "No curated fire-safety role" };
}

export function weightedScore(components: Record<keyof RankingWeights, ScoreComponent>, weights: RankingWeights): number {
  const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0) || 1;
  return (Object.keys(weights) as (keyof RankingWeights)[]).reduce(
    (sum, key) => sum + (components[key].value * weights[key]) / total,
    0,
  );
}

export function rankInsights(
  habitat: RankHabitat,
  data: { findings: RankFinding[]; investigations: RankInvestigation[]; cards: RankCard[] },
  weights: RankingWeights = defaultWeights,
): RankedInsight[] {
  const target = habitatGravity(habitat);
  const cardsByInvestigation = new Map<string, RankCard[]>();
  for (const card of data.cards) {
    if (!cardsByInvestigation.has(card.investigation_id)) cardsByInvestigation.set(card.investigation_id, []);
    cardsByInvestigation.get(card.investigation_id)!.push(card);
  }
  const investigationById = new Map(data.investigations.map((investigation) => [investigation.investigation_id, investigation]));
  const insights: RankedInsight[] = [];

  for (const finding of data.findings) {
    const linkedCards = finding.linked_investigations.flatMap((id) => cardsByInvestigation.get(id) ?? []);
    const stats = cardStats(linkedCards, habitat);
    const linkedInvestigations = finding.linked_investigations
      .map((id) => investigationById.get(id))
      .filter((investigation): investigation is RankInvestigation => Boolean(investigation));
    const components = {
      proximity: proximityComponent(stats, finding.area, habitat),
      evidence: evidenceComponent(stats),
      consequence: { value: areaConsequence[finding.area] ?? 0.5, reason: `Area: ${finding.area.replace(/_/g, " ")}` },
      gravity: gravityComponent(stats, finding.area, target),
      recency: recencyComponent(linkedInvestigations),
    };
    insights.push({
      id: finding.finding_id,
      kind: "finding",
      title: finding.subarea,
      statement: finding.statement,
      area: finding.area,
      sourceIds: finding.source_ids,
      investigationIds: finding.linked_investigations,
      closestCardId: stats.closest?.card_id ?? null,
      closestDistance: stats.closestDistance,
      components,
      score: weightedScore(components, weights),
    });
  }

  for (const investigation of data.investigations.filter((entry) => entry.in_scope)) {
    const cards = cardsByInvestigation.get(investigation.investigation_id) ?? [];
    if (!cards.length) continue;
    const stats = cardStats(cards, habitat);
    const components = {
      proximity: proximityComponent(stats, "", habitat),
      evidence: evidenceComponent(stats),
      consequence: investigationConsequence(investigation.fire_safety_roles),
      gravity: gravityComponent(stats, "", target),
      recency: recencyComponent([investigation]),
    };
    insights.push({
      id: investigation.investigation_id,
      kind: "investigation",
      title: `${investigation.acronym}: ${investigation.title}`,
      statement: stats.closest
        ? `${stats.count} burn cards; closest to ${habitat.name} is ${stats.closest.card_id} (${stats.closest.o2_pct}% O₂, ${stats.closest.pressure_kpa} kPa).`
        : `${stats.count} burn cards; none has both O₂ and pressure.`,
      area: "investigation",
      sourceIds: [...new Set(cards.flatMap((card) => card.source_ids ?? []))].slice(0, 6),
      investigationIds: [investigation.investigation_id],
      closestCardId: stats.closest?.card_id ?? null,
      closestDistance: stats.closestDistance,
      components,
      score: weightedScore(components, weights),
    });
  }

  return insights.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

export function rerank(insights: RankedInsight[], weights: RankingWeights): RankedInsight[] {
  return insights
    .map((insight) => ({ ...insight, score: weightedScore(insight.components, weights) }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

export function insightsToCsv(insights: RankedInsight[], weights: RankingWeights): string {
  const keys = Object.keys(weights) as (keyof RankingWeights)[];
  const header = ["rank", "id", "kind", "title", "score", ...keys, "closest_card_id", "closest_distance", "source_ids"];
  const escape = (value: unknown) => {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const rows = insights.map((insight, index) =>
    [
      index + 1,
      insight.id,
      insight.kind,
      insight.title,
      insight.score.toFixed(4),
      ...keys.map((key) => insight.components[key].value.toFixed(4)),
      insight.closestCardId,
      insight.closestDistance?.toFixed(4),
      insight.sourceIds.join(";"),
    ]
      .map(escape)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}
