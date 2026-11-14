"use client";

import "@xyflow/react/dist/style.css";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Background, Controls, MarkerType, Position, ReactFlow, type Edge, type Node } from "@xyflow/react";
import { edgeStyleKind, isComputedBasis } from "@/lib/family";
import type { FamilyTreeEdge } from "@/lib/types";
import { SourceChips } from "./SourceChips";

export interface TreeNodeInfo {
  investigation_id: string;
  acronym: string;
  title: string;
  in_scope: boolean;
  start_date: string | null;
  status: string | null;
  fire_safety_roles: string | null;
  cardCount: number;
}

const families: { name: string; ids: string[]; color: string }[] = [
  { name: "Saffire large-scale fire", ids: ["PSI-98", "PSI-99", "PSI-100", "SAFFIRE-IV", "SAFFIRE-V", "SAFFIRE-VI"], color: "#ff7a3d" },
  { name: "Partial gravity", ids: ["LUCI", "FM2"], color: "#d8a6ff" },
  { name: "Solids (BASS)", ids: ["PSI-26", "PSI-25", "PSI-62"], color: "#f5d04c" },
  { name: "Droplets and cool flames", ids: ["PSI-69", "PSI-68", "PSI-39", "PSI-117", "PSI-142"], color: "#b294ff" },
  { name: "Gas flames (ACME)", ids: ["PSI-20", "PSI-21", "PSI-22", "PSI-23", "PSI-10", "PSI-159"], color: "#ff8a4c" },
  { name: "Smoke and soot", ids: ["PSI-47", "PSI-102", "PSI-115", "PSI-106", "PSI-107", "PSI-60"], color: "#22d3ee" },
  { name: "Out of scope", ids: ["PSI-108", "PSI-181"], color: "#6b7a8a" },
];

const highlightPairs = new Set(["PSI-98>PSI-99", "PSI-99>PSI-100", "PSI-100>SAFFIRE-IV", "SAFFIRE-IV>SAFFIRE-V", "SAFFIRE-V>SAFFIRE-VI", "LUCI>FM2", "SAFFIRE-VI>LUCI"]);

function startYear(value: string | null): number | null {
  const match = value?.match(/(19|20)\d{2}/);
  return match ? Number(match[0]) : null;
}

const kindStyle = {
  curated: { stroke: "#ff7a3d", dash: undefined, width: 2 },
  derived: { stroke: "#4b5d70", dash: "6 5", width: 1 },
  related: { stroke: "#8ea2b6", dash: "1.5 4", width: 1.3 },
};

export function FamilyTreeView({ nodes: nodeInfo, edges: edgeRows }: { nodes: TreeNodeInfo[]; edges: FamilyTreeEdge[] }) {
  const params = useSearchParams();
  const [layout, setLayout] = useState<"family" | "timeline">("family");
  const [kinds, setKinds] = useState({ curated: true, derived: false, related: true });
  const [sharedFilter, setSharedFilter] = useState("");
  const [inScopeOnly, setInScopeOnly] = useState(false);
  const [highlight, setHighlight] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(params.get("focus"));
  const [hoveredEdge, setHoveredEdge] = useState<FamilyTreeEdge | null>(null);

  const infoById = useMemo(() => new Map(nodeInfo.map((node) => [node.investigation_id, node])), [nodeInfo]);

  const sharedOptions = useMemo(() => {
    const values = new Set<string>();
    edgeRows.filter((edge) => edge.edge_type.startsWith("shared")).forEach((edge) => edge.shared_items.split(";").forEach((item) => values.add(`${edge.edge_type === "shared_fuel" ? "fuel" : "hardware"}:${item.trim()}`)));
    return [...values].sort();
  }, [edgeRows]);

  const visibleIds = useMemo(() => new Set(nodeInfo.filter((node) => !inScopeOnly || node.in_scope).map((node) => node.investigation_id)), [nodeInfo, inScopeOnly]);

  const flowNodes: Node[] = useMemo(() => {
    const result: Node[] = [];
    families.forEach((family, row) => {
      family.ids.forEach((id, column) => {
        const info = infoById.get(id);
        if (!info || !visibleIds.has(id)) return;
        const year = startYear(info.start_date);
        const position =
          layout === "family"
            ? { x: column * 190 + (row % 2) * 40, y: row * 120 }
            : { x: year ? (year - 1999) * 70 : -200, y: row * 110 + (column % 2) * 44 };
        const selected = id === selectedId;
        result.push({
          id,
          position,
          sourcePosition: layout === "family" && row === 0 ? Position.Right : Position.Bottom,
          targetPosition: layout === "family" && row === 0 ? Position.Left : Position.Top,
          data: {
            label: (
              <div className="text-left">
                <div className="num text-[10px] opacity-70">
                  {id}
                  {layout === "timeline" ? ` · ${year ?? "no date"}` : ""}
                </div>
                <div className="text-[12px] font-semibold leading-tight">{info.acronym}</div>
                <div className="text-[10px] opacity-70">{info.cardCount ? `${info.cardCount} cards` : info.status ?? "no cards"}</div>
              </div>
            ),
          },
          style: {
            background: selected ? `${family.color}33` : "#0c1219",
            border: `1.5px solid ${selected ? family.color : `${family.color}88`}`,
            color: "#e7edf3",
            borderRadius: 10,
            width: 150,
            padding: 8,
            opacity: info.in_scope ? 1 : 0.55,
          },
        });
      });
    });
    return result;
  }, [infoById, layout, selectedId, visibleIds]);

  const flowEdges: Edge[] = useMemo(() => {
    return edgeRows
      .filter((edge) => kinds[edgeStyleKind(edge.edge_type)])
      .filter((edge) => visibleIds.has(edge.source_investigation) && visibleIds.has(edge.target_investigation))
      .filter((edge) => {
        if (!sharedFilter) return true;
        const [type, item] = sharedFilter.split(":");
        return edge.edge_type === (type === "fuel" ? "shared_fuel" : "shared_hardware") && edge.shared_items.split(";").map((value) => value.trim()).includes(item);
      })
      .map((edge) => {
        const kind = edgeStyleKind(edge.edge_type);
        const style = kindStyle[kind];
        const highlighted = highlight && highlightPairs.has(`${edge.source_investigation}>${edge.target_investigation}`);
        const touchesSelected = selectedId && (edge.source_investigation === selectedId || edge.target_investigation === selectedId);
        return {
          id: edge.edge_id,
          source: edge.source_investigation,
          target: edge.target_investigation,
          animated: highlighted,
          type: layout === "family" ? "default" : "smoothstep",
          markerEnd: edge.directed ? { type: MarkerType.ArrowClosed, color: highlighted ? "#ffb07f" : style.stroke, width: 14, height: 14 } : undefined,
          style: {
            stroke: highlighted ? "#ffb07f" : touchesSelected ? "#22d3ee" : style.stroke,
            strokeWidth: highlighted ? 3 : touchesSelected ? style.width + 1 : style.width,
            strokeDasharray: style.dash,
            opacity: selectedId && !touchesSelected && !highlighted ? 0.25 : 1,
          },
          data: { row: edge },
        } satisfies Edge;
      });
  }, [edgeRows, kinds, visibleIds, sharedFilter, highlight, selectedId, layout]);

  const selected = selectedId ? infoById.get(selectedId) : null;
  const selectedEdges = selectedId ? edgeRows.filter((edge) => edge.source_investigation === selectedId || edge.target_investigation === selectedId) : [];

  return (
    <div className="space-y-4">
      <div>
        <p className="eyebrow">Family Tree</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">How the investigations connect</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Solid orange edges are curated lineage stated by NASA or by investigation titles. Dashed edges are <strong className="text-ink">computed</strong> from shared hardware or fuel in the burn cards, not NASA-stated. Dotted edges are topical relations. The highlighted path follows Saffire-I → VI → LUCI → FM2.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs" role="group" aria-label="Tree options">
        <div className="flex rounded-md border border-line" role="group" aria-label="Layout">
          {(["family", "timeline"] as const).map((value) => (
            <button key={value} type="button" aria-pressed={layout === value} onClick={() => setLayout(value)} className={`px-2.5 py-1.5 capitalize ${layout === value ? "bg-panel-2 text-ink" : "text-muted"}`}>
              {value === "family" ? "By family" : "Timeline"}
            </button>
          ))}
        </div>
        {(Object.keys(kinds) as (keyof typeof kinds)[]).map((kind) => (
          <label key={kind} className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel-2 px-2.5 py-1.5">
            <input type="checkbox" checked={kinds[kind]} onChange={(event) => setKinds((previous) => ({ ...previous, [kind]: event.target.checked }))} />
            <svg width="22" height="6" aria-hidden>
              <line x1="0" y1="3" x2="22" y2="3" stroke={kindStyle[kind].stroke} strokeWidth="2" strokeDasharray={kindStyle[kind].dash} />
            </svg>
            {kind === "curated" ? "Curated lineage" : kind === "derived" ? "Derived (computed)" : "Related"}
          </label>
        ))}
        <select value={sharedFilter} onChange={(event) => { setSharedFilter(event.target.value); if (event.target.value) setKinds((previous) => ({ ...previous, derived: true })); }} className="rounded-md border border-line bg-panel-2 px-2 py-1.5" aria-label="Filter by shared hardware or fuel">
          <option value="">Any shared hardware / fuel</option>
          {sharedOptions.map((option) => (
            <option key={option} value={option}>
              {option.replace(":", ": ")}
            </option>
          ))}
        </select>
        <label className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel-2 px-2.5 py-1.5">
          <input type="checkbox" checked={inScopeOnly} onChange={(event) => setInScopeOnly(event.target.checked)} />
          In scope only
        </label>
        <label className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel-2 px-2.5 py-1.5">
          <input type="checkbox" checked={highlight} onChange={(event) => setHighlight(event.target.checked)} />
          Highlight Saffire → LUCI → FM2
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="panel relative h-[560px] overflow-hidden" aria-label="Family tree graph">
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            nodesDraggable
            onNodeClick={(_, node) => setSelectedId(node.id === selectedId ? null : node.id)}
            onEdgeMouseEnter={(_, edge) => setHoveredEdge((edge.data as { row: FamilyTreeEdge }).row)}
            onEdgeMouseLeave={() => setHoveredEdge(null)}
            onEdgeClick={(_, edge) => setHoveredEdge((edge.data as { row: FamilyTreeEdge }).row)}
            proOptions={{ hideAttribution: true }}
            colorMode="dark"
            style={{ background: "transparent" }}
            minZoom={0.2}
          >
            <Background color="#1f2b38" gap={24} />
            <Controls showInteractive={false} />
          </ReactFlow>
          {hoveredEdge ? (
            <div className="pointer-events-none absolute bottom-3 left-3 max-w-sm rounded-lg border border-line-strong bg-panel/95 p-3 text-xs shadow-xl">
              <p className="num">
                {hoveredEdge.source_investigation} → {hoveredEdge.target_investigation}
              </p>
              <p className="mt-1 font-medium">{hoveredEdge.edge_type.replace(/_/g, " ")}</p>
              <p className="mt-1 text-muted">{hoveredEdge.shared_items}</p>
              <p className="mt-1">
                Basis: {hoveredEdge.basis.replace(/_/g, " ")}
                {isComputedBasis(hoveredEdge.basis) ? <span className="text-tier-extrapolated"> (computed, not NASA-stated)</span> : null}
              </p>
            </div>
          ) : null}
          {layout === "timeline" ? <p className="num pointer-events-none absolute right-3 top-3 text-[10px] text-muted">x = start year (undated investigations at left)</p> : null}
        </div>

        <aside className="space-y-3">
          <section className="panel p-4">
            <h2 className="eyebrow">Families</h2>
            <ul className="mt-2 space-y-1 text-xs">
              {families.map((family) => (
                <li key={family.name} className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: family.color }} aria-hidden />
                  {family.name} <span className="num text-faint">({family.ids.length})</span>
                </li>
              ))}
            </ul>
          </section>
          {selected ? (
            <section className="panel p-4" aria-live="polite">
              <p className="num text-[11px] text-muted">{selected.investigation_id}</p>
              <h2 className="font-semibold">{selected.acronym}</h2>
              <p className="mt-1 text-sm text-muted">{selected.title}</p>
              <p className="mt-2 text-xs">
                {selected.cardCount} cards · {selected.start_date ?? "start date not given"} {selected.status ? `· ${selected.status}` : ""}
              </p>
              <Link href={`/library/${encodeURIComponent(selected.investigation_id)}`} className="mt-3 inline-block rounded-md bg-ember px-3 py-1.5 text-sm font-medium text-black">
                Open investigation page
              </Link>
              <h3 className="eyebrow mt-4">Edges ({selectedEdges.length})</h3>
              <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto text-xs">
                {selectedEdges.map((edge) => (
                  <li key={edge.edge_id}>
                    <span className="num">
                      {edge.source_investigation} → {edge.target_investigation}
                    </span>{" "}
                    <span className={edgeStyleKind(edge.edge_type) === "curated" ? "text-ember" : "text-muted"}>{edge.edge_type.replace(/_/g, " ")}</span>
                    <span className="block text-muted">
                      {edge.shared_items} · {isComputedBasis(edge.basis) ? "computed" : edge.basis.replace(/_/g, " ")}
                    </span>
                    <SourceChips ids={edge.evidence_source_ids} label="" />
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <p className="panel p-4 text-sm text-muted">Select a node to see its edges and open its investigation page. Hover an edge to see how it was established.</p>
          )}
        </aside>
      </div>
      <p className="sr-only">
        Text summary: curated lineage runs Saffire-I (PSI-98) to Saffire-II (PSI-99) to Saffire-III (PSI-100) to Saffire-IV, V and VI; Saffire-VI is complementary to LUCI, and LUCI is the precursor of FM2. FLEX-2 follows FLEX; DAFT preceded SAME; BASS-II follows BASS.
      </p>
    </div>
  );
}
