"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { InsightWithTier } from "@/lib/insights-server";
import { defaultWeights, rerank, weightLabels, type RankingWeights } from "@/lib/ranking";
import { EvidenceBadge, TierIcon } from "./EvidenceBadge";
import { useHabitat } from "./HabitatProvider";
import { SourceChips } from "./SourceChips";
import { evidenceTierMeta } from "@/lib/evidence";

const areaLabels: Record<string, string> = {
  partial_gravity: "Partial gravity",
  detection: "Detection",
  suppression: "Suppression",
  habitat_materials: "Habitat materials",
  earth_application: "Earth application",
  investigation: "Investigation",
};

export function ScoreBreakdown({ insight, weights }: { insight: InsightWithTier; weights: RankingWeights }) {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0) || 1;
  return (
    <div className="space-y-1">
      {(Object.keys(weights) as (keyof RankingWeights)[]).map((key) => (
        <div key={key} className="grid grid-cols-[8.5rem_1fr_3rem] items-center gap-2 text-[11px]">
          <span className="text-ink-muted">{weightLabels[key]}</span>
          <span className="relative h-1.5 rounded bg-sand">
            <span className="absolute inset-y-0 left-0 rounded bg-clay/80" style={{ width: `${insight.components[key].value * 100}%` }} />
          </span>
          <span className="num text-right">
            {(insight.components[key].value * (weights[key] / total)).toFixed(3)}
          </span>
          <span className="col-span-3 -mt-0.5 pl-0 text-[10px] text-ink-subtle">{insight.components[key].reason}</span>
        </div>
      ))}
    </div>
  );
}

export function InsightRow({ insight, rank, weights }: { insight: InsightWithTier; rank: number; weights: RankingWeights }) {
  const href = insight.kind === "investigation" ? `/library/${insight.id}` : `/atlas?q=${encodeURIComponent(insight.title)}`;
  return (
    <li className="group rounded-xl border border-sand-strong bg-paper-raised p-4 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="num w-10 shrink-0 text-right text-3xl leading-none text-ink-subtle">{rank}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <EvidenceBadge tier={insight.tierMicro} size="sm" />
            {insight.habitatGravity === "lunar" ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted" title={`Evidence tier in lunar gravity: ${evidenceTierMeta[insight.tierHabitatGravity].label}`}>
                <TierIcon tier={insight.tierHabitatGravity} size={11} />
                lunar g: {evidenceTierMeta[insight.tierHabitatGravity].label}
              </span>
            ) : null}
            <span className="eyebrow">{areaLabels[insight.area] ?? insight.area}</span>
            <span className="num text-[11px] text-ink-subtle">{insight.id}</span>
          </div>
          <p className="mt-2 font-display text-lg font-medium leading-snug">
            <Link href={href} className="hover:text-clay-strong">
              {insight.title}
            </Link>
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{insight.statement}</p>
          <div className="mt-2">
            <SourceChips ids={insight.sourceIds} />
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer text-[11px] text-clay-strong">Why this rank? Score {insight.score.toFixed(3)}</summary>
            <div className="mt-2 rounded-lg border border-sand-strong bg-paper-raised p-2.5">
              <ScoreBreakdown insight={insight} weights={weights} />
            </div>
          </details>
        </div>
        <div className="hidden w-16 shrink-0 text-right sm:block" title="Weighted score (0–1); open “Why this rank?” for the breakdown">
          <span className="num text-lg">{insight.score.toFixed(2)}</span>
          <div className="mt-1 h-1 rounded bg-sand">
            <div className="h-1 rounded bg-clay" style={{ width: `${insight.score * 100}%` }} />
          </div>
        </div>
      </div>
    </li>
  );
}

function diversify(insights: InsightWithTier[], limit: number, perArea = 2): InsightWithTier[] {
  const counts = new Map<string, number>();
  const picked: InsightWithTier[] = [];
  for (const insight of insights) {
    const count = counts.get(insight.area) ?? 0;
    if (count >= perArea) continue;
    counts.set(insight.area, count + 1);
    picked.push(insight);
    if (picked.length === limit) break;
  }
  return picked;
}

export function HomeInsights({ byHabitat, limit = 6 }: { byHabitat: Record<string, InsightWithTier[]>; limit?: number }) {
  const { habitat } = useHabitat();
  const insights = useMemo(() => rerank(byHabitat[habitat.habitat_id] ?? [], defaultWeights) as InsightWithTier[], [byHabitat, habitat.habitat_id]);
  return (
    <ol className="space-y-4">
      {diversify(insights, limit).map((insight, index) => (
        <InsightRow key={insight.id} insight={insight} rank={index + 1} weights={defaultWeights} />
      ))}
    </ol>
  );
}
