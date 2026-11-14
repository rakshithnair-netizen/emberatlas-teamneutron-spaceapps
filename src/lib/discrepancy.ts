export interface DiscrepancyLike {
  investigation: string;
  record: string;
  field: string;
  psi_or_primary_value: string;
  conflicting_or_expected_value: string;
  handling: string;
}

export interface DiscrepancyCardLike {
  investigation_id: string;
  test_id: string | null;
  quality_flags: string[];
}

export function discrepancyInvestigations(discrepancy: DiscrepancyLike): string[] {
  return discrepancy.investigation.split(";").map((value) => value.trim());
}

export function discrepanciesForInvestigation<T extends DiscrepancyLike>(investigationId: string, discrepancies: T[]): T[] {
  return discrepancies.filter((discrepancy) => discrepancyInvestigations(discrepancy).includes(investigationId));
}

export function discrepanciesForCard<T extends DiscrepancyLike>(card: DiscrepancyCardLike, discrepancies: T[]): T[] {
  return discrepanciesForInvestigation(card.investigation_id, discrepancies).filter((discrepancy) => {
    const flagged = card.quality_flags.some((flag) => discrepancy.handling.includes(flag));
    const record = discrepancy.record.toLowerCase();
    const testId = (card.test_id ?? "").toLowerCase();
    const recordMatches = testId.length > 0 && record.split(/[\s,/]+/).includes(testId);
    if (discrepancy.handling.includes("o2_final_outlier")) return flagged && recordMatches;
    return flagged || recordMatches || record === "all rows";
  });
}
