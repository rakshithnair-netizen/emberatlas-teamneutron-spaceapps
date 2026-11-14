export const curatedEdgeTypes = ["series_succession", "precursor_of", "follow_on_of", "data_reused_by"];
export const derivedEdgeTypes = ["shared_hardware", "shared_fuel"];

export function isCuratedEdge(edgeType: string): boolean {
  return curatedEdgeTypes.includes(edgeType);
}

export function edgeStyleKind(edgeType: string): "curated" | "derived" | "related" {
  if (isCuratedEdge(edgeType)) return "curated";
  if (derivedEdgeTypes.includes(edgeType)) return "derived";
  return "related";
}

export function isComputedBasis(basis: string): boolean {
  return basis.startsWith("derived");
}
