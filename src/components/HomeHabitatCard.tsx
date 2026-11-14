"use client";

import Link from "next/link";
import { habitatDistance } from "@/lib/geometry";
import { HabitatPicker } from "./SiteHeader";
import { useHabitat } from "./HabitatProvider";
import { SourceChips } from "./SourceChips";
import { formatNumber } from "./Value";

export function HomeHabitatCard() {
  const { habitat } = useHabitat();
  const distance = habitatDistance(habitat.o2_pct, habitat.pressure_kpa);
  return (
    <section className="panel border-habitat/30 p-4" aria-labelledby="habitat-card-title">
      <p className="eyebrow">Habitat scope</p>
      <h2 id="habitat-card-title" className="mt-1 font-semibold text-habitat">
        {habitat.name}
      </h2>
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
      <p className="num mt-1 text-xs text-muted">Distance to 8.2 psia / 34%: {formatNumber(distance, 2)}</p>
      <div className="mt-3">
        <HabitatPicker />
      </div>
      <p className="mt-2 text-[11px] text-muted">Changing the habitat re-ranks insights and re-centres the map and matcher.</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <SourceChips ids={habitat.source_ids} />
        <Link href={`/matcher?o2=${habitat.o2_pct}&p=${habitat.pressure_kpa}&g=microgravity&fuel=any`} className="shrink-0 text-xs text-habitat hover:underline">
          Match →
        </Link>
      </div>
    </section>
  );
}
