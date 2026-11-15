import { basisKind, gravityLabels, isSolidBasis, normalizeGravity, type QueryGravity } from "./basis";
import { conditionDistance, convexHull, O2_SCALE, PRESSURE_SCALE, pointInConvexPolygon, type Point } from "./geometry";
import type { ConditionQuery, EvidenceTier } from "./types";

export const MEASURED_DISTANCE = 0.35;
export const ANALOG_MAX_DISTANCE = 3;

export interface EvidenceCardInput {
  card_id: string;
  acronym: string;
  investigation_id: string;
  fuel_class: string;
  fuel_name: string;
  o2_pct: number | null;
  o2_pct_low?: number | null;
  o2_pct_high?: number | null;
  o2_basis: string;
  pressure_kpa: number | null;
  pressure_basis: string;
  gravity_regime: string;
  flow_cm_s?: number | null;
  quality_flags?: string[];
  source_ids?: string[];
}

export interface NearestCard<T extends EvidenceCardInput = EvidenceCardInput> {
  card: T;
  distance: number;
  deltaO2: number;
  deltaPressureKpa: number;
  deltaFlowCmS: number | null;
  sameRegime: boolean;
  sameFuelClass: boolean;
}

export interface EvidenceResult<T extends EvidenceCardInput = EvidenceCardInput> {
  tier: EvidenceTier;
  nearestCards: NearestCard<T>[];
  distance: number | null;
  gapStatement: string;
  closeGapStatement: string;
  directions: string[];
  comparisonSetSize: number;
}

export const evidenceTierMeta: Record<EvidenceTier, { label: string; description: string }> = {
  measured: { label: "Measured", description: "A burn was recorded at or very near this condition for the same gravity and fuel group." },
  interpolated: { label: "Interpolated", description: "Tests cover the conditions around this point for this fuel and gravity; this is an estimate between tests." },
  extrapolated: { label: "Extrapolated", description: "This condition is outside the tested range for this fuel and gravity, so an estimate extends beyond the tests." },
  analog: { label: "Analog", description: "No matching test exists for this fuel and gravity, but related tests may offer clues." },
  no_data: { label: "No data", description: "The dataset has no relevant tests for this question." },
};

function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function hasLocation(card: EvidenceCardInput): card is EvidenceCardInput & { o2_pct: number; pressure_kpa: number } {
  return typeof card.o2_pct === "number" && typeof card.pressure_kpa === "number";
}

function fuelLabel(fuelClass: ConditionQuery["fuelClass"]): string {
  return !fuelClass || fuelClass === "any" ? "" : `${fuelClass}-fuel `;
}

function regimeMatches(cardRegime: string, gravity: QueryGravity): boolean {
  return normalizeGravity(cardRegime) === gravity;
}

function normalizedPoint(o2: number, pressure: number): Point {
  return [pressure / PRESSURE_SCALE, o2 / O2_SCALE];
}

function rankCards<T extends EvidenceCardInput>(query: ConditionQuery, cards: T[]): NearestCard<T>[] {
  return cards
    .filter(hasLocation)
    .map((card) => ({
      card,
      distance: conditionDistance(card.o2_pct as number, card.pressure_kpa as number, query.o2Pct, query.pressureKpa),
      deltaO2: (card.o2_pct as number) - query.o2Pct,
      deltaPressureKpa: (card.pressure_kpa as number) - query.pressureKpa,
      deltaFlowCmS:
        typeof query.flowCmS === "number" && typeof card.flow_cm_s === "number" ? card.flow_cm_s - query.flowCmS : null,
      sameRegime: regimeMatches(card.gravity_regime, query.gravity),
      sameFuelClass: !query.fuelClass || query.fuelClass === "any" || card.fuel_class === query.fuelClass,
    }))
    .sort((a, b) => a.distance - b.distance);
}

function describeDirections<T extends EvidenceCardInput>(query: ConditionQuery, set: NearestCard<T>[]): string[] {
  if (!set.length) return [];
  const o2Values = set.map((entry) => entry.card.o2_pct as number);
  const pressureValues = set.map((entry) => entry.card.pressure_kpa as number);
  const maxO2 = Math.max(...o2Values);
  const minO2 = Math.min(...o2Values);
  const maxPressure = Math.max(...pressureValues);
  const minPressure = Math.min(...pressureValues);
  const scope = `${fuelLabel(query.fuelClass)}${gravityLabels[query.gravity].toLowerCase()} test`;
  const directions: string[] = [];
  if (query.o2Pct > maxO2) directions.push(`+${round(query.o2Pct - maxO2)} O₂ points beyond the highest ${scope} (${round(maxO2)}% O₂)`);
  if (query.o2Pct < minO2) directions.push(`${round(minO2 - query.o2Pct)} O₂ points below the lowest ${scope} (${round(minO2)}% O₂)`);
  if (query.pressureKpa < minPressure) directions.push(`${round(minPressure - query.pressureKpa)} kPa below the lowest-pressure ${scope} (${round(minPressure)} kPa)`);
  if (query.pressureKpa > maxPressure) directions.push(`${round(query.pressureKpa - maxPressure)} kPa above the highest-pressure ${scope} (${round(maxPressure)} kPa)`);
  return directions;
}

function closeGap(query: ConditionQuery): string {
  const fuel = !query.fuelClass || query.fuelClass === "any" ? "Material" : `${query.fuelClass[0].toUpperCase()}${query.fuelClass.slice(1)}-fuel`;
  const base = `${fuel} flammability test at about ${round(query.o2Pct)}% O₂ and about ${round(query.pressureKpa)} kPa in ${gravityLabels[query.gravity].toLowerCase()}`;
  const partial = query.gravity === "lunar" || query.gravity === "mars";
  const solidLike = !query.fuelClass || query.fuelClass === "any" || query.fuelClass === "solid";
  if (partial && solidLike) {
    return `${base}. FM2 is planned to burn acrylic rods at 34% O₂ / 8.2 psia in lunar gravity (F038); its O₂ condition conflicts between sources (F039) and flight status is unconfirmed.`;
  }
  if (query.fuelClass === "solid" && query.o2Pct > 31) {
    return `${base}. No flown or planned microgravity solid test in the dataset exceeds 31% O₂ (SAFFIRE-VI).`;
  }
  return `${base}.`;
}

export function classifyEvidence<T extends EvidenceCardInput>(query: ConditionQuery, cards: T[], limit = 5): EvidenceResult<T> {
  const ranked = rankCards(query, cards);
  const comparison = ranked.filter((entry) => entry.sameRegime && entry.sameFuelClass);
  const regimeText = gravityLabels[query.gravity].toLowerCase();
  const fuelText = fuelLabel(query.fuelClass);
  const conditionText = `${round(query.o2Pct)}% O₂ at ${round(query.pressureKpa)} kPa`;

  if (comparison.length) {
    const nearest = comparison[0];
    const nearestBasis = basisKind(nearest.card.o2_basis, nearest.card.o2_pct_low != null);
    const pressureBasis = basisKind(nearest.card.pressure_basis);
    const directions = describeDirections(query, comparison);
    const nearestText = `Nearest ${fuelText}card ${nearest.card.card_id} (${nearest.card.acronym}) is at ${round(nearest.card.o2_pct as number)}% O₂, ${round(nearest.card.pressure_kpa as number)} kPa, distance ${round(nearest.distance, 2)}.`;
    if (nearest.distance <= MEASURED_DISTANCE && isSolidBasis(nearestBasis) && pressureBasis !== "nominal") {
      return {
        tier: "measured",
        nearestCards: comparison.slice(0, limit),
        distance: nearest.distance,
        directions,
        comparisonSetSize: comparison.length,
        gapStatement: `${nearestText}${directions.length ? ` The query is ${directions.join("; ")}.` : ""}`,
        closeGapStatement: directions.length ? closeGap(query) : "Repeat tests at this condition would tighten the estimate.",
      };
    }
    const hull = convexHull(comparison.map((entry) => normalizedPoint(entry.card.o2_pct as number, entry.card.pressure_kpa as number)));
    const inside = pointInConvexPolygon(normalizedPoint(query.o2Pct, query.pressureKpa), hull);
    if (inside) {
      return {
        tier: "interpolated",
        nearestCards: comparison.slice(0, limit),
        distance: nearest.distance,
        directions,
        comparisonSetSize: comparison.length,
        gapStatement: `${conditionText} lies inside the coverage of ${comparison.length} ${fuelText}${regimeText} cards, but no card is within ${MEASURED_DISTANCE} with a stated basis. ${nearestText}`,
        closeGapStatement: closeGap(query),
      };
    }
    return {
      tier: "extrapolated",
      nearestCards: comparison.slice(0, limit),
      distance: nearest.distance,
      directions,
      comparisonSetSize: comparison.length,
      gapStatement: `${conditionText} is outside the coverage of ${comparison.length} ${fuelText}${regimeText} cards${directions.length ? `: ${directions.join("; ")}` : ""}. ${nearestText}`,
      closeGapStatement: closeGap(query),
    };
  }

  const analogs = ranked.filter((entry) => entry.distance <= ANALOG_MAX_DISTANCE);
  if (analogs.length) {
    const nearest = analogs[0];
    const why = !ranked.some((entry) => entry.sameRegime)
      ? `No card in the dataset was tested in ${regimeText}`
      : `No ${fuelText}card was tested in ${regimeText}`;
    return {
      tier: "analog",
      nearestCards: analogs.slice(0, limit),
      distance: nearest.distance,
      directions: [],
      comparisonSetSize: 0,
      gapStatement: `${why}. The nearest related card is ${nearest.card.card_id} (${nearest.card.acronym}, ${nearest.card.fuel_class}, ${normalizeGravity(nearest.card.gravity_regime)}) at distance ${round(nearest.distance, 2)}; treat it as an analog, not a measurement.`,
      closeGapStatement: closeGap(query),
    };
  }

  return {
    tier: "no_data",
    nearestCards: [],
    distance: null,
    directions: [],
    comparisonSetSize: 0,
    gapStatement: `No card in the dataset is relevant to ${fuelText}${conditionText} in ${regimeText}.`,
    closeGapStatement: closeGap(query),
  };
}
