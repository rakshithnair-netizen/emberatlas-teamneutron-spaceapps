import type { Metadata } from "next";
import { EvidenceBadge, tierOrder } from "@/components/EvidenceBadge";
import { datasetTierLabels, describeFlag } from "@/lib/basis";
import { burnCards, campaigns, derived, discrepancies, reconciliation, rejectedRows, sources } from "@/lib/data";
import { evidenceTierMeta } from "@/lib/evidence";

export const metadata: Metadata = { title: "Data & Method" };

const tables = [
  "burn_cards",
  "investigations",
  "investigation_envelope",
  "habitat_atmospheres",
  "family_tree_edges",
  "findings",
  "test_campaigns",
  "test_platforms",
  "sources",
  "known_discrepancies",
  "publications",
  "rejected_rows",
  "qa_reconciliation",
];

const steps = [
  { title: "NASA PSI repository", text: "22 experimental tables from psi.nasa.gov (ACME, BASS, FLEX, SPICE, SAME, Saffire I–III…)" },
  { title: "NASA publications", text: "NTRS reports and fact sheets: Saffire IV–VI, LUCI, FM2, habitat atmospheres, findings" },
  { title: "Clean and reconcile", text: "Units to kPa and %, basis recorded, blanks kept blank, flags and discrepancies logged" },
  { title: "Burn cards", text: `${burnCards.length} cards + ${campaigns.length} campaign rows; rejected rows logged with a reason` },
  { title: "This app", text: "Hulls, distances and tiers computed at build (scripts/prepare-data.ts); nothing added" },
];

export default function MethodPage() {
  const rejectedByReason = new Map<string, number>();
  for (const row of rejectedRows) rejectedByReason.set(row.reason, (rejectedByReason.get(row.reason) ?? 0) + 1);
  const flagCounts = new Map<string, number>();
  for (const card of burnCards) for (const flag of card.quality_flags) flagCounts.set(flag, (flagCounts.get(flag) ?? 0) + 1);
  const rawTotal = reconciliation.reduce((sum, row) => sum + Number(row.raw_records), 0);
  const producedTotal = reconciliation.reduce((sum, row) => sum + Number(row.cards_or_campaign_rows), 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Data &amp; Method</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Where every number comes from</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          The app shows only values present in the dataset. A blank is shown as “—” and means the source did not report it. Platform-nominal or approximate values are prefixed with ≈ and underlined with dots.
        </p>
      </div>

      <section aria-labelledby="pipeline-title">
        <h2 id="pipeline-title" className="text-lg font-semibold">
          Pipeline
        </h2>
        <ol className="mt-3 grid gap-2 md:grid-cols-5">
          {steps.map((step, index) => (
            <li key={step.title} className="panel relative p-3">
              <p className="num text-[11px] text-ember">0{index + 1}</p>
              <p className="mt-1 text-sm font-medium">{step.title}</p>
              <p className="mt-1 text-xs text-muted">{step.text}</p>
              {index < steps.length - 1 ? (
                <span aria-hidden className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-faint md:block">
                  →
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel p-4" aria-labelledby="recon-title">
          <h2 id="recon-title" className="font-semibold">
            Row reconciliation
          </h2>
          <p className="mt-1 text-xs text-muted">Every raw record becomes a card or campaign row, or is logged in rejected_rows.</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-xs">
              <thead>
                <tr className="text-left text-muted">
                  <th className="py-1 font-normal">Source file</th>
                  <th className="py-1 text-right font-normal">Raw</th>
                  <th className="py-1 text-right font-normal">Rows produced</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {reconciliation.map((row) => (
                  <tr key={row.source_file}>
                    <td className="py-1 pr-2 break-all">{row.source_file}</td>
                    <td className="num py-1 text-right">{row.raw_records}</td>
                    <td className="num py-1 text-right">{row.cards_or_campaign_rows}</td>
                  </tr>
                ))}
                <tr className="font-medium">
                  <td className="py-1.5">Total</td>
                  <td className="num py-1.5 text-right">{rawTotal}</td>
                  <td className="num py-1.5 text-right">{producedTotal}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <div className="space-y-4">
          <section className="panel p-4" aria-labelledby="rejected-title">
            <h2 id="rejected-title" className="font-semibold">
              Rejected rows by reason
            </h2>
            <ul className="mt-2 space-y-1 text-sm">
              {[...rejectedByReason.entries()].sort((a, b) => b[1] - a[1]).map(([reason, count]) => (
                <li key={reason} className="flex justify-between gap-2">
                  <span>{reason}</span>
                  <span className="num">{count}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="panel p-4" aria-labelledby="dist-title">
            <h2 id="dist-title" className="font-semibold">
              Distance and tiers
            </h2>
            <p className="num mt-2 rounded bg-panel-2 px-3 py-2 text-sm">d = √( ((O₂ − 34)/10)² + ((p_kPa − 56.5)/40)² )</p>
            <p className="mt-2 text-xs text-muted">The same metric the dataset uses. 10 O₂ points or 40 kPa each count as one unit. 1 psia = 6.894757 kPa.</p>
            <h3 className="eyebrow mt-3">Dataset habitat tiers (per card)</h3>
            <ul className="mt-1 space-y-0.5 text-xs">
              {Object.entries(datasetTierLabels).map(([key, meta]) => (
                <li key={key}>
                  <span className="num">{meta.short}</span> {meta.label} <span className="num text-faint">({(derived.tierCounts as Record<string, number>)[key] ?? 0} cards)</span>
                </li>
              ))}
            </ul>
            <h3 className="eyebrow mt-3">App evidence tiers (per question)</h3>
            <ul className="mt-1 space-y-1.5 text-xs">
              {tierOrder.map((tier) => (
                <li key={tier} className="flex flex-wrap items-start gap-2">
                  <EvidenceBadge tier={tier} size="sm" compact />
                  <span className="text-muted">{evidenceTierMeta[tier].description}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-muted">
              Interpolated uses the convex hull of cards in normalized (p/40, O₂/10) space for the same fuel class and gravity regime. Analog requires a related card within d ≤ 3; beyond that the answer is No data. Lunar and Mars habitats rank against lunar-gravity evidence; ISS and Shuttle rank against microgravity evidence.
            </p>
          </section>
        </div>
      </div>

      <section className="panel p-4" id="discrepancies" aria-labelledby="disc-title">
        <h2 id="disc-title" className="font-semibold">
          Known discrepancies ({discrepancies.length})
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] text-xs">
            <thead>
              <tr className="text-left text-muted">
                <th className="py-1 pr-2 font-normal">Investigation</th>
                <th className="py-1 pr-2 font-normal">Record</th>
                <th className="py-1 pr-2 font-normal">Field</th>
                <th className="py-1 pr-2 font-normal">Primary value</th>
                <th className="py-1 pr-2 font-normal">Conflicting / expected</th>
                <th className="py-1 font-normal">Handling</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line align-top">
              {discrepancies.map((row, index) => (
                <tr key={index}>
                  <td className="num py-1.5 pr-2">{row.investigation}</td>
                  <td className="py-1.5 pr-2">{row.record}</td>
                  <td className="py-1.5 pr-2">{row.field}</td>
                  <td className="py-1.5 pr-2">{row.psi_or_primary_value}</td>
                  <td className="py-1.5 pr-2">{row.conflicting_or_expected_value}</td>
                  <td className="py-1.5 text-muted">{row.handling}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted">Also from the dataset README: Saffire-VI results could not be re-read from the PDF (flag results_table_recheck_against_pdf); BASS and BASS-II pressure and O₂ are platform-nominal; SPICE has no year; family-tree edges with a derived basis are computed, not NASA statements.</p>
      </section>

      <section className="panel p-4" aria-labelledby="flags-title">
        <h2 id="flags-title" className="font-semibold">
          Quality flags in plain English
        </h2>
        <ul className="mt-3 grid gap-x-6 gap-y-1 text-xs md:grid-cols-2">
          {[...flagCounts.entries()].sort((a, b) => b[1] - a[1]).map(([flag, count]) => (
            <li key={flag} className="flex justify-between gap-3 border-b border-line/50 py-1">
              <span>
                {describeFlag(flag)} <span className="num text-faint">{flag}</span>
              </span>
              <span className="num">{count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel p-4" aria-labelledby="downloads-title">
        <h2 id="downloads-title" className="font-semibold">
          Downloads
        </h2>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((table) => (
            <li key={table} className="flex items-center justify-between gap-2 rounded-md border border-line px-3 py-2">
              <span className="num text-xs">{table}</span>
              <span className="flex gap-2 text-xs">
                <a href={`/data/csv/${table}.csv`} download className="text-habitat hover:underline">
                  CSV
                </a>
                <a href={`/data/json/${table}.json`} download className="text-habitat hover:underline">
                  JSON
                </a>
              </span>
            </li>
          ))}
          <li className="flex items-center justify-between gap-2 rounded-md border border-line px-3 py-2">
            <span className="num text-xs">data_dictionary · datapackage</span>
            <span className="flex gap-2 text-xs">
              <a href="/data/csv/data_dictionary.csv" download className="text-habitat hover:underline">
                CSV
              </a>
              <a href="/data/csv/datapackage.json" download className="text-habitat hover:underline">
                JSON
              </a>
            </span>
          </li>
        </ul>
      </section>

      <section className="panel p-4" aria-labelledby="ai-title">
        <h2 id="ai-title" className="font-semibold">
          AI use disclosure
        </h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted">
          <li>The app code and plain-language summaries were written with the help of an AI coding assistant (Anthropic Claude) and reviewed by the team.</li>
          <li>Ask Atlas can call an LLM (Anthropic, OpenAI or Gemini, set by the deployer) only through retrieval tools over this dataset. Answers must cite tool results; uncited source IDs are dropped. Without a key, Atlas Lite answers with deterministic templates.</li>
          <li>No values were generated by AI. Every number comes from the dataset tables listed above. The rankings are a transparent formula, not a model.</li>
          <li>No AI-generated imagery is used. All diagrams and the flame illustration are hand-built SVG.</li>
          <li>This is a research screening tool, not a certification source.</li>
        </ul>
      </section>

      <section className="panel p-4" aria-labelledby="sources-title">
        <h2 id="sources-title" className="font-semibold">
          Sources ({sources.length})
        </h2>
        <ul className="mt-3 space-y-1.5 text-sm">
          {sources.map((source) => (
            <li key={source.source_id} className="grid grid-cols-[4.5rem_1fr] gap-2">
              <span className="num text-xs text-ember">{source.source_id}</span>
              <span>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-habitat">
                  {source.title}
                </a>
                <span className="block text-[11px] text-muted">
                  {source.source_type} · {source.nasa_id} · retrieved {source.retrieved}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
