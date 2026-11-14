import type { Metadata } from "next";
import { Suspense } from "react";
import { AtlasView } from "@/components/AtlasView";

export const metadata: Metadata = { title: "Ask Atlas" };

export default function AtlasPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading Atlas…</p>}>
      <AtlasView />
    </Suspense>
  );
}
