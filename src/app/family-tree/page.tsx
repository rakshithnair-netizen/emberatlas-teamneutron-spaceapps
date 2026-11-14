import type { Metadata } from "next";
import { Suspense } from "react";
import { FamilyTreeView, type TreeNodeInfo } from "@/components/FamilyTreeView";
import { burnCards, familyEdges, investigations } from "@/lib/data";

export const metadata: Metadata = { title: "Family Tree" };

export default function FamilyTreePage() {
  const nodes: TreeNodeInfo[] = investigations.map((investigation) => ({
    investigation_id: investigation.investigation_id,
    acronym: investigation.acronym,
    title: investigation.title,
    in_scope: investigation.in_scope,
    start_date: investigation.start_date,
    status: investigation.status,
    fire_safety_roles: investigation.fire_safety_roles,
    cardCount: burnCards.filter((card) => card.investigation_id === investigation.investigation_id).length,
  }));
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading family tree…</p>}>
      <FamilyTreeView nodes={nodes} edges={familyEdges} />
    </Suspense>
  );
}
