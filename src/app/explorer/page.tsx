import type { Metadata } from "next";
import { ExplorerView } from "@/components/ExplorerView";
import type { Hull } from "@/components/EnvelopeMap";
import { derived, envelopes } from "@/lib/data";

export const metadata: Metadata = { title: "Envelope Map" };

export default function ExplorerPage() {
  return <ExplorerView hulls={derived.hulls as Hull[]} envelopes={envelopes} />;
}
