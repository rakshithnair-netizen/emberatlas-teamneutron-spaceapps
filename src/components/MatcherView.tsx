"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import discrepanciesJson from "@/data/raw/known_discrepancies.json";
import findingsJson from "@/data/raw/findings.json";
import { gravityLabels, normalizeGravity, type QueryGravity } from "@/lib/basis";
import { discrepanciesForInvestigation } from "@/lib/discrepancy";
import { classifyEvidence, evidenceTierMeta } from "@/lib/evidence";
import { kpaToPsia, ppO2Kpa, psiaToKpa } from "@/lib/geometry";
import { relevantFindings } from "@/lib/relevance";
import type { BurnCard, ConditionQuery, Finding, KnownDiscrepancy } from "@/lib/types";
import { CardDrawer } from "./CardDrawer";
import { EnvelopeMap, type Hull } from "./EnvelopeMap";
import { EvidenceBadge, tierHex } from "./EvidenceBadge";
import { habitatList, shortHabitatName } from "./HabitatProvider";
import { SourceChips } from "./SourceChips";
import { useCards } from "./useCards";
import { FlagIcon, Value, formatNumber } from "./Value";

const findings = findingsJson as unknown as Finding[];
const discrepancies = discrepanciesJson as unknown as KnownDiscrepancy[];
const gravities: QueryGravity[] = ["microgravity", "lunar", "mars", "earth"];
type FuelChoice = "any" | "gas" | "liquid" | "solid";

interface FormState {
  o2: string;
  pressure: string;
  unit: "kpa" | "psia";
  gravity: QueryGravity;
  fuelClass: FuelChoice;
  fuelName: string;
  flow: string;
}

function readParams(params: URLSearchParams): FormState {
  const gravity = params.get("g") as QueryGravity | null;
  const fuel = params.get("fuel") as FuelChoice | null;
  return {
    o2: params.get("o2") ?? "34",
    pressure: params.get("p") ?? "56.54",
    unit: "kpa",
    gravity: gravity && gravities.includes(gravity) ? gravity : "microgravity",
    fuelClass: fuel && ["any", "gas", "liquid", "solid"].includes(fuel) ? fuel : "any",
    fuelName: params.get("material") ?? "",
    flow: params.get("flow") ?? "",
  };
}

function signed(value: number, digits = 1): string {
  const text = formatNumber(Math.abs(value), digits);
  return value > 0 ? `+${text}` : value < 0 ? `−${text}` : "0";
}

export function MatcherView({ hulls }: { hulls: Hull[] }) {
  const { cards, error } = useCards();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [form, setForm] = useState<FormState>(() => readParams(new URLSearchParams(params.toString())));
  const [selected, setSelected] = useState<BurnCard | null>(null);
  const [copied, setCopied] = useState(false);
  const seededFrom = params.get("from");

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((previous) => ({ ...previous, [key]: value }));

  const pressureKpa = useMemo(() => {
    const value = Number(form.pressure);
    return form.unit === "kpa" ? value : psiaToKpa(value);
  }, [form.pressure, form.unit]);
  const o2Pct = Number(form.o2);
  const valid = Number.isFinite(o2Pct) && o2Pct > 0 && o2Pct <= 100 && Number.isFinite(pressureKpa) && pressureKpa > 0;

  useEffect(() => {
    if (!valid) return;
    const next = new URLSearchParams();
    next.set("o2", String(o2Pct));
    next.set("p", String(Math.round(pressureKpa * 100) / 100));
    next.set("g", form.gravity);
    next.set("fuel", form.fuelClass);
    if (form.fuelName) next.set("material", form.fuelName);
    if (form.flow) next.set("flow", form.flow);
    if (seededFrom) next.set("from", seededFrom);
    const handle = window.setTimeout(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }), 250);
    return () => window.clearTimeout(handle);
  }, [o2Pct, pressureKpa, form.gravity, form.fuelClass, form.fuelName, form.flow, valid, router, pathname, seededFrom]);

  const fuelNames = useMemo(() => {
    if (!cards) return [];
    return [...new Set(cards.filter((card) => form.fuelClass === "any" || card.fuel_class === form.fuelClass).map((card) => card.fuel_name))].sort();
  }, [cards, form.fuelClass]);

  const query: ConditionQuery | null = useMemo(
    () =>
      valid
        ? {
            o2Pct,
            pressureKpa,
            gravity: form.gravity,
            fuelClass: form.fuelClass,
            flowCmS: form.flow ? Number(form.flow) : null,
            fuelName: form.fuelName || null,
          }
        : null,
    [valid, o2Pct, pressureKpa, form.gravity, form.fuelClass, form.flow, form.fuelName],
  );

  const result = useMemo(() => {
    if (!cards || !query) return null;
    const pool = query.fuelName ? cards.filter((card) => card.fuel_name === query.fuelName) : cards;
    return classifyEvidence(query, pool);
  }, [cards, query]);

  const nearestInvestigations = [...new Set(result?.nearestCards.map((entry) => entry.card.investigation_id) ?? [])];
  const related = query ? relevantFindings(query, nearestInvestigations, findings) : [];
  const relatedDiscrepancies = [
    ...new Set(nearestInvestigations.flatMap((id) => discrepanciesForInvestigation(id, discrepancies))),
    ...(query && (query.gravity === "lunar" || query.gravity === "mars") ? discrepanciesForInvestigation("FM2", discrepancies) : []),
  ];
  const lunarCards = cards?.filter((card) => normalizeGravity(card.gravity_regime) === "lunar") ?? [];

  const applyHabitat = (id: string) => {
    const habitat = habitatList.find((entry) => entry.habitat_id === id);
    if (!habitat) return;
    setForm((previous) => ({
      ...previous,
      o2: String(habitat.o2_pct),
      pressure: previous.unit === "kpa" ? String(habitat.pressure_kpa) : String(habitat.pressure_psia),
    }));
  };

  const switchUnit = (unit: "kpa" | "psia") => {
    if (unit === form.unit) return;
    const value = Number(form.pressure);
    const converted = unit === "psia" ? kpaToPsia(value) : psiaToKpa(value);
    setForm((previous) => ({ ...previous, unit, pressure: String(Math.round(converted * 100) / 100) }));
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Condition Matcher</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">How much do we actually know at this condition?</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Enter an atmosphere, gravity and fuel. The matcher grades the evidence, lists the nearest real burn cards and says plainly what is not known.
          {seededFrom ? <span className="text-habitat"> Seeded from card {seededFrom}.</span> : null}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
        <form className="panel space-y-4 p-4" onSubmit={(event) => event.preventDefault()} aria-label="Condition">
          <div>
            <p className="eyebrow mb-2">Preset habitat</p>
            <div className="flex flex-wrap gap-1.5">
              {habitatList.map((habitat) => (
                <button
                  key={habitat.habitat_id}
                  type="button"
                  onClick={() => applyHabitat(habitat.habitat_id)}
                  className={`rounded-md border px-2 py-1 text-[11px] ${
                    Math.abs(habitat.o2_pct - o2Pct) < 0.01 && Math.abs(habitat.pressure_kpa - pressureKpa) < 0.05
                      ? "border-habitat bg-habitat/15 text-habitat"
                      : "border-line text-muted hover:text-ink"
                  }`}
                >
                  {shortHabitatName(habitat)}
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="eyebrow">Oxygen (%)</span>
            <input type="number" inputMode="decimal" step="0.1" min="1" max="100" value={form.o2} onChange={(event) => update("o2", event.target.value)} className="num mt-1 w-full rounded-md border border-line bg-panel-2 px-3 py-2" />
          </label>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="pressure-input" className="eyebrow">
                Pressure
              </label>
              <div className="flex rounded-md border border-line text-[11px]" role="group" aria-label="Pressure unit">
                {(["kpa", "psia"] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    aria-pressed={form.unit === unit}
                    onClick={() => switchUnit(unit)}
                    className={`px-2 py-0.5 ${form.unit === unit ? "bg-panel-2 text-ink" : "text-muted"}`}
                  >
                    {unit === "kpa" ? "kPa" : "psia"}
                  </button>
                ))}
              </div>
            </div>
            <input id="pressure-input" type="number" inputMode="decimal" step="0.1" min="1" value={form.pressure} onChange={(event) => update("pressure", event.target.value)} className="num mt-1 w-full rounded-md border border-line bg-panel-2 px-3 py-2" />
            {valid ? (
              <p className="num mt-1 text-[11px] text-muted">
                = {formatNumber(pressureKpa, 2)} kPa · {formatNumber(kpaToPsia(pressureKpa), 2)} psia · ppO₂ {formatNumber(ppO2Kpa(o2Pct, pressureKpa), 2)} kPa
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-tier-extrapolated">Enter O₂ between 1 and 100% and a positive pressure.</p>
            )}
          </div>
          <fieldset>
            <legend className="eyebrow">Gravity</legend>
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              {gravities.map((gravity) => (
                <label key={gravity} className={`cursor-pointer rounded-md border px-2 py-1.5 text-xs ${form.gravity === gravity ? "border-ember bg-ember/10 text-ink" : "border-line text-muted"}`}>
                  <input type="radio" name="gravity" value={gravity} checked={form.gravity === gravity} onChange={() => update("gravity", gravity)} className="sr-only" />
                  {gravityLabels[gravity]}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className="eyebrow">Fuel class</span>
            <select value={form.fuelClass} onChange={(event) => setForm((previous) => ({ ...previous, fuelClass: event.target.value as FuelChoice, fuelName: "" }))} className="mt-1 w-full rounded-md border border-line bg-panel-2 px-3 py-2 text-sm">
              <option value="any">Any fuel</option>
              <option value="solid">Solid (materials)</option>
              <option value="liquid">Liquid (droplets)</option>
              <option value="gas">Gas (jets, burners)</option>
            </select>
          </label>
          <label className="block">
            <span className="eyebrow">Material (optional)</span>
            <select value={form.fuelName} onChange={(event) => update("fuelName", event.target.value)} className="mt-1 w-full rounded-md border border-line bg-panel-2 px-3 py-2 text-sm">
              <option value="">Any {form.fuelClass === "any" ? "" : form.fuelClass} material</option>
              {fuelNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="eyebrow">Flow (cm/s, optional)</span>
            <input type="number" inputMode="decimal" step="0.1" min="0" value={form.flow} onChange={(event) => update("flow", event.target.value)} placeholder="e.g. 20" className="num mt-1 w-full rounded-md border border-line bg-panel-2 px-3 py-2" />
          </label>
          <button type="button" onClick={copyLink} className="w-full rounded-md border border-habitat/50 px-3 py-2 text-sm text-habitat hover:bg-habitat/10">
            {copied ? "Link copied" : "Copy shareable link"}
          </button>
        </form>

        <div className="space-y-4">
          {error ? <p className="panel p-4 text-sm text-tier-extrapolated">{error}</p> : null}
          {!cards ? <p className="panel p-6 text-sm text-muted">Loading burn cards…</p> : null}
          {result && query ? (
            <>
              <section className="panel p-5" aria-live="polite" aria-labelledby="verdict-title" style={{ borderColor: `${tierHex[result.tier]}55` }}>
                <h2 id="verdict-title" className="text-lg font-semibold">What the evidence can say</h2>
                <p className="mt-2 text-base leading-relaxed"><strong>Verdict:</strong> {evidenceTierMeta[result.tier].description} {result.gapStatement} This is a research screening result, not a safety certification.</p>
                <div className="flex flex-wrap items-center gap-3">
                  <EvidenceBadge tier={result.tier} size="lg" detail={result.distance !== null ? `d ${formatNumber(result.distance, 2)}` : undefined} />
                  <span className="num text-xs text-muted">
                    {formatNumber(o2Pct)}% O₂ · {formatNumber(pressureKpa)} kPa · {gravityLabels[query.gravity]} · {query.fuelName || (query.fuelClass === "any" ? "any fuel" : query.fuelClass)}
                  </span>
                </div>
                <div className="mt-4 rounded-lg border border-line bg-panel-2 p-3">
                  <p className="eyebrow">What would close this gap</p>
                  <p className="mt-1 text-sm">{result.closeGapStatement}</p>
                </div>
                {query.gravity !== "microgravity" ? (
                  <p className="mt-3 text-sm text-tier-analog">
                    Partial-gravity scarcity: the dataset has {lunarCards.length} lunar-gravity cards ({lunarCards.map((card) => card.card_id).join(", ")}), all LUCI in air at normal pressure, and none at Mars gravity. Partial-gravity behaviour cannot be interpolated from 0 g and 1 g (F033).
                  </p>
                ) : null}
              </section>

              <section className="panel overflow-hidden" aria-labelledby="nearest-cards-title">
                <h2 id="nearest-cards-title" className="px-4 pt-4 font-semibold">
                  Nearest burn cards
                </h2>
                <div className="overflow-x-auto">
                  <table className="mt-2 w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-b border-line text-left text-xs text-muted">
                        <th className="px-4 py-2 font-normal">Card</th>
                        <th className="px-2 py-2 font-normal">Fuel</th>
                        <th className="px-2 py-2 text-right font-normal">O₂</th>
                        <th className="px-2 py-2 text-right font-normal">ΔO₂</th>
                        <th className="px-2 py-2 text-right font-normal">P</th>
                        <th className="px-2 py-2 text-right font-normal">ΔP</th>
                        <th className="px-2 py-2 text-right font-normal">Δflow</th>
                        <th className="px-2 py-2 text-right font-normal">d</th>
                        <th className="px-4 py-2 font-normal">Gravity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.nearestCards.map((entry) => (
                        <tr key={entry.card.card_id} className="border-b border-line/60 hover:bg-panel-2">
                          <td className="px-4 py-2">
                            <button type="button" onClick={() => setSelected(entry.card as unknown as BurnCard)} className="num text-left text-habitat hover:underline">
                              {entry.card.card_id}
                            </button>{" "}
                            <FlagIcon flags={entry.card.quality_flags ?? []} />
                          </td>
                          <td className="px-2 py-2 text-xs">{entry.card.fuel_name}</td>
                          <td className="px-2 py-2 text-right">
                            <Value value={entry.card.o2_pct} unit="%" basis={entry.card.o2_basis} hasRange={entry.card.o2_pct_low != null} />
                          </td>
                          <td className="num px-2 py-2 text-right text-xs">{signed(entry.deltaO2)}</td>
                          <td className="px-2 py-2 text-right">
                            <Value value={entry.card.pressure_kpa} unit="kPa" basis={entry.card.pressure_basis} />
                          </td>
                          <td className="num px-2 py-2 text-right text-xs">{signed(entry.deltaPressureKpa)}</td>
                          <td className="num px-2 py-2 text-right text-xs">{entry.deltaFlowCmS === null ? <span title="Flow not reported or not queried">—</span> : signed(entry.deltaFlowCmS)}</td>
                          <td className="num px-2 py-2 text-right text-habitat">{formatNumber(entry.distance, 2)}</td>
                          <td className="px-4 py-2 text-xs">{normalizeGravity(entry.card.gravity_regime)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3">
                  <SourceChips ids={result.nearestCards.flatMap((entry) => entry.card.source_ids ?? [])} />
                </div>
              </section>

              <section className="panel p-2 sm:p-3" aria-labelledby="mini-title">
                <h2 id="mini-title" className="px-2 pt-1 text-sm font-semibold">
                  Coverage around your query
                </h2>
                <EnvelopeMap
                  cards={cards!}
                  hulls={hulls}
                  habitats={habitatList}
                  selectedHabitat={habitatList.find((habitat) => habitat.habitat_id === "HAB-03")!}
                  options={{ logX: true, showHulls: true, gravityOverlay: query.gravity !== "microgravity", showIsoPpo2: false, fuelClasses: query.fuelClass === "any" ? ["gas", "liquid", "solid"] : [query.fuelClass!] }}
                  highlightIds={result.nearestCards.map((entry) => entry.card.card_id)}
                  query={{ o2Pct, pressureKpa, color: tierHex[result.tier], label: `Query: ${evidenceTierMeta[result.tier].label}` }}
                  onSelectCard={setSelected}
                  height={420}
                />
                <p className="px-3 pb-3 text-xs leading-relaxed text-muted">
                  Map summary: your {o2Pct}% O₂, {pressureKpa} kPa query is marked against the NASA test envelope. The nearest {query.fuelClass === "any" ? "matching-fuel" : `${query.fuelClass}-fuel`} {query.gravity} card is {result.nearestCards[0]?.card.card_id ?? "not available"}; the table above lists the nearest records and sources.
                </p>
              </section>

              <div className="grid gap-4 md:grid-cols-2">
                <section className="panel p-4" aria-labelledby="findings-title">
                  <h2 id="findings-title" className="font-semibold">
                    Relevant findings
                  </h2>
                  {related.length ? (
                    <ul className="mt-2 space-y-3">
                      {related.map(({ finding, reason }) => (
                        <li key={finding.finding_id} className="text-sm">
                          <p>
                            <span className="num mr-1 text-xs text-ember">{finding.finding_id}</span>
                            {finding.statement}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted">{reason}</p>
                          <div className="mt-1">
                            <SourceChips ids={finding.source_ids} label="" />
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-muted">No finding in the dataset addresses this condition directly.</p>
                  )}
                </section>
                <section className="panel p-4" aria-labelledby="disc-list-title">
                  <h2 id="disc-list-title" className="font-semibold">
                    Data caveats for these investigations
                  </h2>
                  {relatedDiscrepancies.length ? (
                    <ul className="mt-2 space-y-2 text-sm">
                      {relatedDiscrepancies.map((discrepancy, index) => (
                        <li key={index}>
                          <span className="num text-xs text-tier-analog">{discrepancy.investigation}</span> {discrepancy.record}, {discrepancy.field}: {discrepancy.psi_or_primary_value} vs {discrepancy.conflicting_or_expected_value}.{" "}
                          <span className="text-muted">{discrepancy.handling}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-muted">No known discrepancies recorded for the nearest investigations.</p>
                  )}
                  <Link href="/method#discrepancies" className="mt-3 inline-block text-xs text-habitat hover:underline">
                    All known discrepancies →
                  </Link>
                </section>
              </div>
            </>
          ) : null}
        </div>
      </div>
      <CardDrawer card={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
