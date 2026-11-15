"use client";

import Link from "next/link";
import { useMemo } from "react";
import findingsJson from "@/data/raw/findings.json";
import discrepanciesJson from "@/data/raw/known_discrepancies.json";
import { conditionDistance } from "@/lib/geometry";
import { classifyEvidence, evidenceTierMeta } from "@/lib/evidence";
import { discrepanciesForInvestigation } from "@/lib/discrepancy";
import { relevantFindings } from "@/lib/relevance";
import type { Finding, KnownDiscrepancy } from "@/lib/types";
import { EvidenceBadge } from "./EvidenceBadge";
import { habitatQueryGravity, useHabitat } from "./HabitatProvider";
import { gravityLabels } from "@/lib/basis";
import { SourceChips } from "./SourceChips";
import { useCards } from "./useCards";

const findings = findingsJson as unknown as Finding[];
const discrepancies = discrepanciesJson as unknown as KnownDiscrepancy[];

export function HabitatEvidenceSummary() {
  const { cards, error } = useCards();
  const { habitat } = useHabitat();
  const summary = useMemo(() => {
    if (!cards) return null;
    const nearby = cards
      .filter((card) => card.o2_pct !== null && card.pressure_kpa !== null)
      .map((card) => ({ card, distance: conditionDistance(card.o2_pct!, card.pressure_kpa!, habitat.o2_pct, habitat.pressure_kpa) }))
      .sort((a, b) => a.distance - b.distance);
    const investigations = [...new Set(nearby.slice(0, 8).map(({ card }) => card.investigation_id))];
    const gravity = habitatQueryGravity(habitat.habitat_id);
    const query = { o2Pct: habitat.o2_pct, pressureKpa: habitat.pressure_kpa, gravity, fuelClass: "solid" as const };
    const lunarSolid = classifyEvidence(query, cards);
    const nearestSources = [...new Set(nearby.slice(0, 4).flatMap(({ card }) => card.source_ids ?? []))];
    const tiedFindings = relevantFindings(query, investigations, findings, 3);
    const findingSources = [...new Set(tiedFindings.flatMap(({ finding }) => finding.source_ids))];
    const tiedDiscrepancies = [...new Map(investigations.flatMap((id) => discrepanciesForInvestigation(id, discrepancies)).map((item) => [`${item.investigation}:${item.record}:${item.field}`, item])).values()].slice(0, 3);
    return { nearby, lunarSolid, nearestSources, tiedFindings, findingSources, tiedDiscrepancies, gravity };
  }, [cards, habitat]);

  if (error) return <p className="panel p-4 text-sm text-tier-extrapolated">Could not load the burn records: {error}</p>;
  if (!summary) return <p className="panel p-4 text-sm text-muted">Loading records to compare with the selected habitat…</p>;

  return (
    <section className="panel p-5" aria-labelledby="known-unknown-title">
      <p className="eyebrow">Selected habitat · {habitat.name}</p>
      <h2 id="known-unknown-title" className="mt-1 text-xl font-semibold">What NASA has tested / what is missing</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-line bg-bg/50 p-4">
          <h3 className="font-semibold">What NASA has tested</h3>
          <p className="mt-2 text-sm leading-relaxed">The nearest located burn card is <Link className="text-habitat underline" href={`/library?card=${encodeURIComponent(summary.nearby[0]?.card.card_id ?? "")}`}>{summary.nearby[0]?.card.card_id}</Link>, at distance {summary.nearby[0]?.distance.toFixed(2)} from this target in the app’s normalized oxygen/pressure metric. The closest-card list includes records across fuel and gravity regimes.</p>
          <p className="mt-2 text-xs leading-relaxed text-muted">This identifies nearby records; it does not mean they match every habitat condition.</p>
          <div className="mt-3"><SourceChips ids={summary.nearestSources} /></div>
          {summary.tiedFindings.length ? <ul className="mt-3 space-y-2 border-t border-line pt-3">
            {summary.tiedFindings.map(({ finding, reason }) => <li key={finding.finding_id} className="text-sm leading-relaxed">
              <span className="num mr-1 text-xs text-ember">{finding.finding_id}</span>{finding.statement}
              <p className="text-xs text-muted">{reason}</p>
            </li>)}
          </ul> : null}
          <div className="mt-2"><SourceChips ids={summary.findingSources} label="Finding sources" /></div>
        </div>
        <div className="rounded-lg border border-tier-extrapolated/40 bg-bg/50 p-4">
          <h3 className="font-semibold">What is missing for solid fuel at {gravityLabels[summary.gravity]} gravity</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2"><EvidenceBadge tier={summary.lunarSolid.tier} size="sm" /><span className="text-xs leading-relaxed text-muted">{evidenceTierMeta[summary.lunarSolid.tier].description}</span></div>
          <p className="mt-2 text-sm leading-relaxed">{summary.lunarSolid.gapStatement}</p>
          <p className="mt-3 text-sm leading-relaxed"><strong>Interpretation:</strong> {summary.lunarSolid.tier === "measured" ? "The dataset includes a close test for this query; that record does not certify safety or establish behavior beyond its reported conditions." : summary.lunarSolid.tier === "interpolated" ? "The dataset supports an estimate between nearby tests, not a burn measured at the exact selected condition." : "The available evidence does not establish solid-fuel behavior for this selected atmosphere and gravity."} Use the matcher to inspect the nearest cards, caveats, and the stated gap-closing experiment.</p>
          {summary.tiedDiscrepancies.length ? <div className="mt-3 border-t border-line pt-3"><p className="text-xs font-semibold">Known source discrepancies in nearby investigations</p><ul className="mt-2 space-y-2 text-xs leading-relaxed text-muted">{summary.tiedDiscrepancies.map((item) => <li key={`${item.investigation}:${item.record}:${item.field}`}><span className="text-tier-analog">{item.investigation}</span> {item.record}, {item.field}: {item.psi_or_primary_value} vs {item.conflicting_or_expected_value}. {item.handling}</li>)}</ul></div> : null}
          <p className="mt-2 text-xs leading-relaxed text-muted">The gravity choice follows the project’s mapping: reference habitats use microgravity; exploration atmospheres and the suit use lunar gravity. These are analysis assumptions, not new test records.</p>
          <Link href={`/matcher?o2=${habitat.o2_pct}&p=${habitat.pressure_kpa}&g=${summary.gravity}&fuel=solid`} className="mt-3 inline-flex min-h-11 items-center rounded-md border border-habitat/50 px-3 text-sm text-habitat hover:bg-habitat/10">Inspect what is missing →</Link>
        </div>
      </div>
    </section>
  );
}
