import type { Metadata } from "next";
import { Suspense } from "react";
import type { Hull } from "@/components/EnvelopeMap";
import { MatcherView } from "@/components/MatcherView";
import { derived } from "@/lib/data";

export const metadata: Metadata = { title: "Condition Matcher" };

export default function MatcherPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-muted">Loading matcher…</p>}>
      <MatcherView hulls={derived.hulls as Hull[]} />
    </Suspense>
  );
}
