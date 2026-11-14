"use client";

import Link from "next/link";
import { conditionDistance } from "@/lib/geometry";
import { HabitatPicker } from "./SiteHeader";
import { habitatList, habitatQueryGravity, useHabitat } from "./HabitatProvider";
import { SourceChips } from "./SourceChips";
import { formatNumber } from "./Value";

export function HomeHabitatCard() {
  const { habitat } = useHabitat();
  const exploration = habitatList.find((entry) => entry.habitat_id === "HAB-03")!;
  const gravity = habitatQueryGravity(habitat.habitat_id);
  const distance = conditionDistance(habitat.o2_pct, habitat.pressure_kpa, exploration.o2_pct, exploration.pressure_kpa);
  return (
    <section className="panel border-habitat/30 p-4" aria-labelledby="habitat-card-title">
      <p className="eyebrow">Habitat scope</p>
      <h2 id="habitat-card-title" className="mt-1 font-semibold text-habitat">
        {habitat.name}
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-muted">Target habitat conditions</p>
      <dl className="num mt-2 grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-muted">O₂</dt>
          <dd>{habitat.o2_pct}%</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-muted">Pressure</dt>
          <dd>
            {habitat.pressure_kpa} kPa
            <span className="block text-[11px] text-muted">{habitat.pressure_psia} psia</span>
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-muted">ppO₂</dt>
          <dd>
            {habitat.ppo2_kpa} kPa
            <span className="block text-[11px] text-muted">{habitat.ppo2_basis}</span>
          </dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-muted">{habitat.note}</p>
      <div className="mt-4 rounded-lg border border-line bg-bg/60 p-3" aria-label="Atmosphere comparison">
        <p className="eyebrow">Compared with the research baseline</p>
        <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
          <div>
            <p className="text-xs text-muted">Many spacecraft tests</p>
            <p className="mt-1 text-sm font-medium">Air-like oxygen</p>
            <p className="text-xs text-muted">Near-normal pressure</p>
          </div>
          <span className="text-habitat" aria-hidden="true">→</span>
          <div>
            <p className="text-xs text-habitat">Selected target</p>
            <p className="num mt-1 text-sm font-medium">{habitat.o2_pct}% O₂</p>
            <p className="num text-xs text-muted">{habitat.pressure_kpa} kPa</p>
          </div>
        </div>
        <p className="mt-2 text-center text-xs leading-relaxed text-muted">Takeaway: evidence from different conditions may not directly answer the habitat question.</p>
      </div>
      <p className="num mt-1 text-xs text-muted">Normalized distance to exploration-atmosphere reference: {formatNumber(distance, 2)}; lower means closer.</p>
      <div className="mt-3">
        <HabitatPicker />
      </div>
      <p className="mt-2 text-[11px] text-muted">Changing the habitat re-ranks insights and re-centres the map and matcher.</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <SourceChips ids={habitat.source_ids} />
        <Link href={`/matcher?o2=${habitat.o2_pct}&p=${habitat.pressure_kpa}&g=${gravity}&fuel=any`} className="inline-flex min-h-11 shrink-0 items-center text-xs text-habitat hover:underline">
          Match →
        </Link>
      </div>
    </section>
  );
}
