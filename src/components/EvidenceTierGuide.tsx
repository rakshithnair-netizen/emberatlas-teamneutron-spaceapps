import { evidenceTierMeta } from "@/lib/evidence";
import type { EvidenceTier } from "@/lib/types";
import { EvidenceBadge, tierOrder } from "./EvidenceBadge";

// Collapsible plain-language glossary of the five condition-specific evidence grades. Descriptions come
// from evidenceTierMeta so the wording is defined in one place. `compact` uses a two-column grid for
// narrow sidebars instead of five columns.
export function EvidenceTierGuide({ compact = false }: { compact?: boolean }) {
  return (
    <details className="rounded-lg border border-sand-strong bg-paper/40 p-3">
      <summary className="min-h-11 cursor-pointer rounded-md text-sm font-medium text-clay-strong">What do these evidence grades mean?</summary>
      <dl className={`mt-2 grid gap-2 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-5"}`}>
        {tierOrder.map((tier: EvidenceTier) => (
          <div key={tier} className="rounded-md border border-sand-strong p-2.5">
            <dt><EvidenceBadge tier={tier} size="sm" compact /></dt>
            <dd className="mt-2 text-xs leading-relaxed text-ink-muted">{evidenceTierMeta[tier].description}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
