export type {
  BurnCardsRow as BurnCard,
  InvestigationsRow as Investigation,
  InvestigationEnvelopeRow as InvestigationEnvelope,
  HabitatAtmospheresRow as HabitatAtmosphere,
  FamilyTreeEdgesRow as FamilyTreeEdge,
  FindingsRow as Finding,
  TestCampaignsRow as TestCampaign,
  TestPlatformsRow as TestPlatform,
  SourcesRow as Source,
  KnownDiscrepanciesRow as KnownDiscrepancy,
  PublicationsRow as Publication,
  RejectedRowsRow as RejectedRow,
  QaReconciliationRow as QaReconciliation,
} from "./generated-types";

export type EvidenceTier = "measured" | "interpolated" | "extrapolated" | "analog" | "no_data";

export interface ConditionQuery {
  o2Pct: number;
  pressureKpa: number;
  gravity: import("./basis").QueryGravity;
  fuelClass?: "gas" | "liquid" | "solid" | "any";
  flowCmS?: number | null;
  fuelName?: string | null;
}
