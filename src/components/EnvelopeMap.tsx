"use client";

import { useEffect, useMemo, useState } from "react";
import type { Data, Layout, PlotMouseEvent } from "plotly.js";
import { basisKind, isSolidBasis, normalizeGravity, type GravityRegime } from "@/lib/basis";
import { distanceEllipse } from "@/lib/geometry";
import type { BurnCard, HabitatAtmosphere } from "@/lib/types";
import { PlotlyChart, darkAxis } from "./PlotlyChart";

export const fuelColors: Record<string, string> = { gas: "#ff8a4c", liquid: "#b294ff", solid: "#f5d04c" };
const gravitySymbols: Record<GravityRegime, string> = { microgravity: "circle", lunar: "diamond", earth: "square" };

export interface Hull {
  fuelClass: string;
  gravity: string;
  count: number;
  points: [number, number][];
}

export interface EnvelopeOptions {
  logX: boolean;
  showHulls: boolean;
  gravityOverlay: boolean;
  showIsoPpo2: boolean;
  fuelClasses: string[];
}

function hoverText(card: BurnCard): string {
  const o2Basis = basisKind(card.o2_basis, card.o2_pct_low !== null);
  const pressureBasis = basisKind(card.pressure_basis);
  const approxO2 = isSolidBasis(o2Basis) ? "" : "≈";
  const approxP = isSolidBasis(pressureBasis) ? "" : "≈";
  return [
    `<b>${card.card_id}</b> · ${card.acronym}`,
    `${card.fuel_name} (${card.fuel_class})`,
    `O₂ ${approxO2}${card.o2_pct}% · ${approxP}${card.pressure_kpa} kPa`,
    `${normalizeGravity(card.gravity_regime)} · ${card.outcome.replace(/_/g, " ")}`,
    `tier ${card.habitat_relevance_tier.split("_")[0]}${card.quality_flags.length ? ` · ⚑ ${card.quality_flags.length} flag(s)` : ""}`,
  ].join("<br>");
}

export function EnvelopeMap({
  cards,
  hulls,
  habitats,
  selectedHabitat,
  options,
  highlightIds,
  query,
  onSelectCard,
  height = 560,
}: {
  cards: BurnCard[];
  hulls: Hull[];
  habitats: HabitatAtmosphere[];
  selectedHabitat: HabitatAtmosphere;
  options: EnvelopeOptions;
  highlightIds?: string[];
  query?: { o2Pct: number; pressureKpa: number; color: string; label: string } | null;
  onSelectCard?: (card: BurnCard) => void;
  height?: number;
}) {
  const byId = useMemo(() => new Map(cards.map((card) => [card.card_id, card])), [cards]);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 640px)");
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const data = useMemo(() => {
    const traces: Data[] = [];
    const xMin = 20;
    const xMax = 520;

    if (options.showIsoPpo2) {
      for (const ppo2 of [10, 15, 19.2, 21.3, 30, 45]) {
        const xs: number[] = [];
        const ys: number[] = [];
        for (let step = 0; step <= 80; step++) {
          const pressure = xMin * Math.pow(xMax / xMin, step / 80);
          const o2 = (ppo2 * 100) / pressure;
          if (o2 <= 100 && o2 >= 5) {
            xs.push(pressure);
            ys.push(o2);
          }
        }
        traces.push({
          type: "scatter",
          mode: "lines",
          x: xs,
          y: ys,
          line: { color: ppo2 === 19.2 ? "rgba(34,211,238,0.35)" : "rgba(255,255,255,0.10)", width: 1, dash: "dot" },
          hoverinfo: "skip",
          name: `ppO₂ ${ppo2} kPa`,
          showlegend: false,
        });
      }
    }

    if (options.showHulls) {
      for (const hull of hulls.filter((entry) => entry.gravity === "microgravity" && options.fuelClasses.includes(entry.fuelClass) && entry.points.length >= 3)) {
        const closed = [...hull.points, hull.points[0]];
        traces.push({
          type: "scatter",
          mode: "lines",
          x: closed.map((point) => point[0]),
          y: closed.map((point) => point[1]),
          fill: "toself",
          fillcolor: `${fuelColors[hull.fuelClass]}14`,
          line: { color: `${fuelColors[hull.fuelClass]}66`, width: 1 },
          hoverinfo: "text",
          text: `${hull.fuelClass} coverage (${hull.count} microgravity cards)`,
          name: `${hull.fuelClass} coverage`,
          showlegend: false,
        });
      }
    }

    const rings = [
      { radius: 0.35, label: "d ≤ 0.35 (Measured zone)", color: "rgba(74,222,128,0.75)", fill: "rgba(74,222,128,0.07)" },
      { radius: 0.5, label: "d ≤ 0.5", color: "rgba(34,211,238,0.45)", fill: "rgba(0,0,0,0)" },
      { radius: 1, label: "d ≤ 1.0", color: "rgba(34,211,238,0.25)", fill: "rgba(0,0,0,0)" },
    ];
    for (const ring of rings) {
      const ellipse = distanceEllipse(selectedHabitat.o2_pct, selectedHabitat.pressure_kpa, ring.radius);
      const keep = ellipse.pressure.map((value) => value > 1);
      traces.push({
        type: "scatter",
        mode: "lines",
        x: ellipse.pressure.filter((_, index) => keep[index]),
        y: ellipse.o2.filter((_, index) => keep[index]),
        fill: ring.radius === 0.35 ? "toself" : "none",
        fillcolor: ring.fill,
        line: { color: ring.color, width: 1, dash: ring.radius === 0.35 ? "solid" : "dash" },
        hoverinfo: "text",
        text: `${ring.label} around ${selectedHabitat.name}`,
        name: ring.label,
        showlegend: false,
      });
    }

    const located = cards.filter((card) => card.o2_pct !== null && card.pressure_kpa !== null && options.fuelClasses.includes(card.fuel_class));
    const groups = new Map<string, BurnCard[]>();
    for (const card of located) {
      const gravity = normalizeGravity(card.gravity_regime);
      const solid = isSolidBasis(basisKind(card.o2_basis, card.o2_pct_low !== null)) && basisKind(card.pressure_basis) !== "nominal";
      const key = `${card.fuel_class}|${gravity}|${solid ? "stated" : "approx"}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(card);
    }
    const order = ["gas", "liquid", "solid"];
    const sortedKeys = [...groups.keys()].sort((a, b) => order.indexOf(a.split("|")[0]) - order.indexOf(b.split("|")[0]) || a.localeCompare(b));
    for (const key of sortedKeys) {
      const [fuelClass, gravity, basis] = key.split("|") as [string, GravityRegime, string];
      const members = groups.get(key)!;
      const micro = gravity === "microgravity";
      const dimmed = options.gravityOverlay && micro;
      const stated = basis === "stated";
      const hasRanges = members.some((card) => card.o2_pct_low !== null && card.o2_pct_high !== null);
      traces.push({
        type: "scatter",
        mode: "markers",
        x: members.map((card) => card.pressure_kpa as number),
        y: members.map((card) => card.o2_pct as number),
        customdata: members.map((card) => card.card_id),
        text: members.map(hoverText),
        hovertemplate: "%{text}<extra></extra>",
        name: `${fuelClass}${micro ? "" : ` · ${gravity}`}${stated ? "" : " (nominal/approx)"}`,
        legendgroup: fuelClass,
        marker: {
          color: stated ? fuelColors[fuelClass] : "rgba(0,0,0,0)",
          size: micro ? (dimmed ? 5 : 7) : 15,
          symbol: micro ? (stated ? gravitySymbols[gravity] : `${gravitySymbols[gravity]}-open`) : gravitySymbols[gravity],
          opacity: dimmed ? 0.12 : stated ? 0.85 : 0.55,
          line: { color: micro ? fuelColors[fuelClass] : "#ffffff", width: micro ? (stated ? 0 : 1.2) : 2 },
        },
        error_y: hasRanges
          ? {
              type: "data",
              symmetric: false,
              array: members.map((card) => (card.o2_pct_high !== null ? (card.o2_pct_high as number) - (card.o2_pct as number) : 0)),
              arrayminus: members.map((card) => (card.o2_pct_low !== null ? (card.o2_pct as number) - (card.o2_pct_low as number) : 0)),
              color: fuelColors[fuelClass],
              thickness: 1,
              width: 3,
            }
          : undefined,
      } as Data);
    }

    if (highlightIds?.length) {
      const highlighted = highlightIds.map((id) => byId.get(id)).filter((card): card is BurnCard => Boolean(card && card.o2_pct !== null && card.pressure_kpa !== null));
      traces.push({
        type: "scatter",
        mode: "markers",
        x: highlighted.map((card) => card.pressure_kpa as number),
        y: highlighted.map((card) => card.o2_pct as number),
        customdata: highlighted.map((card) => card.card_id),
        text: highlighted.map(hoverText),
        hovertemplate: "%{text}<extra>nearest</extra>",
        marker: { size: 16, color: "rgba(0,0,0,0)", line: { color: "#ffffff", width: 2 }, symbol: "circle-open" },
        name: "Nearest cards",
        showlegend: true,
      });
    }

    traces.push({
      type: "scatter",
      mode: "text+markers",
      x: habitats.map((habitat) => habitat.pressure_kpa),
      y: habitats.map((habitat) => habitat.o2_pct),
      text: habitats.map((habitat) => habitat.habitat_id),
      textposition: "top right",
      textfont: { color: "#22d3ee", size: 10, family: "var(--font-plex-mono), monospace" },
      hovertext: habitats.map((habitat) => `<b>${habitat.name}</b><br>${habitat.o2_pct}% O₂ · ${habitat.pressure_kpa} kPa (${habitat.pressure_psia} psia)<br>ppO₂ ${habitat.ppo2_kpa} kPa`),
      hovertemplate: "%{hovertext}<extra>habitat</extra>",
      marker: {
        size: habitats.map((habitat) => (habitat.habitat_id === selectedHabitat.habitat_id ? 26 : 16)),
        symbol: "cross-thin-open",
        color: "#22d3ee",
        line: { color: "#22d3ee", width: habitats.map((habitat) => (habitat.habitat_id === selectedHabitat.habitat_id ? 3 : 1.5)) as unknown as number },
      },
      name: "Habitat atmospheres",
    } as Data);

    if (query) {
      traces.push({
        type: "scatter",
        mode: "markers",
        x: [query.pressureKpa],
        y: [query.o2Pct],
        hovertemplate: `${query.label}<br>%{y}% O₂ · %{x} kPa<extra>query</extra>`,
        marker: { size: 18, symbol: "star", color: query.color, line: { color: "#06090d", width: 1.5 } },
        name: "Your query",
      });
    }
    return traces;
  }, [cards, hulls, habitats, selectedHabitat, options, highlightIds, query, byId]);

  const layout = useMemo<Partial<Layout>>(
    () => ({
      height,
      xaxis: {
        ...darkAxis,
        title: { text: options.logX ? "Pressure (kPa, log scale)" : "Pressure (kPa)" },
        type: options.logX ? "log" : "linear",
        range: options.logX ? [Math.log10(22), Math.log10(560)] : [20, 340],
        tickvals: options.logX ? [25, 30, 40, 56.5, 70, 101.3, 150, 200, 300, 500] : undefined,
        ticktext: options.logX ? ["25", "30", "40", "56.5", "70", "101", "150", "200", "300", "500"] : undefined,
      },
      yaxis: { ...darkAxis, title: { text: "Oxygen (% by volume)" }, range: [8, 60] },
      showlegend: !narrow,
      legend: { orientation: "h", y: 1.01, yanchor: "bottom", x: 0, bgcolor: "rgba(0,0,0,0)", font: { size: 11 } },
      margin: { l: 48, r: 8, t: narrow ? 12 : 64, b: 48 },
      dragmode: "pan",
    }),
    [options.logX, height, narrow],
  );

  const handleClick = (event: PlotMouseEvent) => {
    const id = event.points?.[0]?.customdata as unknown as string | undefined;
    if (id && byId.has(id)) onSelectCard?.(byId.get(id)!);
  };

  return (
    <PlotlyChart
      data={data}
      layout={layout}
      onPointClick={handleClick}
      className="w-full"
      ariaLabel={`Scatter plot of ${cards.length} burn cards by pressure and oxygen with habitat atmosphere markers. A text summary follows the chart.`}
    />
  );
}
