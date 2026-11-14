import { burnCards, findings, habitats, investigations } from "./data";
import { classifyEvidence } from "./evidence";
import { habitatGravity, rankInsights, type RankedInsight } from "./ranking";
import type { EvidenceTier } from "./types";

export interface InsightWithTier extends RankedInsight {
  tierMicro: EvidenceTier;
  tierHabitatGravity: EvidenceTier;
  habitatGravity: string;
}

function tierFor(insight: RankedInsight, o2Pct: number, pressureKpa: number, gravity: "microgravity" | "lunar"): EvidenceTier {
  const linked = burnCards.filter((card) => insight.investigationIds.includes(card.investigation_id));
  if (!linked.length) return insight.sourceIds.length ? "analog" : "no_data";
  return classifyEvidence({ o2Pct, pressureKpa, gravity, fuelClass: "any" }, linked).tier;
}

export function insightsByHabitat(): Record<string, InsightWithTier[]> {
  const result: Record<string, InsightWithTier[]> = {};
  for (const habitat of habitats) {
    const ranked = rankInsights(habitat, { findings, investigations, cards: burnCards });
    const gravity = habitatGravity(habitat);
    result[habitat.habitat_id] = ranked.map((insight) => ({
      ...insight,
      tierMicro: tierFor(insight, habitat.o2_pct, habitat.pressure_kpa, "microgravity"),
      tierHabitatGravity: gravity === "lunar" ? tierFor(insight, habitat.o2_pct, habitat.pressure_kpa, "lunar") : tierFor(insight, habitat.o2_pct, habitat.pressure_kpa, "microgravity"),
      habitatGravity: gravity,
    }));
  }
  return result;
}
