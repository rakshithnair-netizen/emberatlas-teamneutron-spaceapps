export interface BurnCardsRow {
  card_id: string;
  data_origin: string;
  investigation_id: string;
  acronym: string;
  source_file: string;
  source_row: number;
  test_id: string | null;
  test_date: string | null;
  gmt_day_of_year: string | null;
  fuel_name: string;
  fuel_formula: string | null;
  fuel_class: string;
  fuel_composition: string | null;
  sample_description: string | null;
  geometry: string;
  flame_type: string;
  sample_thickness_mm: number | null;
  sample_size_mm: string | null;
  flow_cm_s: number | null;
  flow_direction: string | null;
  o2_pct: number | null;
  o2_pct_low: number | null;
  o2_pct_high: number | null;
  o2_pct_final: number | null;
  o2_basis: string;
  pressure_kpa: number | null;
  pressure_kpa_low: string | null;
  pressure_kpa_high: string | null;
  pressure_basis: string;
  n2_frac: number | null;
  he_frac: number | null;
  co2_frac: number | null;
  ppo2_kpa: number | null;
  gravity_regime: string;
  platform: string;
  hardware: string;
  outcome: string;
  burn_time_s: number | null;
  habitat_relevance_tier: string;
  measurements_json: Record<string, unknown>;
  quality_flags: string[];
  source_ids: string[];
}

export interface InvestigationsRow {
  investigation_id: string;
  acronym: string;
  title: string;
  data_origin: string;
  in_scope: boolean;
  platform: string | null;
  hardware: string | null;
  research_area: string;
  sub_area: string | null;
  managing_center: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  fire_safety_roles: string | null;
  role_curation_note: string;
  keywords: string | null;
  objective: string;
  hypothesis: string | null;
  approach: string | null;
  research_impacts_earth_benefits: string | null;
  n_publications: number | null;
  principal_investigators: string | null;
  doi: string | null;
  psi_url: string | null;
}

export interface InvestigationEnvelopeRow {
  investigation_id: string;
  n_cards: number;
  n_cards_with_o2_and_pressure: number;
  o2_pct_min: number | null;
  o2_pct_max: number | null;
  pressure_kpa_min: number | null;
  pressure_kpa_max: number | null;
  closest_card_id: string | null;
  closest_distance_to_8p2psi_34pct: number | null;
  closest_o2_pct: number | null;
  closest_pressure_kpa: number | null;
  n_tier_A: number;
  n_tier_B: number;
  n_tier_C: number;
  n_tier_D: number;
  n_tier_F: number;
  n_tier_E: number;
  fuel_classes: string;
  fuel_names: string;
  best_tier: string;
}

export interface HabitatAtmospheresRow {
  habitat_id: string;
  name: string;
  role: string;
  pressure_psia: number;
  pressure_kpa: number;
  o2_pct: number;
  n2_pct: number;
  ppo2_kpa: number;
  ppo2_basis: string;
  note: string;
  source_ids: string[];
}

export interface FamilyTreeEdgesRow {
  edge_id: string;
  source_investigation: string;
  target_investigation: string;
  edge_type: string;
  shared_items: string;
  weight: number;
  basis: string;
  evidence_source_ids: string[];
  directed: boolean;
}

export interface FindingsRow {
  finding_id: string;
  area: string;
  subarea: string;
  statement: string;
  quantitative_detail: string | null;
  linked_investigations: string[];
  earth_domain: string | null;
  source_ids: string[];
}

export interface TestCampaignsRow {
  campaign_id: string;
  investigation_id: string;
  acronym: string;
  record_type: string;
  date: string | null;
  test_day_code: string | null;
  fuel: string | null;
  fuel_concentration_text: string | null;
  o2_text: string | null;
  o2_pct_low: number | null;
  o2_pct_high: number | null;
  pressure_atm_low: number | null;
  pressure_atm_high: number | null;
  n_flames_ignited: string | null;
  burner_or_hardware_note: string | null;
  notes: string | null;
  source_file: string;
  source_row: number;
  source_ids: string[];
}

export interface TestPlatformsRow {
  platform_id: string;
  platform: string;
  duration: string | null;
  gravity_g: string;
  o2_pct: string;
  pressure_psia: string;
  status: string;
  source_ids: string[];
}

export interface SourcesRow {
  source_id: string;
  source_type: string;
  title: string;
  url: string;
  nasa_id: string;
  retrieved: string;
}

export interface KnownDiscrepanciesRow {
  investigation: string;
  record: string;
  field: string;
  psi_or_primary_value: string;
  conflicting_or_expected_value: string;
  handling: string;
}

export interface PublicationsRow {
  investigation_id: string;
  title: string;
  doi: string | null;
  authors: string;
}

export interface RejectedRowsRow {
  source_file: string;
  source_row: string;
  reason: string;
  raw: string | null;
}

export interface QaReconciliationRow {
  source_file: string;
  raw_records: string;
  cards_or_campaign_rows: string;
}

export const columnDescriptions: Record<string, Record<string, string>> = {
  "burn_cards": {
    "card_id": "Unique burn card ID",
    "data_origin": "PSI_repository or NASA_publication",
    "investigation_id": "Investigation ID (PSI-nnn or a name for publication-only missions)",
    "acronym": "Investigation acronym",
    "source_file": "Raw table the row came from",
    "source_row": "Row number in the raw table",
    "test_id": "Test or sample identifier as printed",
    "test_date": "Test date (ISO) where known",
    "gmt_day_of_year": "GMT day of year where printed",
    "fuel_name": "Fuel or sample material",
    "fuel_formula": "Chemical formula where applicable",
    "fuel_class": "gas, liquid, solid, etc.",
    "fuel_composition": "Composition text",
    "sample_description": "Free-text sample description",
    "geometry": "Sample or flame geometry",
    "flame_type": "Flame type (diffusion, spread, droplet, etc.)",
    "sample_thickness_mm": "Sample thickness in mm",
    "sample_size_mm": "Sample size in mm",
    "flow_cm_s": "Flow velocity cm/s",
    "flow_direction": "Flow direction relative to spread",
    "o2_pct": "Oxygen % (point value; midpoint when a range)",
    "o2_pct_low": "O2 % lower bound",
    "o2_pct_high": "O2 % upper bound",
    "o2_pct_final": "O2 % at end of test",
    "o2_basis": "measured, nominal, derived or range",
    "pressure_kpa": "Pressure kPa (point value)",
    "pressure_kpa_low": "Pressure lower bound kPa",
    "pressure_kpa_high": "Pressure upper bound kPa",
    "pressure_basis": "measured, nominal, derived or range",
    "n2_frac": "N2 fraction",
    "he_frac": "He fraction",
    "co2_frac": "CO2 fraction",
    "ppo2_kpa": "Oxygen partial pressure kPa (computed from o2 and pressure)",
    "gravity_regime": "microgravity, lunar or earth",
    "platform": "Platform (ISS, Cygnus, etc.)",
    "hardware": "Hardware",
    "outcome": "Outcome (ignited, extinguished, etc.)",
    "burn_time_s": "Burn time in seconds",
    "habitat_relevance_tier": "Tier A to F against 8.2 psi / 34% O2 (see README)",
    "measurements_json": "Other measurements as JSON",
    "quality_flags": "Semicolon-separated data-quality flags",
    "source_ids": "Semicolon-separated source IDs (see sources.csv)"
  },
  "investigations": {
    "investigation_id": "Investigation ID (PSI-nnn or a name for publication-only missions)",
    "acronym": "Acronym",
    "title": "Title",
    "data_origin": "PSI_repository or NASA_publication",
    "in_scope": "true if relevant to fire safety",
    "platform": "Platform (ISS, Cygnus, etc.)",
    "hardware": "Hardware",
    "research_area": "NASA research area",
    "sub_area": "NASA sub-area",
    "managing_center": "Managing NASA center",
    "start_date": "Start date",
    "end_date": "End date",
    "status": "completed, flown or planned",
    "fire_safety_roles": "Curated roles in fire safety",
    "role_curation_note": "How roles were assigned",
    "keywords": "Keywords",
    "objective": "Objective",
    "hypothesis": "Hypothesis",
    "approach": "Approach",
    "research_impacts_earth_benefits": "Earth benefits text",
    "n_publications": "Publication count",
    "principal_investigators": "Principal investigators",
    "doi": "DOI",
    "psi_url": "PSI page URL"
  },
  "investigation_envelope": {
    "investigation_id": "Investigation ID",
    "n_cards": "Number of burn cards",
    "n_cards_with_o2_and_pressure": "Cards having both O2 and pressure",
    "o2_pct_min": "Minimum O2 %",
    "o2_pct_max": "Maximum O2 %",
    "pressure_kpa_min": "Minimum pressure kPa",
    "pressure_kpa_max": "Maximum pressure kPa",
    "closest_card_id": "Card closest to the exploration atmosphere",
    "closest_distance_to_8p2psi_34pct": "Normalized distance sqrt(((o2-34)/10)^2+((p-56.5)/40)^2)",
    "closest_o2_pct": "O2 % of closest card",
    "closest_pressure_kpa": "Pressure of closest card (kPa)",
    "n_tier_A": "Cards in tier A",
    "n_tier_B": "Cards in tier B",
    "n_tier_C": "Cards in tier C",
    "n_tier_D": "Cards in tier D",
    "n_tier_F": "Cards in tier F",
    "n_tier_E": "Cards in tier E",
    "fuel_classes": "Fuel classes covered",
    "fuel_names": "Fuel names covered",
    "best_tier": "Best tier in the investigation"
  },
  "habitat_atmospheres": {
    "habitat_id": "Habitat ID",
    "name": "Name",
    "role": "Role",
    "pressure_psia": "Pressure psia",
    "pressure_kpa": "Pressure kPa (point value)",
    "o2_pct": "Oxygen %",
    "n2_pct": "N2 %",
    "ppo2_kpa": "Oxygen partial pressure kPa (computed from o2 and pressure)",
    "ppo2_basis": "How ppO2 was derived",
    "note": "Note",
    "source_ids": "Semicolon-separated source IDs (see sources.csv)"
  },
  "family_tree_edges": {
    "edge_id": "Edge ID",
    "source_investigation": "Edge source",
    "target_investigation": "Edge target",
    "edge_type": "Relationship type",
    "shared_items": "Shared hardware, fuel or description",
    "weight": "Number of shared items or 1",
    "basis": "How the edge was established",
    "evidence_source_ids": "Source IDs",
    "directed": "true if direction matters"
  },
  "findings": {
    "finding_id": "Finding ID",
    "area": "Finding area",
    "subarea": "Sub-area or topic",
    "statement": "Paraphrased statement",
    "quantitative_detail": "Quantitative detail",
    "linked_investigations": "Linked investigations",
    "earth_domain": "Earth application domain",
    "source_ids": "Semicolon-separated source IDs (see sources.csv)"
  },
  "test_campaigns": {
    "campaign_id": "Unique campaign row ID",
    "investigation_id": "Investigation ID (PSI-nnn or a name for publication-only missions)",
    "acronym": "Investigation acronym",
    "record_type": "daily_summary, planned_matrix or instrument_session",
    "date": "Date",
    "test_day_code": "Test day code",
    "fuel": "Fuel",
    "fuel_concentration_text": "Fuel concentration text",
    "o2_text": "O2 as printed",
    "o2_pct_low": "O2 % lower bound",
    "o2_pct_high": "O2 % upper bound",
    "pressure_atm_low": "Pressure low (atm)",
    "pressure_atm_high": "Pressure high (atm)",
    "n_flames_ignited": "Number of flames ignited",
    "burner_or_hardware_note": "Burner or hardware note",
    "notes": "Notes",
    "source_file": "Raw table the row came from",
    "source_row": "Row number in the raw table",
    "source_ids": "Semicolon-separated source IDs (see sources.csv)"
  },
  "test_platforms": {
    "platform_id": "Platform ID",
    "platform": "Platform (ISS, Cygnus, etc.)",
    "duration": "Test duration",
    "gravity_g": "Gravity level (g)",
    "o2_pct": "Oxygen % of the test atmosphere",
    "pressure_psia": "Pressure in psia",
    "status": "completed, flown or planned",
    "source_ids": "Semicolon-separated source IDs (see sources.csv)"
  },
  "sources": {
    "source_id": "Source ID (S-numbers for NASA reports; PSI-nnn for PSI pages)",
    "source_type": "Type of source",
    "title": "Title",
    "url": "URL",
    "nasa_id": "NASA document ID or DOI",
    "retrieved": "Date retrieved"
  },
  "known_discrepancies": {
    "investigation": "Investigation",
    "record": "Affected record",
    "field": "Affected field",
    "psi_or_primary_value": "Value in primary source",
    "conflicting_or_expected_value": "Conflicting or expected value",
    "handling": "How handled"
  },
  "publications": {
    "investigation_id": "Investigation ID (PSI-nnn or a name for publication-only missions)",
    "title": "Title",
    "doi": "DOI",
    "authors": "Authors"
  },
  "rejected_rows": {
    "source_file": "Raw table the row came from",
    "source_row": "Row number in the raw table",
    "reason": "Rejection reason",
    "raw": "Raw row text"
  },
  "qa_reconciliation": {
    "source_file": "Raw table the row came from",
    "raw_records": "Raw records in the source file",
    "cards_or_campaign_rows": "Rows produced"
  }
};
