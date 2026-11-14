import { gravityLabels } from "../basis";
import { findings } from "../data";
import { evidenceTierMeta } from "../evidence";
import type { EvidenceTier } from "../types";
import { classifyCondition, closestInvestigations, getInvestigation, parseQuestion, searchFindings, type SearchHit } from "./tools";

export interface AtlasCardRef {
  card_id: string;
  acronym: string;
  fuel_name: string;
  o2_pct: number | null;
  pressure_kpa: number | null;
  outcome: string;
  distance?: number | null;
}

export interface AtlasAnswer {
  mode: "lite" | "llm";
  provider: string | null;
  answer: string;
  tier: EvidenceTier;
  tierReason: string;
  sourceIds: string[];
  notKnown: string | null;
  cards: AtlasCardRef[];
  evidence: { id: string; kind: string; title: string; text: string }[];
  toolCalls: { name: string; args: unknown }[];
  refused?: boolean;
  notice?: string;
}

export const certificationPattern = /\b(certif|qualif|approve|sign[- ]?off|is it safe to fly|flight[- ]?worthy|meets? (nasa-std|requirement))/i;

export const certificationNotice =
  "Atlas is a research screening tool. It cannot certify or approve materials or hardware; NASA-STD-6001 testing and the responsible safety board decide that.";

function outcomeText(outcome: string): string {
  return outcome.replace(/_/g, " ");
}

function cite(ids: string[]): string {
  return ids.length ? ` [${[...new Set(ids)].join(", ")}]` : "";
}

export function atlasLite(question: string): AtlasAnswer {
  const parsed = parseQuestion(question);
  const hits = searchFindings(question, 6);
  const toolCalls: AtlasAnswer["toolCalls"] = [{ name: "searchFindings", args: { q: question } }];
  const evidence = hits.map((hit) => ({ id: hit.id, kind: hit.kind, title: hit.title, text: hit.text }));
  const sourceIds = new Set<string>();
  const findingHits = hits.filter((hit) => hit.kind === "finding");
  const certification = certificationPattern.test(question);

  if (parsed.wantsClosest && /investigation|experiment|research/.test(question.toLowerCase())) {
    toolCalls.push({ name: "classifyEvidence", args: { o2Pct: 34, pressureKpa: 56.54, gravity: "microgravity" } });
    const closest = closestInvestigations(6);
    const lines = closest.map(
      (envelope, index) =>
        `${index + 1}. ${envelope.investigation_id}: closest card ${envelope.closest_card_id} at ${envelope.closest_o2_pct}% O₂, ${envelope.closest_pressure_kpa} kPa (distance ${envelope.closest_distance_to_8p2psi_34pct}; ${envelope.n_tier_A} tier-A cards; fuels ${envelope.fuel_classes}).`,
    );
    closest.forEach((envelope) => getInvestigation(envelope.investigation_id).source_ids?.slice(0, 2).forEach((id: string) => sourceIds.add(id)));
    return {
      mode: "lite",
      provider: null,
      answer: `Ranked by the distance of their closest burn card to 8.2 psia / 34% O₂:\n\n${lines.join("\n")}\n\nThe top gas and droplet investigations reach the condition; for solids, Saffire-VI is the only flight test near it, at 28.8–31% O₂.`,
      tier: "measured",
      tierReason: "Gas-jet cards (ACME CFI-G) exist within distance 0.15 of the exploration atmosphere in microgravity.",
      sourceIds: [...sourceIds],
      notKnown: "Solid-material flame spread at 34% O₂ itself, and any of these conditions in partial gravity.",
      cards: [],
      evidence,
      toolCalls,
    };
  }

  if (parsed.condition) {
    toolCalls.push({ name: "classifyEvidence", args: parsed.condition });
    const result = classifyCondition(parsed.condition);
    const nearest = result.nearestCards[0];
    result.nearestCards.forEach((card) => card.source_ids.forEach((id) => sourceIds.add(id)));
    const subject = parsed.material ?? (parsed.fuelClass && parsed.fuelClass !== "any" ? `${parsed.fuelClass} fuels` : "any fuel");
    const conditionText = `${parsed.condition.o2Pct}% O₂ and ${Math.round(parsed.condition.pressureKpa * 10) / 10} kPa in ${gravityLabels[parsed.condition.gravity].toLowerCase()}`;
    const lines: string[] = [];
    if (nearest) {
      lines.push(
        `Evidence for ${subject} at ${conditionText} is ${evidenceTierMeta[result.tier].label.toLowerCase()}. The nearest card, ${nearest.card_id} (${nearest.acronym}, ${nearest.fuel_name}), was at ${nearest.o2_pct}% O₂ and ${nearest.pressure_kpa} kPa in ${nearest.gravity} and its outcome is "${outcomeText(nearest.outcome)}"${cite(nearest.source_ids)}.`,
      );
      const outcomes = [...new Set(result.nearestCards.map((card) => outcomeText(card.outcome)))];
      lines.push(`${result.nearestCards.length === 1 ? "The only comparable card records" : `Across the ${result.nearestCards.length} nearest cards the recorded outcomes are`}: ${outcomes.join(", ")}.`);
      if (nearest.quality_flags.includes("results_table_recheck_against_pdf")) lines.push("That card's published results table has not been re-verified against the PDF, so treat its values with care.");
    }
    lines.push(result.gapStatement);
    const partialIds = parsed.condition.gravity === "lunar" || parsed.condition.gravity === "mars" ? ["F033", "F038"] : [];
    const partialHits: SearchHit[] = findings
      .filter((finding) => partialIds.includes(finding.finding_id))
      .map((finding) => ({ id: finding.finding_id, kind: "finding", title: finding.subarea, text: finding.statement, sourceIds: finding.source_ids, investigationIds: finding.linked_investigations, score: 1 }));
    const relatedFindings = [...partialHits, ...findingHits.filter((hit) => !partialIds.includes(hit.id))].slice(0, partialIds.length ? 3 : 2);
    for (const hit of relatedFindings) {
      lines.push(`${hit.id}: ${hit.text.trim()}${cite(hit.sourceIds)}`);
      hit.sourceIds.forEach((id) => sourceIds.add(id));
    }
    const notKnown = [
      parsed.condition.gravity === "microgravity" ? "Behaviour in lunar or Martian gravity at this atmosphere (only 2 lunar-g cards exist, LUCI in air)." : "Any burn at this atmosphere in partial gravity; LUCI is the only partial-gravity flight data (air, normal pressure).",
      result.tier !== "measured" ? `A direct test at this condition. ${result.closeGapStatement}` : "Repeatability: most conditions have one or a few burns.",
    ].join(" ");
    return {
      mode: "lite",
      provider: null,
      answer: lines.join("\n\n"),
      tier: result.tier,
      tierReason: result.gapStatement,
      sourceIds: [...sourceIds],
      notKnown,
      cards: result.nearestCards,
      evidence,
      toolCalls,
      notice: certification ? certificationNotice : undefined,
    };
  }

  const ranked = [...findingHits, ...hits.filter((hit) => hit.kind !== "finding")].slice(0, 4);
  if (!ranked.length) {
    return {
      mode: "lite",
      provider: null,
      answer: "The dataset has no finding, investigation or card that matches this question. Try naming a material (PMMA, SIBAL, Kapton), an investigation (FLEX, Saffire, LUCI) or a condition (e.g. 34% O₂ at 8.2 psi).",
      tier: "no_data",
      tierReason: "No retrieval hits.",
      sourceIds: [],
      notKnown: "Everything about this question, as far as this dataset goes.",
      cards: [],
      evidence: [],
      toolCalls,
      notice: certification ? certificationNotice : undefined,
    };
  }
  const lines = ranked.map((hit: SearchHit) => {
    hit.sourceIds.forEach((id) => sourceIds.add(id));
    return `${hit.kind === "finding" ? hit.id : hit.title}: ${hit.text.trim().slice(0, 420)}${cite(hit.sourceIds)}`;
  });
  const partial = parsed.gravity === "lunar" || parsed.gravity === "mars" || ranked.some((hit) => hit.title.startsWith("partial_gravity"));
  const tier: EvidenceTier = partial ? "extrapolated" : findingHits.length ? "analog" : "analog";
  return {
    mode: "lite",
    provider: null,
    answer: `From the dataset:\n\n${lines.join("\n\n")}`,
    tier,
    tierReason: partial
      ? "Partial-gravity evidence is limited to 4 LUCI cards in air at normal pressure; everything else is microgravity or ground data."
      : "Answer comes from literature findings rather than a burn card at a queried condition.",
    sourceIds: [...sourceIds],
    notKnown: partial
      ? "Partial-gravity flammability at elevated O₂ / reduced pressure; FM2 is planned to test it, status unconfirmed (F038, F039)."
      : "Whether these findings hold at 34% O₂ / 8.2 psia unless a card at that condition is cited.",
    cards: [],
    evidence,
    toolCalls,
    notice: certification ? certificationNotice : undefined,
  };
}
