import burnCardsJson from "@/data/raw/burn_cards.json";
import investigationsJson from "@/data/raw/investigations.json";
import envelopeJson from "@/data/raw/investigation_envelope.json";
import habitatsJson from "@/data/raw/habitat_atmospheres.json";
import edgesJson from "@/data/raw/family_tree_edges.json";
import findingsJson from "@/data/raw/findings.json";
import campaignsJson from "@/data/raw/test_campaigns.json";
import platformsJson from "@/data/raw/test_platforms.json";
import sourcesJson from "@/data/raw/sources.json";
import discrepanciesJson from "@/data/raw/known_discrepancies.json";
import publicationsJson from "@/data/raw/publications.json";
import rejectedJson from "@/data/raw/rejected_rows.json";
import reconciliationJson from "@/data/raw/qa_reconciliation.json";
import derivedJson from "@/data/derived.json";
import type {
  BurnCard,
  FamilyTreeEdge,
  Finding,
  HabitatAtmosphere,
  Investigation,
  InvestigationEnvelope,
  KnownDiscrepancy,
  Publication,
  QaReconciliation,
  RejectedRow,
  Source,
  TestCampaign,
  TestPlatform,
} from "./types";

export const burnCards = burnCardsJson as unknown as BurnCard[];
export const investigations = investigationsJson as unknown as Investigation[];
export const envelopes = envelopeJson as unknown as InvestigationEnvelope[];
export const habitats = habitatsJson as unknown as HabitatAtmosphere[];
export const familyEdges = edgesJson as unknown as FamilyTreeEdge[];
export const findings = findingsJson as unknown as Finding[];
export const campaigns = campaignsJson as unknown as TestCampaign[];
export const platforms = platformsJson as unknown as TestPlatform[];
export const sources = sourcesJson as unknown as Source[];
export const discrepancies = discrepanciesJson as unknown as KnownDiscrepancy[];
export const publications = publicationsJson as unknown as Publication[];
export const rejectedRows = rejectedJson as unknown as RejectedRow[];
export const reconciliation = reconciliationJson as unknown as QaReconciliation[];
export const derived = derivedJson;

export function investigationById(id: string): Investigation | undefined {
  return investigations.find((investigation) => investigation.investigation_id === id);
}

export function cardsForInvestigation(id: string): BurnCard[] {
  return burnCards.filter((card) => card.investigation_id === id);
}
