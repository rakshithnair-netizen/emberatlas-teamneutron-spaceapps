"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import discrepanciesJson from "@/data/raw/known_discrepancies.json";
import { basisKind, basisLabels, datasetTierLabels, describeFlag, normalizeGravity, outcomeLabels } from "@/lib/basis";
import { discrepanciesForCard } from "@/lib/discrepancy";
import { habitatDistance } from "@/lib/geometry";
import type { BurnCard, KnownDiscrepancy } from "@/lib/types";
import { SourceChips } from "./SourceChips";
import { Missing, Value, formatNumber } from "./Value";

const discrepancies = discrepanciesJson as unknown as KnownDiscrepancy[];

const hiddenKeys = new Set(["measurements_json", "quality_flags", "source_ids"]);

function fieldLabel(key: string): string {
  return key.replace(/_/g, " ").replace(/\bpct\b/, "%").replace(/\bkpa\b/, "kPa").replace(/\bo2\b/, "O₂").replace(/\bcm s\b/, "cm/s");
}

function renderValue(key: string, value: unknown): React.ReactNode {
  if (value === null || value === undefined || value === "") return <Missing />;
  if (key === "outcome") return outcomeLabels[String(value)] ?? String(value);
  if (key === "habitat_relevance_tier") return `${datasetTierLabels[String(value)]?.short ?? ""} · ${datasetTierLabels[String(value)]?.label ?? value}`;
  if (typeof value === "number") return <span className="num">{value}</span>;
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

export function cardSearchParams(card: BurnCard): string {
  const params = new URLSearchParams();
  if (card.o2_pct !== null) params.set("o2", String(card.o2_pct));
  if (card.pressure_kpa !== null) params.set("p", String(card.pressure_kpa));
  params.set("g", normalizeGravity(card.gravity_regime));
  params.set("fuel", card.fuel_class);
  if (card.flow_cm_s !== null) params.set("flow", String(card.flow_cm_s));
  params.set("from", card.card_id);
  return params.toString();
}

export function CardDrawer({ card, onClose }: { card: BurnCard | null; onClose: () => void }) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!card) return;
    closeButton.current?.focus();
    const handler = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [card, onClose]);

  if (!card) return null;
  const cardDiscrepancies = discrepanciesForCard(card, discrepancies);
  const entries = Object.entries(card).filter(([key, value]) => !hiddenKeys.has(key) && value !== null && value !== "");
  const measurementEntries = Object.entries(card.measurements_json ?? {}).filter(([, value]) => value !== null && value !== "");
  const distance = card.o2_pct !== null && card.pressure_kpa !== null ? habitatDistance(card.o2_pct, card.pressure_kpa) : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="card-drawer-title">
      <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close card details" onClick={onClose} tabIndex={-1} />
      <aside className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-line bg-panel shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-line bg-panel/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="eyebrow">Burn card · {card.acronym}</p>
            <h2 id="card-drawer-title" className="num mt-1 text-lg font-semibold">
              {card.card_id}
            </h2>
            <p className="text-sm text-muted">
              {card.fuel_name} · {card.fuel_class} · {normalizeGravity(card.gravity_regime)}
            </p>
          </div>
          <button ref={closeButton} type="button" onClick={onClose} className="rounded-md border border-line px-2.5 py-1 text-sm text-muted hover:text-ink">
            Close
          </button>
        </div>
        <div className="space-y-5 px-5 py-4">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-lg border border-line bg-panel-2 p-2.5">
              <p className="eyebrow">O₂</p>
              <Value value={card.o2_pct} unit="%" basis={card.o2_basis} hasRange={card.o2_pct_low !== null} />
              {card.o2_pct_low !== null ? (
                <p className="num text-[11px] text-muted">
                  range {card.o2_pct_low}–{card.o2_pct_high}%
                </p>
              ) : null}
            </div>
            <div className="rounded-lg border border-line bg-panel-2 p-2.5">
              <p className="eyebrow">Pressure</p>
              <Value value={card.pressure_kpa} unit="kPa" basis={card.pressure_basis} />
            </div>
            <div className="rounded-lg border border-line bg-panel-2 p-2.5">
              <p className="eyebrow">d to 8.2/34</p>
              {distance === null ? <Missing /> : <span className="num">{formatNumber(distance, 2)}</span>}
            </div>
          </div>
          <p className="text-xs text-muted">
            O₂ basis: {basisLabels[basisKind(card.o2_basis, card.o2_pct_low !== null)]} ({card.o2_basis}). Pressure basis:{" "}
            {basisLabels[basisKind(card.pressure_basis)]} ({card.pressure_basis}).
          </p>

          {card.quality_flags.length ? (
            <section aria-labelledby="flags-title" className="rounded-lg border border-tier-extrapolated/40 bg-tier-extrapolated/5 p-3">
              <h3 id="flags-title" className="eyebrow text-tier-extrapolated">
                Quality flags
              </h3>
              <ul className="mt-2 space-y-1 text-sm">
                {card.quality_flags.map((flag) => (
                  <li key={flag}>
                    {describeFlag(flag)} <span className="num text-[11px] text-faint">({flag})</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {cardDiscrepancies.length ? (
            <section aria-labelledby="disc-title" className="rounded-lg border border-tier-analog/40 bg-tier-analog/5 p-3">
              <h3 id="disc-title" className="eyebrow text-tier-analog">
                Known discrepancies
              </h3>
              <ul className="mt-2 space-y-2 text-sm">
                {cardDiscrepancies.map((discrepancy, index) => (
                  <li key={index}>
                    <span className="font-medium">{discrepancy.field}</span>: {discrepancy.psi_or_primary_value} vs {discrepancy.conflicting_or_expected_value}.{" "}
                    <span className="text-muted">{discrepancy.handling}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <SourceChips ids={card.source_ids} />

          <div className="flex flex-wrap gap-2">
            <Link href={`/matcher?${cardSearchParams(card)}`} className="rounded-md bg-ember px-3 py-1.5 text-sm font-medium text-black hover:bg-ember-soft">
              Find similar in Condition Matcher
            </Link>
            <Link href={`/library/${encodeURIComponent(card.investigation_id)}`} className="rounded-md border border-line-strong px-3 py-1.5 text-sm hover:border-habitat/60">
              Open {card.acronym} investigation
            </Link>
          </div>

          <section aria-labelledby="fields-title">
            <h3 id="fields-title" className="eyebrow">
              All reported fields
            </h3>
            <dl className="mt-2 divide-y divide-line rounded-lg border border-line text-sm">
              {entries.map(([key, value]) => (
                <div key={key} className="grid grid-cols-[10rem_1fr] gap-3 px-3 py-1.5">
                  <dt className="text-muted">{fieldLabel(key)}</dt>
                  <dd className="break-words">{renderValue(key, value)}</dd>
                </div>
              ))}
            </dl>
          </section>

          {measurementEntries.length ? (
            <section aria-labelledby="measure-title">
              <h3 id="measure-title" className="eyebrow">
                Measurements
              </h3>
              <table className="mt-2 w-full text-sm">
                <tbody className="divide-y divide-line">
                  {measurementEntries.map(([key, value]) => (
                    <tr key={key}>
                      <th scope="row" className="num py-1.5 pr-3 text-left text-xs font-normal text-muted">
                        {key}
                      </th>
                      <td className="num py-1.5 text-right">{typeof value === "object" ? JSON.stringify(value) : String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
