import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SourceChips } from "@/components/SourceChips";
import { Missing, Value } from "@/components/Value";
import { datasetTierLabels, describeFlag, normalizeGravity } from "@/lib/basis";
import { campaigns, cardsForInvestigation, discrepancies, envelopes, familyEdges, findings, investigationById, investigations, publications, sources } from "@/lib/data";
import { discrepanciesForInvestigation } from "@/lib/discrepancy";
import { isCuratedEdge } from "@/lib/family";

export function generateStaticParams() {
  return investigations.map((investigation) => ({ id: investigation.investigation_id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const investigation = investigationById(decodeURIComponent(id));
  return { title: investigation ? `${investigation.acronym} investigation` : "Investigation" };
}

function MiniTree({ id }: { id: string }) {
  const edges = familyEdges.filter((edge) => edge.source_investigation === id || edge.target_investigation === id);
  const byNeighbour = new Map<string, { other: string; curated: boolean; type: string; basis: string }>();
  for (const edge of edges) {
    const other = edge.source_investigation === id ? edge.target_investigation : edge.source_investigation;
    const candidate = { other, curated: isCuratedEdge(edge.edge_type), type: edge.edge_type, basis: edge.basis };
    const existing = byNeighbour.get(other);
    if (!existing || (candidate.curated && !existing.curated)) byNeighbour.set(other, candidate);
  }
  const neighbours = [...byNeighbour.values()].sort((a, b) => Number(b.curated) - Number(a.curated)).slice(0, 12);
  if (!neighbours.length) return <p className="text-sm text-muted">No family-tree edges for this investigation.</p>;
  const size = 300;
  const center = size / 2;
  const radius = 112;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[320px]" role="img" aria-label={`Family tree neighbours: ${neighbours.map((entry) => `${investigationById(entry.other)?.acronym ?? entry.other} (${entry.type.replace(/_/g, " ")})`).join(", ")}`}>
      {neighbours.map((entry, index) => {
        const angle = (index / neighbours.length) * Math.PI * 2 - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return (
          <g key={entry.other}>
            <line x1={center} y1={center} x2={x} y2={y} stroke={entry.curated ? "#ff7a3d" : "#4b5d70"} strokeWidth={entry.curated ? 1.8 : 1} strokeDasharray={entry.curated ? undefined : entry.type.startsWith("shared") ? "5 4" : "1.5 3"} />
            <a href={`/library/${encodeURIComponent(entry.other)}`}>
              <circle cx={x} cy={y} r="18" fill="#111a24" stroke={entry.curated ? "#ff7a3d" : "#2d3d4f"} />
              <text x={x} y={y + 3} textAnchor="middle" fontSize="7.5" fill="#e7edf3" fontFamily="var(--font-plex-mono)">
                {(investigationById(entry.other)?.acronym ?? entry.other).slice(0, 10)}
              </text>
              <title>{`${investigationById(entry.other)?.acronym ?? entry.other}: ${entry.type.replace(/_/g, " ")} (${entry.basis})`}</title>
            </a>
          </g>
        );
      })}
      <circle cx={center} cy={center} r="26" fill="#ff7a3d22" stroke="#ff7a3d" />
      <text x={center} y={center + 3} textAnchor="middle" fontSize="8.5" fill="#ffb07f" fontFamily="var(--font-plex-mono)">
        {(investigationById(id)?.acronym ?? id).slice(0, 12)}
      </text>
    </svg>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

export default async function InvestigationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const investigation = investigationById(id);
  if (!investigation) notFound();
  const cards = cardsForInvestigation(id);
  const envelope = envelopes.find((entry) => entry.investigation_id === id);
  const closestCard = envelope?.closest_card_id ? cards.find((card) => card.card_id === envelope.closest_card_id) : undefined;
  const investigationPublications = publications.filter((publication) => publication.investigation_id === id);
  const investigationDiscrepancies = discrepanciesForInvestigation(id, discrepancies);
  const investigationFindings = findings.filter((finding) => finding.linked_investigations.includes(id));
  const investigationCampaigns = campaigns.filter((campaign) => campaign.investigation_id === id);
  const flagCounts = new Map<string, number>();
  for (const card of cards) for (const flag of card.quality_flags) flagCounts.set(flag, (flagCounts.get(flag) ?? 0) + 1);
  const sourceIds = [...new Set([...cards.flatMap((card) => card.source_ids), ...(sources.some((source) => source.source_id === id) ? [id] : [])])];
  const fuels = [...new Set(cards.map((card) => card.fuel_name))];

  return (
    <article className="space-y-6">
      <div>
        <Link href="/library?tab=investigations" className="text-xs text-muted hover:text-ink">
          ← All investigations
        </Link>
        <p className="eyebrow mt-3">
          {investigation.investigation_id} · {investigation.data_origin.replace("_", " ")}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {investigation.acronym}: <span className="text-muted">{investigation.title}</span>
        </h1>
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
          {(investigation.fire_safety_roles ?? "")
            .split(";")
            .filter(Boolean)
            .map((role) => (
              <span key={role} className="rounded border border-ember/40 px-2 py-0.5 text-ember-soft">
                {role}
              </span>
            ))}
          <span className="rounded border border-line px-2 py-0.5">{investigation.in_scope ? "in scope for fire safety" : "out of scope for fire safety"}</span>
          {investigation.status ? <span className="rounded border border-habitat/40 px-2 py-0.5 text-habitat">{investigation.status}</span> : null}
        </div>
        <p className="mt-2 text-xs text-muted">Role curation: {investigation.role_curation_note}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <section className="panel space-y-4 p-5">
            <Field label="Objective">{investigation.objective}</Field>
            {investigation.hypothesis ? <Field label="Hypothesis">{investigation.hypothesis}</Field> : null}
            {investigation.approach ? <Field label="Approach">{investigation.approach}</Field> : null}
            {investigation.research_impacts_earth_benefits ? <Field label="Research impacts and Earth benefits">{investigation.research_impacts_earth_benefits}</Field> : null}
            <SourceChips ids={sourceIds} />
          </section>

          <section className="panel p-5" aria-labelledby="envelope-title">
            <h2 id="envelope-title" className="font-semibold">
              Envelope and habitat proximity
            </h2>
            {envelope ? (
              <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Field label="Cards">
                  <span className="num">
                    {envelope.n_cards} ({envelope.n_cards_with_o2_and_pressure} with O₂ and pressure)
                  </span>
                </Field>
                <Field label="O₂ range">{envelope.o2_pct_min !== null ? <span className="num">{envelope.o2_pct_min}–{envelope.o2_pct_max}%</span> : <Missing />}</Field>
                <Field label="Pressure range">{envelope.pressure_kpa_min !== null ? <span className="num">{envelope.pressure_kpa_min}–{envelope.pressure_kpa_max} kPa</span> : <Missing />}</Field>
                <Field label="Best tier">
                  <span className="num">
                    {envelope.best_tier} · {Object.entries(datasetTierLabels).find(([key]) => key.startsWith(envelope.best_tier))?.[1].label}
                  </span>
                </Field>
                <Field label="Tier counts">
                  <span className="num text-xs">
                    A {envelope.n_tier_A} · B {envelope.n_tier_B} · C {envelope.n_tier_C} · D {envelope.n_tier_D} · F {envelope.n_tier_F} · E {envelope.n_tier_E}
                  </span>
                </Field>
                <Field label="Closest card to 8.2 psia / 34%">
                  {closestCard ? (
                    <Link href={`/library?card=${closestCard.card_id}&investigation=${id}`} className="num text-habitat hover:underline">
                      {closestCard.card_id}
                    </Link>
                  ) : (
                    <Missing />
                  )}
                </Field>
                <Field label="Distance">{envelope.closest_distance_to_8p2psi_34pct !== null ? <span className="num">{envelope.closest_distance_to_8p2psi_34pct}</span> : <Missing />}</Field>
                <Field label="At">
                  {closestCard ? (
                    <span className="flex flex-col">
                      <Value value={closestCard.o2_pct} unit="% O₂" basis={closestCard.o2_basis} />
                      <Value value={closestCard.pressure_kpa} unit="kPa" basis={closestCard.pressure_basis} />
                    </span>
                  ) : (
                    <Missing />
                  )}
                </Field>
              </dl>
            ) : (
              <p className="mt-2 text-sm text-muted">No burn cards for this investigation in the dataset{investigationCampaigns.length ? `; it has ${investigationCampaigns.length} campaign rows` : ""}.</p>
            )}
            {cards.length ? (
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <Link href={`/library?investigation=${encodeURIComponent(id)}`} className="rounded-md border border-line-strong px-3 py-1.5 hover:border-habitat/60">
                  Browse {cards.length} cards
                </Link>
                {closestCard && closestCard.o2_pct !== null ? (
                  <Link href={`/matcher?o2=${closestCard.o2_pct}&p=${closestCard.pressure_kpa}&g=${normalizeGravity(closestCard.gravity_regime)}&fuel=${closestCard.fuel_class}&from=${closestCard.card_id}`} className="rounded-md border border-line-strong px-3 py-1.5 hover:border-habitat/60">
                    Match closest card
                  </Link>
                ) : null}
              </div>
            ) : null}
            {fuels.length ? <p className="mt-3 text-xs text-muted">Fuels: {fuels.join(", ")}</p> : null}
          </section>

          {investigationFindings.length ? (
            <section className="panel p-5" aria-labelledby="inv-findings-title">
              <h2 id="inv-findings-title" className="font-semibold">
                Findings
              </h2>
              <ul className="mt-3 space-y-3 text-sm">
                {investigationFindings.map((finding) => (
                  <li key={finding.finding_id}>
                    <span className="num mr-1 text-xs text-ember">{finding.finding_id}</span>
                    {finding.statement}
                    <div className="mt-1">
                      <SourceChips ids={finding.source_ids} label="" />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {investigationCampaigns.length ? (
            <section className="panel p-5" aria-labelledby="campaigns-title">
              <h2 id="campaigns-title" className="font-semibold">
                Test campaigns ({investigationCampaigns.length})
              </h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[560px] text-xs">
                  <thead>
                    <tr className="text-left text-muted">
                      <th className="py-1 font-normal">Type</th>
                      <th className="py-1 font-normal">Date</th>
                      <th className="py-1 font-normal">Fuel</th>
                      <th className="py-1 font-normal">O₂ (as printed)</th>
                      <th className="py-1 font-normal">Flames</th>
                      <th className="py-1 font-normal">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {investigationCampaigns.slice(0, 25).map((campaign) => (
                      <tr key={campaign.campaign_id}>
                        <td className="py-1.5 pr-2">{campaign.record_type.replace(/_/g, " ")}</td>
                        <td className="num py-1.5 pr-2">{campaign.date ?? <Missing />}</td>
                        <td className="py-1.5 pr-2">{campaign.fuel ?? <Missing />}</td>
                        <td className="num py-1.5 pr-2">{campaign.o2_text ?? <Missing />}</td>
                        <td className="num py-1.5 pr-2">{campaign.n_flames_ignited ?? <Missing />}</td>
                        <td className="py-1.5 text-muted">{campaign.burner_or_hardware_note ?? ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {investigationCampaigns.length > 25 ? <p className="mt-2 text-xs text-muted">Showing 25 of {investigationCampaigns.length}; full table in Data &amp; Method downloads.</p> : null}
            </section>
          ) : null}

          {investigationPublications.length ? (
            <section className="panel p-5" aria-labelledby="pubs-title">
              <h2 id="pubs-title" className="font-semibold">
                Publications ({investigationPublications.length})
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {investigationPublications.slice(0, 20).map((publication, index) => (
                  <li key={index}>
                    {publication.doi ? (
                      <a href={`https://doi.org/${publication.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-habitat">
                        {publication.title}
                      </a>
                    ) : (
                      publication.title
                    )}
                    <span className="block text-xs text-muted">{publication.authors}</span>
                  </li>
                ))}
              </ul>
              {investigationPublications.length > 20 ? <p className="mt-2 text-xs text-muted">Showing 20 of {investigationPublications.length}.</p> : null}
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <section className="panel p-4">
            <dl className="space-y-3">
              <Field label="Platform">{investigation.platform ?? <Missing />}</Field>
              <Field label="Hardware">{investigation.hardware ?? <Missing />}</Field>
              <Field label="Managing center">{investigation.managing_center ?? <Missing />}</Field>
              <Field label="Dates">
                <span className="num">
                  {investigation.start_date ?? "—"} → {investigation.end_date ?? "—"}
                </span>
              </Field>
              <Field label="Principal investigators">{investigation.principal_investigators ?? <Missing />}</Field>
              {investigation.psi_url ? (
                <Field label="PSI page">
                  <a href={investigation.psi_url} target="_blank" rel="noopener noreferrer" className="break-all text-habitat hover:underline">
                    {investigation.psi_url}
                  </a>
                </Field>
              ) : null}
            </dl>
          </section>
          <section className="panel p-4" aria-labelledby="mini-tree-title">
            <h2 id="mini-tree-title" className="eyebrow">
              Family tree
            </h2>
            <MiniTree id={id} />
            <p className="text-[11px] text-muted">Solid orange = curated lineage; dashed = derived shared hardware/fuel (computed, not NASA-stated).</p>
            <Link href={`/family-tree?focus=${encodeURIComponent(id)}`} className="mt-2 inline-block text-xs text-habitat hover:underline">
              Open full family tree →
            </Link>
          </section>
          {flagCounts.size ? (
            <section className="panel border-tier-extrapolated/30 p-4">
              <h2 className="eyebrow text-tier-extrapolated">Quality flags on these cards</h2>
              <ul className="mt-2 space-y-1 text-xs">
                {[...flagCounts.entries()].sort((a, b) => b[1] - a[1]).map(([flag, count]) => (
                  <li key={flag}>
                    <span className="num">{count}×</span> {describeFlag(flag)}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {investigationDiscrepancies.length ? (
            <section className="panel border-tier-analog/30 p-4">
              <h2 className="eyebrow text-tier-analog">Known discrepancies</h2>
              <ul className="mt-2 space-y-2 text-xs">
                {investigationDiscrepancies.map((discrepancy, index) => (
                  <li key={index}>
                    <span className="font-medium">
                      {discrepancy.record}, {discrepancy.field}
                    </span>
                    : {discrepancy.psi_or_primary_value} vs {discrepancy.conflicting_or_expected_value}. <span className="text-muted">{discrepancy.handling}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
