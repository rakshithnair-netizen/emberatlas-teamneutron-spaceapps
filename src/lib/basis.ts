export type GravityRegime = "microgravity" | "lunar" | "earth";
export type QueryGravity = GravityRegime | "mars";
export type BasisKind = "measured" | "range" | "approximate" | "nominal" | "missing";

export const gravityLabels: Record<QueryGravity, string> = {
  microgravity: "Microgravity",
  lunar: "Lunar (0.165 g)",
  mars: "Mars (0.38 g)",
  earth: "Earth (1 g)",
};

export function normalizeGravity(regime: string | null | undefined): GravityRegime {
  const value = (regime ?? "").toLowerCase();
  if (value.startsWith("lunar")) return "lunar";
  if (value.startsWith("earth")) return "earth";
  return "microgravity";
}

export function basisKind(basis: string | null | undefined, hasRange = false): BasisKind {
  if (hasRange) return "range";
  const value = (basis ?? "").toLowerCase();
  if (!value || value === "not_stated") return "missing";
  if (value.startsWith("platform_nominal")) return "nominal";
  if (value.includes("approx") || value.includes("assumed")) return "approximate";
  if (value.startsWith("stated") || value.startsWith("flight value")) return "measured";
  return "approximate";
}

export function isSolidBasis(kind: BasisKind): boolean {
  return kind === "measured" || kind === "range";
}

export const basisLabels: Record<BasisKind, string> = {
  measured: "Stated in source",
  range: "Range stated in source",
  approximate: "Approximate or assumed",
  nominal: "Platform nominal, not measured",
  missing: "Not reported",
};

export const datasetTierLabels: Record<string, { short: string; label: string }> = {
  A_exploration_atmosphere_range: { short: "A", label: "Exploration-atmosphere range" },
  B_elevated_O2_normal_pressure: { short: "B", label: "Elevated O₂, normal pressure" },
  C_reduced_pressure_normal_O2: { short: "C", label: "Reduced pressure, normal O₂" },
  D_ambient_reference: { short: "D", label: "Ambient reference" },
  F_beyond_exploration_O2: { short: "F", label: "Beyond exploration O₂" },
  E_not_assessable: { short: "E", label: "Not assessable (missing O₂ or pressure)" },
};

export const qualityFlagLabels: Record<string, string> = {
  o2_and_pressure_from_platform_nominal: "O₂ and pressure are the platform's nominal values, not measured",
  year_not_in_table: "Test year not given in the source table",
  burn_rate_unit_unclear: "Burn-rate unit printed ambiguously; kept as raw value",
  co2_header_says_CO: "Column printed as CO, interpreted as CO₂ (FLEX suppressant)",
  pressure_from_platform_nominal: "Pressure is the platform's nominal value, not measured",
  o2_not_stated: "O₂ not stated in source",
  material_not_stated: "Sample material not stated in source",
  gmt_time_missing_or_LOS: "GMT time missing or loss of signal",
  ramped_fuel_flow: "Fuel flow was ramped during the test",
  pressure_from_initial_only: "Only the initial pressure was reported",
  pressure_from_flight_S02: "Pressure taken from flight values in NASA report S02",
  o2_approximate: "O₂ value is approximate",
  o2_missing: "O₂ missing",
  support_not_stated: "Droplet support method not stated",
  negative_flow_invalid: "Negative flow printed; blanked as invalid",
  flame_off_before_ignition_burn_time_dropped: "Flame-off before ignition; burn time dropped",
  o2_final_outlier: "Final O₂ differs from initial by more than 5 points",
  results_table_recheck_against_pdf: "Published results table not re-verified against the PDF",
  conditions_by_reference_to_samples_1_to_4: "Conditions given by reference to samples 1–4",
  thickness_unit_suspect_printed_cm: "Thickness unit suspect (printed as cm)",
  pressure_stated_as_normal_pressure_air: "Pressure stated only as 'normal pressure (air)'; 1 atm assumed",
  o2_range_midpoint: "O₂ is the midpoint of a stated range",
  thickness_decimal_point_assumed: "Decimal point in thickness assumed (printed '037 mm')",
  o2_reported_as_LOW_O2: "O₂ printed as text 'LOW O2'; left blank",
  length_width_swapped_in_source_corrected_vs_S02: "Length and width swapped in source; corrected against S02",
  material_filled_from_merged_cell: "Material filled from a merged table cell",
  flow_conflict_with_S02_25_cm_s: "Flow conflicts with S02 (25 cm/s); PSI value kept",
  o2_not_in_table: "O₂ not in the results table",
  pressure_zero_invalid: "Pressure printed as 0 mmHg; blanked as invalid",
  two_materials_in_one_row: "Two materials reported in one row",
};

export function describeFlag(flag: string): string {
  return qualityFlagLabels[flag] ?? flag.replace(/_/g, " ");
}

export const outcomeLabels: Record<string, string> = {
  not_stated: "Not stated",
  burned: "Burned",
  extinguished: "Extinguished",
  self_extinguished: "Self-extinguished",
  flow_terminated: "Flow terminated",
  did_not_ignite: "Did not ignite",
  disrupted: "Disrupted",
  burned_to_completion: "Burned to completion",
  smoke_generated: "Smoke generated",
  no_sustained_flame: "No sustained flame",
};
