import type { ConditionQuery } from "./types";

export interface FindingLike {
  finding_id: string;
  area: string;
  subarea: string;
  statement: string;
  linked_investigations: string[];
  source_ids: string[];
}

export interface RelevantFinding<T extends FindingLike> {
  finding: T;
  reason: string;
}

export function relevantFindings<T extends FindingLike>(query: ConditionQuery, nearestInvestigationIds: string[], findings: T[], limit = 8): RelevantFinding<T>[] {
  const picked = new Map<string, RelevantFinding<T>>();
  const add = (finding: T, reason: string) => {
    if (!picked.has(finding.finding_id)) picked.set(finding.finding_id, { finding, reason });
  };
  const partial = query.gravity === "lunar" || query.gravity === "mars";
  const elevatedLowPressure = query.o2Pct >= 30 && query.pressureKpa <= 75;
  const material = (query.fuelName ?? "").toLowerCase();

  if (material) {
    const token = material.split(/[\s(]/)[0];
    for (const finding of findings) if (token.length > 2 && finding.statement.toLowerCase().includes(token)) add(finding, `Mentions ${query.fuelName}`);
  }
  if (partial) {
    for (const finding of findings.filter((entry) => entry.area === "partial_gravity")) {
      add(finding, query.gravity === "mars" ? "Partial-gravity evidence (no Mars-gravity burns in dataset)" : "Partial-gravity evidence");
    }
  }
  if (elevatedLowPressure) {
    for (const finding of findings.filter((entry) => entry.area === "habitat_materials")) add(finding, "Assessed at exploration-atmosphere O₂ and pressure");
  }
  for (const finding of findings) {
    if (finding.linked_investigations.some((id) => nearestInvestigationIds.includes(id)) && finding.area !== "earth_application") {
      add(finding, "Linked to an investigation among the nearest cards");
    }
  }
  return [...picked.values()].slice(0, limit);
}
