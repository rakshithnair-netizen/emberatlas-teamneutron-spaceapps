"use client";

import Link from "next/link";
import { useMemo } from "react";
import { conditionDistance } from "@/lib/geometry";
import { MEASURED_DISTANCE } from "@/lib/evidence";
import type { BurnCard } from "@/lib/types";
import { habitatList, useHabitat } from "./HabitatProvider";
import { useCards } from "./useCards";

// SVG viewBox size and plot margins; the SVG scales to its container, so these are logical units.
const WIDTH = 760;
const HEIGHT = 390;
const PAD = { left: 64, right: 22, top: 24, bottom: 54 };

// Home-page scatter of every located burn card (pressure on a log x-axis, O₂ % on y) with a star at
// the selected habitat. It is a lightweight hand-drawn SVG rather than Plotly so the home page stays light.
export function EvidenceGapChart() {
  const { cards, error } = useCards();
  const { habitat } = useHabitat();
  const analysis = useMemo(() => {
    if (!cards) return null;
    // Only cards with both coordinates can be plotted. Pressure must also be positive because the
    // x-axis is logarithmic and log(0) would break every position on the chart.
    const located = cards.filter((card): card is BurnCard & { o2_pct: number; pressure_kpa: number } => card.o2_pct !== null && card.pressure_kpa !== null && card.pressure_kpa > 0);
    const pressures = located.map((card) => card.pressure_kpa);
    // Axis ranges include every habitat preset, so switching habitats never moves the star off-chart.
    const allPressures = [...pressures, ...habitatList.map((entry) => entry.pressure_kpa)];
    const allO2 = [...located.map((card) => card.o2_pct), ...habitatList.map((entry) => entry.o2_pct)];
    const minPressure = Math.min(...allPressures);
    const maxPressure = Math.max(...allPressures);
    const maxO2 = Math.ceil(Math.max(...allO2) / 10) * 10;
    // Pure proximity count across all fuels and gravities. It deliberately does not assign a grade:
    // the Measured grade also needs the same gravity, fuel class and a stated basis (see lib/evidence.ts).
    const nearby = located.filter((card) => conditionDistance(card.o2_pct, card.pressure_kpa, habitat.o2_pct, habitat.pressure_kpa) <= MEASURED_DISTANCE).length;
    return { located, minPressure, maxPressure, maxO2, nearby };
  }, [cards, habitat]);

  if (error) return <p className="panel p-4 text-sm text-tier-extrapolated">{error}</p>;
  if (!analysis) return <div className="panel flex min-h-56 items-center justify-center p-5 text-sm text-muted">Loading the plotted test records…</div>;

  // Log-scale x mapping with 4% padding on each side so edge points are not clipped by the axis.
  const rawLogMin = Math.log(analysis.minPressure);
  const rawLogRange = Math.log(analysis.maxPressure) - rawLogMin || 1;
  const logMin = rawLogMin - rawLogRange * 0.04;
  const logRange = rawLogRange * 1.08;
  const x = (pressure: number) => PAD.left + ((Math.log(pressure) - logMin) / logRange) * (WIDTH - PAD.left - PAD.right);
  const y = (o2: number) => HEIGHT - PAD.bottom - (o2 / analysis.maxO2) * (HEIGHT - PAD.top - PAD.bottom);
  const ticks = Array.from({ length: 5 }, (_, index) => (analysis.maxO2 / 4) * index);
  const targetX = x(habitat.pressure_kpa);
  const targetY = y(habitat.o2_pct);

  return (
    <section className="panel overflow-hidden p-4 sm:p-5" aria-labelledby="gap-chart-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">NASA test coverage</p>
          <h2 id="gap-chart-title" className="mt-1 text-xl font-semibold">Where test conditions sit</h2>
        <p className="mt-1 text-sm text-muted">Each dot is one burn card with both oxygen and pressure reported. The star marks the selected target; scales include every habitat preset and plotted test.</p>
        </div>
        <Link href="/explorer" className="inline-flex min-h-11 items-center rounded-md border border-line px-3 text-sm text-habitat hover:border-habitat/60">Explore all evidence →</Link>
      </div>
      <div className="mt-3 overflow-x-auto" tabIndex={0} aria-label="Scrollable chart area">
        <p className="mb-2 text-xs text-muted sm:hidden">Swipe horizontally across the plot to inspect its full pressure range.</p>
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-labelledby="gap-chart-title gap-chart-desc" className="block h-auto min-w-[620px] w-full">
          <desc id="gap-chart-desc">Oxygen percent on the vertical axis and pressure in kilopascals on the horizontal axis. {analysis.located.length} NASA burn cards are plotted from the dataset. A star identifies {habitat.name} at {habitat.o2_pct}% oxygen and {habitat.pressure_kpa} kilopascals. The plotted pressure range is calculated from these records.</desc>
          {ticks.map((tick) => <g key={tick}>
            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(tick)} y2={y(tick)} stroke="#344252" strokeDasharray="3 5" />
            <text x={PAD.left - 10} y={y(tick) + 4} textAnchor="end" fill="#c2cbd5" fontSize="12">{tick}</text>
          </g>)}
          <line x1={PAD.left} x2={WIDTH - PAD.right} y1={HEIGHT - PAD.bottom} y2={HEIGHT - PAD.bottom} stroke="#9aa8b7" />
          <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={HEIGHT - PAD.bottom} stroke="#9aa8b7" />
          {analysis.located.map((card) => <circle key={card.card_id} cx={x(card.pressure_kpa)} cy={y(card.o2_pct)} r="2.8" fill={card.fuel_class === "solid" ? "#f5d04c" : card.fuel_class === "liquid" ? "#b294ff" : "#ff8a4c"} opacity="0.7" />)}
          <line x1={targetX} x2={targetX} y1={PAD.top} y2={HEIGHT - PAD.bottom} stroke="#22d3ee" strokeDasharray="6 4" />
          <line x1={PAD.left} x2={WIDTH - PAD.right} y1={targetY} y2={targetY} stroke="#22d3ee" strokeDasharray="6 4" />
          <path d={`M ${targetX} ${targetY - 12} L ${targetX + 3.5} ${targetY - 3.5} L ${targetX + 12} ${targetY} L ${targetX + 3.5} ${targetY + 3.5} L ${targetX} ${targetY + 12} L ${targetX - 3.5} ${targetY + 3.5} L ${targetX - 12} ${targetY} L ${targetX - 3.5} ${targetY - 3.5} Z`} fill="#06141a" stroke="#22d3ee" strokeWidth="2.5" />
          {[0, 0.5, 1].map((fraction) => {
            const pressure = Math.exp(logMin + logRange * fraction);
            const position = x(pressure);
            return <g key={fraction}>
              <line x1={position} x2={position} y1={HEIGHT - PAD.bottom} y2={HEIGHT - PAD.bottom + 4} stroke="#9aa8b7" />
              <text x={position} y={HEIGHT - PAD.bottom + 18} textAnchor={fraction === 0 ? "start" : fraction === 1 ? "end" : "middle"} fill="#c2cbd5" fontSize="11">{pressure.toPrecision(3)}</text>
            </g>;
          })}
          <text x={(PAD.left + WIDTH - PAD.right) / 2} y={HEIGHT - 12} textAnchor="middle" fill="#e7edf3" fontSize="13">Pressure (kPa; logarithmic scale)</text>
          <text transform={`translate(17 ${(PAD.top + HEIGHT - PAD.bottom) / 2}) rotate(-90)`} textAnchor="middle" fill="#e7edf3" fontSize="13">Oxygen (%)</text>
          <text x={Math.min(targetX + 15, WIDTH - 170)} y={Math.max(targetY - 12, PAD.top + 14)} fill="#67e8f9" fontSize="12">Selected habitat</text>
        </svg>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink" aria-label="Chart legend">
        <span><span aria-hidden="true" className="mr-1 text-solid">●</span>Solid fuel</span>
        <span><span aria-hidden="true" className="mr-1 text-liquid">●</span>Liquid fuel</span>
        <span><span aria-hidden="true" className="mr-1 text-gas">●</span>Gas fuel</span>
        <span><span aria-hidden="true" className="mr-1 text-habitat">✦</span>Selected habitat</span>
      </div>
      <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed">
        <strong>What the data show:</strong> {analysis.nearby} of {analysis.located.length} plotted cards fall within the matcher’s measured-distance radius ({MEASURED_DISTANCE}) of {habitat.name}. Distance uses the project metric: oxygen difference divided by 10 and pressure difference divided by 40, combined as a Euclidean distance.
      </p>
      <p className="mt-1 text-xs text-muted">This is a proximity count across all plotted fuel and gravity groups; it does not assign the Measured evidence tier or prove a test predicts habitat fire behavior. <Link href="/method" className="text-habitat underline">See the method and caveats</Link>.</p>
    </section>
  );
}
