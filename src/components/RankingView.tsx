"use client";

import { useMemo, useState } from "react";
import type { InsightWithTier } from "@/lib/insights-server";
import { defaultWeights, insightsToCsv, rerank, weightLabels, type RankingWeights } from "@/lib/ranking";
import { useHabitat } from "./HabitatProvider";
import { InsightRow } from "./InsightList";
import { EvidenceTierGuide } from "./EvidenceTierGuide";

const weightHelp: Record<keyof RankingWeights, string> = {
  proximity: "1 − d/3 for the closest linked card to the selected habitat (d capped at 3). Habitat-materials findings use their stated 34% O₂ / 8.2 psia condition.",
  evidence: "0.5 × best dataset tier (A=1, B/C=0.6, F=0.5, D=0.35, E=0.1) + 0.25 × share of stated O₂ + 0.25 × log₁₀(cards+1)/3. Literature-only findings score 0.3.",
  consequence: "Detection, suppression and habitat materials = 1; partial gravity = 0.8; Earth applications = 0.2. Investigations: prevention/detection/suppression role = 1, modelling only = 0.5.",
  gravity: "1 if evidence exists in the habitat's gravity (lunar for exploration atmospheres, microgravity for ISS/Shuttle), 0.5 for a microgravity analog, 0.3 for Earth applications.",
  recency: "(latest linked start year − 1995) / 30; planned investigations at least 0.6; 0.5 when undated.",
};

export function RankingView({ byHabitat }: { byHabitat: Record<string, InsightWithTier[]> }) {
  const { habitat } = useHabitat();
  const [weights, setWeights] = useState<RankingWeights>(defaultWeights);
  const [kind, setKind] = useState<"all" | "finding" | "investigation">("all");
  const ranked = useMemo(
    () => (rerank(byHabitat[habitat.habitat_id] ?? [], weights) as InsightWithTier[]).filter((insight) => kind === "all" || insight.kind === kind),
    [byHabitat, habitat.habitat_id, weights, kind],
  );
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);

  const download = () => {
    const blob = new Blob([insightsToCsv(ranked, weights)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ranking-${habitat.habitat_id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow">Ranking method</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">How insights are ranked</h1>
        <p className="mt-1 max-w-3xl text-sm text-ink-muted">
          Every finding and in-scope investigation gets five transparent component scores between 0 and 1. The final score is their weighted mean. Move the sliders to change the weights; the list re-ranks for <span className="text-clay-strong">{habitat.name}</span>.
        </p>
      </div>
      <EvidenceTierGuide compact />
      <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
        <aside className="panel h-fit space-y-4 p-4 lg:sticky lg:top-20">
          {(Object.keys(weights) as (keyof RankingWeights)[]).map((key) => (
            <div key={key}>
              <label className="flex items-center justify-between text-sm" htmlFor={`weight-${key}`}>
                {weightLabels[key]}
                <span className="num text-xs text-ink-muted">
                  {weights[key].toFixed(2)} ({total ? Math.round((weights[key] / total) * 100) : 0}%)
                </span>
              </label>
              <input id={`weight-${key}`} type="range" min="0" max="1" step="0.05" value={weights[key]} onChange={(event) => setWeights((previous) => ({ ...previous, [key]: Number(event.target.value) }))} className="w-full" />
              <p className="text-[11px] leading-snug text-ink-muted">{weightHelp[key]}</p>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setWeights(defaultWeights)} className="rounded-md border border-sand-strong px-3 py-1.5 text-xs">
              Reset weights
            </button>
            <button type="button" onClick={download} className="btn btn-primary">
              Export CSV
            </button>
          </div>
        </aside>
        <section aria-labelledby="ranked-title">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="ranked-title" className="num text-sm text-ink-muted">
              {ranked.length} ranked items
            </h2>
            <div className="flex rounded-md border border-sand-strong text-xs" role="group" aria-label="Item type">
              {(["all", "finding", "investigation"] as const).map((value) => (
                <button key={value} type="button" aria-pressed={kind === value} onClick={() => setKind(value)} className={`px-2.5 py-1 capitalize ${kind === value ? "bg-sand text-ink" : "text-ink-muted"}`}>
                  {value === "all" ? "All" : `${value}s`}
                </button>
              ))}
            </div>
          </div>
          <ol className="space-y-2.5">
            {ranked.map((insight, index) => (
              <InsightRow key={insight.id} insight={insight} rank={index + 1} weights={weights} />
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
