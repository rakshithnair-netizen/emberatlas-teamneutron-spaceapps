import { describe, expect, it } from "vitest";
import { burnCards, discrepancies, findings, habitats, investigations } from "../data";
import { basisKind, normalizeGravity } from "../basis";
import { discrepanciesForCard } from "../discrepancy";
import { classifyEvidence } from "../evidence";
import { conditionDistance, convexHull, habitatDistance, kpaToPsia, pointInConvexPolygon, ppO2Kpa, psiaToKpa } from "../geometry";
import { defaultWeights, rankInsights, rerank } from "../ranking";
import type { EvidenceCardInput } from "../evidence";

function card(overrides: Partial<EvidenceCardInput>): EvidenceCardInput {
  return {
    card_id: "T-1",
    acronym: "TEST",
    investigation_id: "T",
    fuel_class: "solid",
    fuel_name: "PMMA",
    o2_pct: 21,
    o2_basis: "stated",
    pressure_kpa: 101.3,
    pressure_basis: "stated",
    gravity_regime: "microgravity",
    ...overrides,
  };
}

describe("units", () => {
  it("converts psia to kPa with 6.894757", () => {
    expect(psiaToKpa(1)).toBeCloseTo(6.894757, 6);
    expect(psiaToKpa(8.2)).toBeCloseTo(56.537, 3);
    expect(psiaToKpa(14.7)).toBeCloseTo(101.353, 3);
  });
  it("round-trips kPa and psia", () => {
    expect(kpaToPsia(psiaToKpa(10.2))).toBeCloseTo(10.2, 10);
    expect(kpaToPsia(56.5)).toBeCloseTo(8.1946, 3);
  });
  it("computes ppO2", () => {
    expect(ppO2Kpa(34, 56.5)).toBeCloseTo(19.21, 2);
  });
});

describe("habitat distance", () => {
  it("is zero at the exploration atmosphere", () => {
    expect(habitatDistance(34, 56.5)).toBe(0);
  });
  it("matches the dataset formula", () => {
    expect(habitatDistance(21, 101.325)).toBeCloseTo(Math.sqrt(1.3 ** 2 + (44.825 / 40) ** 2), 10);
    expect(conditionDistance(44, 56.5, 34, 56.5)).toBe(1);
    expect(conditionDistance(34, 96.5, 34, 56.5)).toBe(1);
  });
  it("reproduces investigation_envelope closest distances", () => {
    const card = burnCards.find((entry) => entry.card_id === "LUCI-0004")!;
    expect(habitatDistance(card.o2_pct!, card.pressure_kpa!)).toBeCloseTo(1.716, 3);
  });
});

describe("hull geometry", () => {
  const square: [number, number][] = [
    [0, 0],
    [2, 0],
    [2, 2],
    [0, 2],
    [1, 1],
  ];
  it("drops interior points", () => {
    expect(convexHull(square)).toHaveLength(4);
  });
  it("tests containment", () => {
    const hull = convexHull(square);
    expect(pointInConvexPolygon([1, 1], hull)).toBe(true);
    expect(pointInConvexPolygon([3, 1], hull)).toBe(false);
  });
});

describe("basis and gravity", () => {
  it("normalizes gravity strings", () => {
    expect(normalizeGravity("lunar (0.165 g, rotating capsule)")).toBe("lunar");
    expect(normalizeGravity("earth (1 g, ground control)")).toBe("earth");
    expect(normalizeGravity("microgravity")).toBe("microgravity");
  });
  it("classifies basis", () => {
    expect(basisKind("stated")).toBe("measured");
    expect(basisKind("platform_nominal (MSG 14.7 psi, S06)")).toBe("nominal");
    expect(basisKind("stated (approx)")).toBe("approximate");
    expect(basisKind("not_stated")).toBe("missing");
    expect(basisKind("stated", true)).toBe("range");
  });
});

describe("classifyEvidence on synthetic cards", () => {
  const grid = [
    card({ card_id: "A", o2_pct: 21, pressure_kpa: 101 }),
    card({ card_id: "B", o2_pct: 30, pressure_kpa: 101 }),
    card({ card_id: "C", o2_pct: 21, pressure_kpa: 50 }),
    card({ card_id: "D", o2_pct: 30, pressure_kpa: 50 }),
  ];
  it("returns measured near a stated card", () => {
    const result = classifyEvidence({ o2Pct: 30.5, pressureKpa: 52, gravity: "microgravity", fuelClass: "solid" }, grid);
    expect(result.tier).toBe("measured");
    expect(result.nearestCards[0].card.card_id).toBe("D");
  });
  it("does not call a nominal-basis neighbour measured", () => {
    const nominal = [card({ card_id: "N", o2_pct: 30, pressure_kpa: 50, o2_basis: "platform_nominal (cabin air, MSG, S06)" })];
    const result = classifyEvidence({ o2Pct: 30, pressureKpa: 50, gravity: "microgravity", fuelClass: "solid" }, nominal);
    expect(result.tier).not.toBe("measured");
  });
  it("returns interpolated inside coverage", () => {
    const result = classifyEvidence({ o2Pct: 25.5, pressureKpa: 75, gravity: "microgravity", fuelClass: "solid" }, grid);
    expect(result.tier).toBe("interpolated");
  });
  it("returns extrapolated with direction outside coverage", () => {
    const result = classifyEvidence({ o2Pct: 40, pressureKpa: 75, gravity: "microgravity", fuelClass: "solid" }, grid);
    expect(result.tier).toBe("extrapolated");
    expect(result.directions[0]).toContain("+10 O₂ points beyond the highest solid-fuel microgravity test");
  });
  it("returns analog when only another regime exists", () => {
    const result = classifyEvidence({ o2Pct: 21, pressureKpa: 101, gravity: "mars", fuelClass: "solid" }, grid);
    expect(result.tier).toBe("analog");
    expect(result.gapStatement).toContain("No card in the dataset was tested in mars");
  });
  it("returns no data with no cards", () => {
    const result = classifyEvidence({ o2Pct: 34, pressureKpa: 56.5, gravity: "microgravity" }, []);
    expect(result.tier).toBe("no_data");
    expect(result.nearestCards).toHaveLength(0);
    expect(result.closeGapStatement.length).toBeGreaterThan(10);
  });
});

describe("classifyEvidence on the dataset", () => {
  it("finds measured evidence at the exploration atmosphere for any fuel", () => {
    const result = classifyEvidence({ o2Pct: 34, pressureKpa: 56.5, gravity: "microgravity", fuelClass: "any" }, burnCards);
    expect(result.tier).toBe("measured");
    expect(result.nearestCards[0].card.card_id).toBe("PSI-159-0128");
    const investigationsNear = new Set(result.nearestCards.map((entry) => entry.card.investigation_id));
    expect(investigationsNear.has("PSI-159")).toBe(true);
  });
  it("reports solids above 31% O2 as beyond the highest test", () => {
    const result = classifyEvidence({ o2Pct: 40, pressureKpa: 56.5, gravity: "microgravity", fuelClass: "solid" }, burnCards);
    expect(result.tier).toBe("extrapolated");
    expect(result.nearestCards[0].card.investigation_id).toBe("SAFFIRE-VI");
    expect(result.gapStatement).toContain("+9 O₂ points beyond the highest solid-fuel microgravity test (31% O₂)");
  });
  it("shows lunar scarcity: only LUCI at 20-21% O2", () => {
    const result = classifyEvidence({ o2Pct: 34, pressureKpa: 56.5, gravity: "lunar", fuelClass: "solid" }, burnCards);
    expect(result.tier).toBe("extrapolated");
    expect(result.comparisonSetSize).toBe(2);
    expect(result.nearestCards.every((entry) => entry.card.acronym === "LUCI")).toBe(true);
    expect(result.closeGapStatement).toContain("FM2");
  });
  it("labels Mars gravity as analog only", () => {
    const result = classifyEvidence({ o2Pct: 34, pressureKpa: 56.5, gravity: "mars" }, burnCards);
    expect(result.tier).toBe("analog");
  });
});

describe("discrepancies", () => {
  it("attaches the BASS-II final-oxygen outlier to its card only", () => {
    const flagged = burnCards.filter((entry) => entry.quality_flags.includes("o2_final_outlier"));
    expect(flagged.length).toBe(5);
    for (const entry of flagged) expect(discrepanciesForCard(entry, discrepancies)).toHaveLength(1);
  });
  it("attaches FLEX header caveat to FLEX rows", () => {
    const flex = burnCards.find((entry) => entry.investigation_id === "PSI-69")!;
    expect(discrepanciesForCard(flex, discrepancies).some((entry) => entry.field.includes("CO column"))).toBe(true);
  });
});

describe("rankInsights", () => {
  const exploration = habitats.find((habitat) => habitat.habitat_id === "HAB-03")!;
  const ranked = rankInsights(exploration, { findings, investigations, cards: burnCards });
  it("scores every finding and every in-scope investigation with cards", () => {
    expect(ranked.filter((insight) => insight.kind === "finding")).toHaveLength(findings.length);
    expect(ranked.every((insight) => insight.score >= 0 && insight.score <= 1)).toBe(true);
  });
  it("is sorted descending", () => {
    for (let index = 1; index < ranked.length; index++) expect(ranked[index - 1].score).toBeGreaterThanOrEqual(ranked[index].score);
  });
  it("ranks safety findings above earth applications by default", () => {
    const topTen = ranked.slice(0, 10);
    expect(topTen.some((insight) => insight.area === "earth_application")).toBe(false);
  });
  it("responds to weights", () => {
    const proximityOnly = rerank(ranked, { proximity: 1, evidence: 0, consequence: 0, gravity: 0, recency: 0 });
    expect(proximityOnly[0].components.proximity.value).toBeGreaterThanOrEqual(proximityOnly[1].components.proximity.value);
    expect(defaultWeights.proximity).toBeGreaterThan(0);
  });
});
