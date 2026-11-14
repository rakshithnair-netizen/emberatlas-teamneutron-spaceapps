"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { datasetTierLabels, gravityLabels, normalizeGravity } from "@/lib/basis";
import { classifyEvidence } from "@/lib/evidence";
import { conditionDistance } from "@/lib/geometry";
import type { BurnCard, InvestigationEnvelope } from "@/lib/types";
import { CardDrawer } from "./CardDrawer";
import { EnvelopeMap, fuelColors, type EnvelopeOptions, type Hull } from "./EnvelopeMap";
import { EvidenceBadge } from "./EvidenceBadge";
import { habitatList, useHabitat } from "./HabitatProvider";
import { useCards } from "./useCards";
import { Value, formatNumber } from "./Value";

const tierBarColors: Record<string, string> = {
  A: "#4ade80",
  B: "#60a5fa",
  C: "#38bdf8",
  D: "#64748b",
  F: "#fbbf24",
  E: "#334155",
};

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-line bg-panel-2 px-2.5 py-1.5 text-xs">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="accent-[#ff7a3d]" />
      {label}
    </label>
  );
}

export function ExplorerView({ hulls, envelopes }: { hulls: Hull[]; envelopes: InvestigationEnvelope[] }) {
  const { cards, error } = useCards();
  const { habitat } = useHabitat();
  const [selected, setSelected] = useState<BurnCard | null>(null);
  const [options, setOptions] = useState<EnvelopeOptions>({
    logX: true,
    showHulls: true,
    gravityOverlay: false,
    showIsoPpo2: true,
    fuelClasses: ["gas", "liquid", "solid"],
  });
  const set = <K extends keyof EnvelopeOptions>(key: K, value: EnvelopeOptions[K]) => setOptions((previous) => ({ ...previous, [key]: value }));

  const analysis = useMemo(() => {
    if (!cards) return null;
    const located = cards.filter((card) => card.o2_pct !== null && card.pressure_kpa !== null);
    const ranked = located
      .map((card) => ({ card, distance: conditionDistance(card.o2_pct as number, card.pressure_kpa as number, habitat.o2_pct, habitat.pressure_kpa) }))
      .sort((a, b) => a.distance - b.distance);
    const tierMix = (radius: number) => {
      const counts: Record<string, number> = {};
      for (const entry of ranked) if (entry.distance <= radius) counts[entry.card.habitat_relevance_tier[0]] = (counts[entry.card.habitat_relevance_tier[0]] ?? 0) + 1;
      return counts;
    };
    const matrix = (["gas", "liquid", "solid"] as const).map((fuelClass) => ({
      fuelClass,
      micro: classifyEvidence({ o2Pct: habitat.o2_pct, pressureKpa: habitat.pressure_kpa, gravity: "microgravity", fuelClass }, cards),
      lunar: classifyEvidence({ o2Pct: habitat.o2_pct, pressureKpa: habitat.pressure_kpa, gravity: "lunar", fuelClass }, cards),
    }));
    const nonMicro = cards.filter((card) => normalizeGravity(card.gravity_regime) !== "microgravity");
    return { nearest: ranked.slice(0, 8), within05: tierMix(0.5), within10: tierMix(1), matrix, nonMicro, locatedCount: located.length };
  }, [cards, habitat]);

  const solidGap = analysis?.matrix.find((row) => row.fuelClass === "solid")?.micro;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Mission Explorer</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Envelope Map</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Every burn card with O₂ and pressure, plotted against the habitat atmospheres. Filled markers are stated in the source; open markers are platform-nominal or approximate. Click a point for its full record.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Map options">
          <Toggle checked={options.logX} onChange={(value) => set("logX", value)} label="Log pressure" />
          <Toggle checked={options.showHulls} onChange={(value) => set("showHulls", value)} label="Coverage hulls" />
          <Toggle checked={options.showIsoPpo2} onChange={(value) => set("showIsoPpo2", value)} label="Iso-ppO₂ lines" />
          <Toggle checked={options.gravityOverlay} onChange={(value) => set("gravityOverlay", value)} label="Gravity overlay" />
          {(["gas", "liquid", "solid"] as const).map((fuelClass) => (
            <label key={fuelClass} className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-line bg-panel-2 px-2.5 py-1.5 text-xs">
              <input
                type="checkbox"
                checked={options.fuelClasses.includes(fuelClass)}
                onChange={(event) =>
                  set("fuelClasses", event.target.checked ? [...options.fuelClasses, fuelClass] : options.fuelClasses.filter((value) => value !== fuelClass))
                }
              />
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: fuelColors[fuelClass] }} aria-hidden />
              {fuelClass}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <section className="panel p-2 sm:p-3" aria-labelledby="map-title">
          <h2 id="map-title" className="sr-only">
            Burn card envelope map
          </h2>
          {error ? <p className="p-6 text-sm text-tier-extrapolated">{error}</p> : null}
          {cards ? (
            <EnvelopeMap
              cards={cards}
              hulls={hulls}
              habitats={habitatList}
              selectedHabitat={habitat}
              options={options}
              highlightIds={analysis?.nearest.slice(0, 5).map((entry) => entry.card.card_id)}
              onSelectCard={setSelected}
            />
          ) : (
            <div className="flex h-[560px] items-center justify-center text-sm text-muted">Loading 1,732 burn cards…</div>
          )}
          <p className="px-2 pb-1 pt-2 text-[11px] text-muted sm:hidden">
            <span style={{ color: fuelColors.gas }}>● gas</span> · <span style={{ color: fuelColors.liquid }}>● liquid</span> · <span style={{ color: fuelColors.solid }}>● solid</span> · filled = stated, open = nominal · ◆ lunar · ■ 1 g control · <span className="text-habitat">+ habitats</span> · green ring = d ≤ 0.35
          </p>
          {options.gravityOverlay && analysis ? (
            <p className="px-2 pb-2 text-sm text-tier-analog">
              Gravity overlay: only {analysis.nonMicro.length} of {cards?.length} cards are not microgravity ({analysis.nonMicro.map((card) => card.card_id).join(", ")}), all LUCI at 20–21% O₂ and normal pressure. Large diamonds are lunar, squares are the 1 g controls.
            </p>
          ) : null}
          {analysis ? (
            <p className="sr-only">
              Summary: {analysis.locatedCount} cards have both O₂ and pressure. The selected habitat {habitat.name} is at {habitat.o2_pct}% O₂ and {habitat.pressure_kpa} kPa. The nearest card is {analysis.nearest[0]?.card.card_id} at distance {formatNumber(analysis.nearest[0]?.distance ?? 0, 2)}. {solidGap?.gapStatement}
            </p>
          ) : null}
        </section>

        <aside className="space-y-4" aria-label="Habitat analysis">
          <section className="panel p-4">
            <p className="eyebrow">Selected habitat</p>
            <h2 className="mt-1 font-semibold text-habitat">{habitat.name}</h2>
            <p className="num mt-1 text-sm">
              {habitat.o2_pct}% O₂ · {habitat.pressure_kpa} kPa ({habitat.pressure_psia} psia) · ppO₂ {habitat.ppo2_kpa} kPa
            </p>
            <p className="mt-1 text-xs text-muted">{habitat.note}</p>
          </section>

          {analysis ? (
            <>
              <section className="panel p-4" aria-labelledby="matrix-title">
                <h2 id="matrix-title" className="eyebrow">
                  Evidence at this habitat
                </h2>
                <table className="mt-2 w-full text-xs">
                  <thead>
                    <tr className="text-left text-muted">
                      <th className="py-1 font-normal">Fuel</th>
                      <th className="py-1 font-normal">{gravityLabels.microgravity}</th>
                      <th className="py-1 font-normal">Lunar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.matrix.map((row) => (
                      <tr key={row.fuelClass} className="border-t border-line">
                        <th scope="row" className="py-1.5 text-left font-normal">
                          {row.fuelClass}
                        </th>
                        <td className="py-1.5">
                          <EvidenceBadge tier={row.micro.tier} size="sm" compact />
                        </td>
                        <td className="py-1.5">
                          <EvidenceBadge tier={row.lunar.tier} size="sm" compact />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {solidGap ? <p className="mt-3 text-sm leading-relaxed">{solidGap.gapStatement}</p> : null}
                <Link
                  href={`/matcher?o2=${habitat.o2_pct}&p=${habitat.pressure_kpa}&g=lunar&fuel=solid`}
                  className="mt-3 inline-block text-xs text-habitat underline-offset-2 hover:underline"
                >
                  Open in Condition Matcher →
                </Link>
              </section>

              <section className="panel p-4" aria-labelledby="mix-title">
                <h2 id="mix-title" className="eyebrow">
                  Dataset tier mix near habitat
                </h2>
                {[
                  { label: "d ≤ 0.5", counts: analysis.within05 },
                  { label: "d ≤ 1.0", counts: analysis.within10 },
                ].map((group) => {
                  const total = Object.values(group.counts).reduce((sum, value) => sum + value, 0);
                  return (
                    <div key={group.label} className="mt-2">
                      <p className="num text-xs text-muted">
                        {group.label}: {total} cards
                      </p>
                      <div className="mt-1 flex h-3 overflow-hidden rounded bg-panel-2" aria-hidden>
                        {Object.entries(group.counts).map(([tier, count]) => (
                          <div key={tier} style={{ width: `${(count / Math.max(total, 1)) * 100}%`, background: tierBarColors[tier] }} title={`Tier ${tier}: ${count}`} />
                        ))}
                      </div>
                      <p className="num mt-1 text-[11px] text-muted">
                        {Object.entries(group.counts)
                          .map(([tier, count]) => `${tier} ${count}`)
                          .join(" · ") || "none"}
                      </p>
                    </div>
                  );
                })}
              </section>

              <section className="panel p-4" aria-labelledby="nearest-title">
                <h2 id="nearest-title" className="eyebrow">
                  Nearest cards
                </h2>
                <ol className="mt-2 space-y-1">
                  {analysis.nearest.map(({ card, distance }) => (
                    <li key={card.card_id}>
                      <button
                        type="button"
                        onClick={() => setSelected(card)}
                        className="flex w-full items-center justify-between gap-2 rounded px-1.5 py-1 text-left text-xs hover:bg-panel-2"
                      >
                        <span>
                          <span className="num">{card.card_id}</span> <span className="text-muted">{card.fuel_name}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <Value value={card.o2_pct} unit="%" basis={card.o2_basis} />
                          <span className="num text-habitat">d {formatNumber(distance, 2)}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              </section>
            </>
          ) : null}
        </aside>
      </div>

      <section className="panel p-4" aria-labelledby="coverage-title">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="coverage-title" className="font-semibold">
            Investigation coverage
          </h2>
          <p className="text-xs text-muted">O₂ range per investigation (bar) against the selected habitat (cyan line). From investigation_envelope.</p>
        </div>
        <div className="mt-3 space-y-1.5">
          {[...envelopes]
            .sort((a, b) => (a.closest_distance_to_8p2psi_34pct ?? 99) - (b.closest_distance_to_8p2psi_34pct ?? 99))
            .map((envelope) => {
              const scale = (value: number) => `${(Math.min(Math.max(value, 0), 90) / 90) * 100}%`;
              const hasRange = envelope.o2_pct_min !== null && envelope.o2_pct_max !== null;
              return (
                <div key={envelope.investigation_id} className="grid grid-cols-[6.5rem_1fr_5.5rem] items-center gap-2 text-xs sm:grid-cols-[8rem_1fr_9rem]">
                  <Link href={`/library/${envelope.investigation_id}`} className="num truncate hover:text-habitat">
                    {envelope.investigation_id}
                  </Link>
                  <div className="relative h-4 rounded bg-panel-2">
                    {hasRange ? (
                      <div
                        className="absolute top-0.5 h-3 rounded-sm"
                        style={{
                          left: scale(envelope.o2_pct_min as number),
                          width: `max(3px, calc(${scale(envelope.o2_pct_max as number)} - ${scale(envelope.o2_pct_min as number)}))`,
                          background: tierBarColors[envelope.best_tier] ?? "#64748b",
                        }}
                        title={`${envelope.o2_pct_min}–${envelope.o2_pct_max}% O₂, ${envelope.pressure_kpa_min}–${envelope.pressure_kpa_max} kPa`}
                      />
                    ) : (
                      <span className="absolute left-2 top-0 text-[10px] text-faint">no O₂ / pressure reported</span>
                    )}
                    <div className="absolute top-0 h-4 w-0.5 bg-habitat" style={{ left: scale(habitat.o2_pct) }} aria-hidden />
                  </div>
                  <span className="num text-right text-muted">
                    {hasRange ? `${envelope.o2_pct_min}–${envelope.o2_pct_max}%` : "—"}
                    <span className="hidden sm:inline"> · tier {envelope.best_tier}</span>
                  </span>
                </div>
              );
            })}
        </div>
        <p className="mt-3 text-[11px] text-muted">
          Bar colour = best dataset tier: {Object.values(datasetTierLabels).map((value) => `${value.short} ${value.label}`).join(" · ")}. Scale 0–90% O₂.
        </p>
      </section>

      <CardDrawer card={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
