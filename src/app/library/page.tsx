import type { Metadata } from "next";
import { Suspense } from "react";
import { LibraryView, type InvestigationSummary } from "@/components/LibraryView";
import { burnCards, envelopes, investigations } from "@/lib/data";

export const metadata: Metadata = { title: "Flame Library" };

export default function LibraryPage() {
  const summaries: InvestigationSummary[] = investigations
    .map((investigation) => ({
      investigation_id: investigation.investigation_id,
      acronym: investigation.acronym,
      title: investigation.title,
      status: investigation.status,
      in_scope: investigation.in_scope,
      fire_safety_roles: investigation.fire_safety_roles,
      platform: investigation.platform,
      start_date: investigation.start_date,
      data_origin: investigation.data_origin,
      cardCount: burnCards.filter((card) => card.investigation_id === investigation.investigation_id).length,
      bestTier: envelopes.find((envelope) => envelope.investigation_id === investigation.investigation_id)?.best_tier ?? null,
    }))
    .sort((a, b) => b.cardCount - a.cardCount || a.acronym.localeCompare(b.acronym));
  return (
    <Suspense fallback={<p className="text-sm text-ink-muted">Loading library…</p>}>
      <LibraryView investigations={summaries} />
    </Suspense>
  );
}
