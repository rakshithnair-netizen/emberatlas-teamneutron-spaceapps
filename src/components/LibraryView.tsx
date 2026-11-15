"use client";

import Link from "next/link";
import MiniSearch from "minisearch";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { basisKind, datasetTierLabels, normalizeGravity, outcomeLabels } from "@/lib/basis";
import type { BurnCard } from "@/lib/types";
import { CardDrawer } from "./CardDrawer";
import { fuelColors } from "./EnvelopeMap";
import { useCards } from "./useCards";
import { EvidenceTierGuide } from "./EvidenceTierGuide";
import { FlagIcon, Value } from "./Value";

export interface InvestigationSummary {
  investigation_id: string;
  acronym: string;
  title: string;
  status: string | null;
  in_scope: boolean;
  fire_safety_roles: string | null;
  platform: string | null;
  start_date: string | null;
  data_origin: string;
  cardCount: number;
  bestTier: string | null;
}

interface Filters {
  q: string;
  fuelClass: string;
  fuelName: string;
  investigation: string;
  gravity: string;
  platform: string;
  outcome: string;
  tier: string;
  o2Min: string;
  o2Max: string;
  pMin: string;
  pMax: string;
  flowMin: string;
  flowMax: string;
  flagged: boolean;
}

const emptyFilters: Filters = {
  q: "",
  fuelClass: "",
  fuelName: "",
  investigation: "",
  gravity: "",
  platform: "",
  outcome: "",
  tier: "",
  o2Min: "",
  o2Max: "",
  pMin: "",
  pMax: "",
  flowMin: "",
  flowMax: "",
  flagged: false,
};

const PAGE = 48;

function inRange(value: number | null, min: string, max: string): boolean {
  if (!min && !max) return true;
  if (value === null) return false;
  if (min && value < Number(min)) return false;
  if (max && value > Number(max)) return false;
  return true;
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-md border border-line bg-panel-2 px-2 py-1.5 text-xs">
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function RangeInputs({ label, min, max, onMin, onMax, unit }: { label: string; min: string; max: string; onMin: (value: string) => void; onMax: (value: string) => void; unit: string }) {
  return (
    <fieldset>
      <legend className="eyebrow">
        {label} ({unit})
      </legend>
      <div className="mt-1 flex gap-1.5">
        <input type="number" inputMode="decimal" aria-label={`${label} minimum`} placeholder="min" value={min} onChange={(event) => onMin(event.target.value)} className="num w-full rounded-md border border-line bg-panel-2 px-2 py-1.5 text-xs" />
        <input type="number" inputMode="decimal" aria-label={`${label} maximum`} placeholder="max" value={max} onChange={(event) => onMax(event.target.value)} className="num w-full rounded-md border border-line bg-panel-2 px-2 py-1.5 text-xs" />
      </div>
    </fieldset>
  );
}

export function LibraryView({ investigations }: { investigations: InvestigationSummary[] }) {
  const { cards, error } = useCards();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTab] = useState<"cards" | "investigations">(params.get("tab") === "investigations" ? "investigations" : "cards");
  const [filters, setFilters] = useState<Filters>(() => ({
    ...emptyFilters,
    investigation: params.get("investigation") ?? "",
    q: params.get("q") ?? "",
    tier: params.get("tier") ?? "",
    gravity: params.get("gravity") ?? "",
  }));
  const [shown, setShown] = useState(PAGE);
  const [selected, setSelected] = useState<BurnCard | null>(null);
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setShown(PAGE);
  };

  useEffect(() => {
    const id = params.get("card");
    if (id && cards) setSelected(cards.find((card) => card.card_id === id) ?? null);
  }, [params, cards]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (tab === "investigations") next.set("tab", "investigations");
    if (filters.q) next.set("q", filters.q);
    if (filters.investigation) next.set("investigation", filters.investigation);
    if (filters.tier) next.set("tier", filters.tier);
    if (filters.gravity) next.set("gravity", filters.gravity);
    const handle = window.setTimeout(() => router.replace(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false }), 300);
    return () => window.clearTimeout(handle);
  }, [tab, filters.q, filters.investigation, filters.tier, filters.gravity, router, pathname]);

  const index = useMemo(() => {
    if (!cards) return null;
    const search = new MiniSearch<BurnCard>({
      idField: "card_id",
      fields: ["card_id", "acronym", "fuel_name", "fuel_formula", "test_id", "flame_type", "geometry", "hardware", "sample_description", "investigation_id"],
      searchOptions: { prefix: true, fuzzy: 0.15, boost: { acronym: 3, fuel_name: 3, card_id: 2 } },
    });
    search.addAll(cards);
    return search;
  }, [cards]);

  const options = useMemo(() => {
    if (!cards) return null;
    const unique = (values: string[]) => [...new Set(values)].sort().map((value) => ({ value, label: value }));
    return {
      fuelNames: unique(cards.filter((card) => !filters.fuelClass || card.fuel_class === filters.fuelClass).map((card) => card.fuel_name)),
      investigations: [...new Map(cards.map((card) => [card.investigation_id, card.acronym])).entries()].sort().map(([value, label]) => ({ value, label: `${label} (${value})` })),
      platforms: unique(cards.map((card) => card.platform)),
      outcomes: unique(cards.map((card) => card.outcome)).map((option) => ({ ...option, label: outcomeLabels[option.value] ?? option.value })),
    };
  }, [cards, filters.fuelClass]);

  const filtered = useMemo(() => {
    if (!cards) return [];
    let pool = cards;
    if (filters.q.trim() && index) {
      const hits = new Set(index.search(filters.q.trim()).map((hit) => hit.id as string));
      pool = pool.filter((card) => hits.has(card.card_id));
    }
    return pool.filter(
      (card) =>
        (!filters.fuelClass || card.fuel_class === filters.fuelClass) &&
        (!filters.fuelName || card.fuel_name === filters.fuelName) &&
        (!filters.investigation || card.investigation_id === filters.investigation) &&
        (!filters.gravity || normalizeGravity(card.gravity_regime) === filters.gravity) &&
        (!filters.platform || card.platform === filters.platform) &&
        (!filters.outcome || card.outcome === filters.outcome) &&
        (!filters.tier || card.habitat_relevance_tier === filters.tier) &&
        (!filters.flagged || card.quality_flags.length > 0) &&
        inRange(card.o2_pct, filters.o2Min, filters.o2Max) &&
        inRange(card.pressure_kpa, filters.pMin, filters.pMax) &&
        inRange(card.flow_cm_s, filters.flowMin, filters.flowMax),
    );
  }, [cards, filters, index]);

  const activeCount = Object.entries(filters).filter(([key, value]) => key !== "q" && value !== "" && value !== false).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Flame Library</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Every burn, every investigation</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Search 1,732 burn cards and 30 investigations. Values marked ≈ with a dotted underline are platform-nominal or approximate; ⚑ marks quality flags.
          </p>
        </div>
        <div className="flex rounded-lg border border-line p-0.5 text-sm" role="tablist" aria-label="Library view">
          {(["cards", "investigations"] as const).map((value) => (
            <button key={value} role="tab" aria-selected={tab === value} type="button" onClick={() => setTab(value)} className={`rounded-md px-3 py-1.5 capitalize ${tab === value ? "bg-panel-2 text-ink" : "text-muted"}`}>
              {value === "cards" ? "Burn cards" : "Investigations"}
            </button>
          ))}
        </div>
      </div>

      <div className="panel p-4">
        <p className="text-sm leading-relaxed"><strong>About evidence labels:</strong> the A–F badges on records are dataset relevance bands around the exploration atmosphere. They are distinct from this app’s Measured / Interpolated / Extrapolated / Analog / No data grades.</p>
        <div className="mt-3"><EvidenceTierGuide compact /></div>
      </div>

      {tab === "investigations" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {investigations.map((investigation) => (
            <Link key={investigation.investigation_id} href={`/library/${encodeURIComponent(investigation.investigation_id)}`} className="panel group p-4 hover:border-ember/50">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold group-hover:text-ember">{investigation.acronym}</p>
                <span className="num text-[11px] text-faint">{investigation.investigation_id}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{investigation.title}</p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                <span className="num rounded border border-line px-1.5 py-0.5">{investigation.cardCount} cards</span>
                {investigation.bestTier ? <span className="num rounded border border-line px-1.5 py-0.5">best dataset band {investigation.bestTier}</span> : null}
                {!investigation.in_scope ? <span className="rounded border border-line px-1.5 py-0.5 text-faint">out of scope</span> : null}
                {(investigation.fire_safety_roles ?? "")
                  .split(";")
                  .filter(Boolean)
                  .map((role) => (
                    <span key={role} className="rounded border border-ember/30 px-1.5 py-0.5 text-ember-soft">
                      {role}
                    </span>
                  ))}
                {investigation.status ? <span className="rounded border border-habitat/30 px-1.5 py-0.5 text-habitat">{investigation.status}</span> : null}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[15rem_1fr]">
          <aside className="panel h-fit space-y-3 p-4 lg:sticky lg:top-20" aria-label="Filters">
            <label className="block">
              <span className="eyebrow">Search</span>
              <input type="search" value={filters.q} onChange={(event) => set("q", event.target.value)} placeholder="PMMA, FLEX, heptane…" className="mt-1 w-full rounded-md border border-line bg-panel-2 px-2.5 py-1.5 text-sm" />
            </label>
            {options ? (
              <>
                <Select label="Fuel class" value={filters.fuelClass} onChange={(value) => setFilters((previous) => ({ ...previous, fuelClass: value, fuelName: "" }))} options={["gas", "liquid", "solid"].map((value) => ({ value, label: value }))} />
                <Select label="Fuel / material" value={filters.fuelName} onChange={(value) => set("fuelName", value)} options={options.fuelNames} />
                <Select label="Investigation" value={filters.investigation} onChange={(value) => set("investigation", value)} options={options.investigations} />
                <Select label="Gravity regime" value={filters.gravity} onChange={(value) => set("gravity", value)} options={["microgravity", "lunar", "earth"].map((value) => ({ value, label: value }))} />
                <Select label="Platform" value={filters.platform} onChange={(value) => set("platform", value)} options={options.platforms} />
                <Select label="Outcome" value={filters.outcome} onChange={(value) => set("outcome", value)} options={options.outcomes} />
                <Select label="Dataset relevance band" value={filters.tier} onChange={(value) => set("tier", value)} options={Object.entries(datasetTierLabels).map(([value, meta]) => ({ value, label: `${meta.short}: ${meta.label}` }))} />
                <RangeInputs label="O₂" unit="%" min={filters.o2Min} max={filters.o2Max} onMin={(value) => set("o2Min", value)} onMax={(value) => set("o2Max", value)} />
                <RangeInputs label="Pressure" unit="kPa" min={filters.pMin} max={filters.pMax} onMin={(value) => set("pMin", value)} onMax={(value) => set("pMax", value)} />
                <RangeInputs label="Flow" unit="cm/s" min={filters.flowMin} max={filters.flowMax} onMin={(value) => set("flowMin", value)} onMax={(value) => set("flowMax", value)} />
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={filters.flagged} onChange={(event) => set("flagged", event.target.checked)} />
                  Has quality flags
                </label>
                {activeCount || filters.q ? (
                  <button type="button" onClick={() => setFilters(emptyFilters)} className="w-full rounded-md border border-line px-2 py-1.5 text-xs text-muted hover:text-ink">
                    Clear {activeCount + (filters.q ? 1 : 0)} filter(s)
                  </button>
                ) : null}
              </>
            ) : null}
          </aside>
          <section aria-labelledby="results-title">
            <h2 id="results-title" className="num mb-2 text-sm text-muted" aria-live="polite">
              {cards ? `${filtered.length} of ${cards.length} cards` : error ?? "Loading burn cards…"}
            </h2>
            <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.slice(0, shown).map((card) => (
                <li key={card.card_id}>
                  <button type="button" onClick={() => setSelected(card)} className="panel block h-full w-full p-3 text-left hover:border-ember/50">
                    <div className="flex items-center justify-between gap-2">
                      <span className="num text-xs text-habitat">{card.card_id}</span>
                      <span className="flex items-center gap-2">
                        <FlagIcon flags={card.quality_flags} />
                        <span className="num rounded border border-line px-1 text-[10px]" aria-label={`Dataset relevance band ${datasetTierLabels[card.habitat_relevance_tier]?.short}: ${datasetTierLabels[card.habitat_relevance_tier]?.label}`} title={datasetTierLabels[card.habitat_relevance_tier]?.label}>
                          {datasetTierLabels[card.habitat_relevance_tier]?.short}
                        </span>
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                      <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: fuelColors[card.fuel_class] }} aria-hidden />
                      {card.fuel_name}
                    </p>
                    <p className="truncate text-[11px] text-muted">
                      {card.acronym} · {card.flame_type}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <Value value={card.o2_pct} unit="% O₂" basis={card.o2_basis} hasRange={card.o2_pct_low !== null} />
                      <Value value={card.pressure_kpa} unit="kPa" basis={card.pressure_basis} />
                      {card.flow_cm_s !== null ? <Value value={card.flow_cm_s} unit="cm/s" /> : null}
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted">
                      {outcomeLabels[card.outcome] ?? card.outcome} · {normalizeGravity(card.gravity_regime)}
                      {basisKind(card.o2_basis) === "nominal" ? " · nominal atmosphere" : ""}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted">Dataset band {datasetTierLabels[card.habitat_relevance_tier]?.short}: {datasetTierLabels[card.habitat_relevance_tier]?.label}</p>
                  </button>
                </li>
              ))}
            </ul>
            {filtered.length > shown ? (
              <button type="button" onClick={() => setShown((value) => value + PAGE * 2)} className="mt-4 w-full rounded-md border border-line py-2 text-sm text-muted hover:text-ink">
                Show more ({filtered.length - shown} remaining)
              </button>
            ) : null}
          </section>
        </div>
      )}
      <CardDrawer card={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
