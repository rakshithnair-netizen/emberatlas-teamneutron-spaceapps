"use client";

import Link from "next/link";
import { conditionDistance } from "@/lib/geometry";
import { HabitatPicker } from "./SiteHeader";
import { habitatList, habitatQueryGravity, useHabitat } from "./HabitatProvider";
import { SourceChips } from "./SourceChips";
import { formatNumber } from "./Value";

export function HomeHabitatCard() {
  const { habitat } = useHabitat();
  // HAB-03 is the current exploration atmosphere (8.2 psia / 34% O₂), the app's reference target.
  const exploration = habitatList.find((entry) => entry.habitat_id === "HAB-03")!;
  // HAB-01 (standard air / ISS cabin) stands in for the near-Earth conditions most tests used. Its values
  // come from the dataset rather than hardcoded text so the comparison box stays honest.
  const airBaseline = habitatList.find((entry) => entry.habitat_id === "HAB-01")!;
  const isBaseline = habitat.habitat_id === airBaseline.habitat_id;
  const gravity = habitatQueryGravity(habitat.habitat_id);
  const distance = conditionDistance(habitat.o2_pct, habitat.pressure_kpa, exploration.o2_pct, exploration.pressure_kpa);
  return (
    <section className="panel border-clay/30 p-4" aria-labelledby="habitat-card-title">
      <p className="eyebrow">Habitat scope</p>
      <h2 id="habitat-card-title" className="mt-1 font-semibold text-clay-strong">
        {habitat.name}
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">Target habitat conditions</p>
      <dl className="num mt-2 grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-ink-muted">O₂</dt>
          <dd>{habitat.o2_pct}%</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-ink-muted">Pressure</dt>
          <dd>
            {habitat.pressure_kpa} kPa
            <span className="block text-[11px] text-ink-muted">{habitat.pressure_psia} psia</span>
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-ink-muted">ppO₂</dt>
          <dd>
            {habitat.ppo2_kpa} kPa
            <span className="block text-[11px] text-ink-muted">{habitat.ppo2_basis}</span>
          </dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-ink-muted">{habitat.note}</p>
      <div className="mt-4 rounded-lg border border-sand-strong bg-paper/60 p-3" aria-label="Atmosphere comparison">
        <p className="eyebrow">Compared with the research baseline</p>
        <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
          <div>
            <p className="text-xs text-ink-muted">Many spacecraft tests</p>
            <p className="num mt-1 text-sm font-medium">{airBaseline.o2_pct}% O₂</p>
            <p className="num text-xs text-ink-muted">{airBaseline.pressure_kpa} kPa (air-like)</p>
          </div>
          <span className="text-clay-strong" aria-hidden="true">→</span>
          <div>
            <p className="text-xs text-clay-strong">Selected target</p>
            <p className="num mt-1 text-sm font-medium">{habitat.o2_pct}% O₂</p>
            <p className="num text-xs text-ink-muted">{habitat.pressure_kpa} kPa</p>
          </div>
        </div>
        {/* With the air reference selected, both sides are the same atmosphere, so the generic
            "different conditions" takeaway would contradict the numbers shown above it. */}
        <p className="mt-2 text-center text-xs leading-relaxed text-ink-muted">
          {isBaseline
            ? "Takeaway: this target matches the air-like baseline, so it is the condition most tests were run near."
            : "Takeaway: evidence from different conditions may not directly answer the habitat question."}
        </p>
      </div>
      <p className="num mt-1 text-xs text-ink-muted">Normalized distance to exploration-atmosphere reference: {formatNumber(distance, 2)}; lower means closer.</p>
      <div className="mt-3">
        <HabitatPicker />
      </div>
      <p className="mt-2 text-[11px] text-ink-muted">Changing the habitat re-ranks insights and re-centres the map and matcher.</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <SourceChips ids={habitat.source_ids} />
        <Link href={`/matcher?o2=${habitat.o2_pct}&p=${habitat.pressure_kpa}&g=${gravity}&fuel=any`} className="inline-flex min-h-11 shrink-0 items-center text-xs text-clay-strong hover:underline">
          Match →
        </Link>
      </div>
    </section>
  );
}
