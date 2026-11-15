import Link from "next/link";
import { EvidenceTierGuide } from "@/components/EvidenceTierGuide";
import { EvidenceGapChart } from "@/components/EvidenceGapChart";
import { HabitatEvidenceSummary } from "@/components/HabitatEvidenceSummary";
import { HomeMatcherLink } from "@/components/HomeMatcherLink";
import { HomeHabitatCard } from "@/components/HomeHabitatCard";
import { HomeInsights } from "@/components/InsightList";
import { SourceChips } from "@/components/SourceChips";
import { SphericalFlame } from "@/components/SphericalFlame";
import { normalizeGravity } from "@/lib/basis";
import { burnCards, derived, discrepancies, findings, habitats, investigations, sources } from "@/lib/data";
import { insightsByHabitat } from "@/lib/insights-server";

const primaryTiles = [
  { href: "/matcher", title: "Check a habitat", text: "Choose conditions and inspect the grade, nearest tests, findings, caveats and open gaps." },
  { href: "/explorer", title: "Explore evidence", text: "See every located burn card against the selected atmosphere and coverage envelopes." },
  { href: "/library", title: "Sources & library", text: "Search test cards and investigations, then follow links to source material." },
  { href: "/method", title: "Method & limits", text: "Review data handling, evidence rules, uncertainties and downloads." },
];

const secondaryTiles = [
  { href: "/atlas", title: "Ask Atlas", text: "Questions answered from the dataset, with sources and what is not known." },
  { href: "/ranking", title: "Rankings", text: "See and adjust how findings are prioritized." },
  { href: "/family-tree", title: "Family Tree", text: "Explore investigation lineage and shared hardware/fuel links." },
  { href: "/learn", title: "Learn", text: "Short modules on microgravity fire, each with a diagram, sources and a quiz." },
  { href: "/earth", title: "Earth Applications", text: "Explore Earth-domain findings linked to spacecraft fire research." },
  { href: "/fire-watch", title: "Fire Watch", text: "A habitat-shift game where outcomes use NASA findings." },
];

const designerNotes = [
  { text: "At 34% O₂ and 8.2 psia, materials that pass on Earth can become flammable and need less energy to ignite.", ids: ["F054"], sources: ["S35"] },
  { text: "Melamine foam and Nomex were acceptable at 30% O₂ / 10.2 psia but flammable or unlikely acceptable at 34–40% O₂ / 8.2 psia.", ids: ["F049", "F050"], sources: ["S03"] },
  { text: "The ISS smoke detector missed Kapton smoke in half the tests and Teflon smoke in two-thirds. Detector choice matters.", ids: ["F012"], sources: ["S06"] },
  { text: "In Saffire-VI the smoke alarm threshold came at 981 s, after most of the hazardous gas had been released.", ids: ["F018"], sources: ["S01"] },
  { text: "Partial-gravity fire cannot be interpolated from 0 g and 1 g, and lunar g may be the most flammable condition for some fuels.", ids: ["F033", "F030"], sources: ["S11", "S13", "S09"] },
];

export default function HomePage() {
  const headline = derived.headline;
  const byHabitat = insightsByHabitat();
  const inScope = investigations.filter((investigation) => investigation.in_scope).length;
  // All headline numbers below are computed from the dataset so the copy cannot drift from the data.
  const exploration = habitats.find((entry) => entry.habitat_id === "HAB-03")!;
  // Rounded to one decimal so a fractional O₂ value can't render as e.g. 3.4000000000000004.
  const o2Difference = Math.round((exploration.o2_pct - headline.highestSolidMicrogravity.o2Pct) * 10) / 10;
  // Non-microgravity cards are lunar cards plus their 1 g ground controls (all LUCI).
  const earthControlCount = headline.partialGravity.nonMicrogravityCount - headline.partialGravity.lunarCount;
  // Uses the shared normalizeGravity helper so this agrees with every other gravity check in the app.
  const partialAtTargetO2 = burnCards.filter((card) => normalizeGravity(card.gravity_regime) === "lunar" && card.o2_pct === exploration.o2_pct).length;
  const tierACardIds = new Set(headline.tierA.cardIds);
  const tierASolids = burnCards.filter((card) => tierACardIds.has(card.card_id) && card.fuel_class === "solid").length;

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-line bg-panel/60 px-5 py-8 sm:px-10 sm:py-12">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow text-ember">NASA Space Apps 2026 · Flame in Freefall challenge</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Will a fire test from near Earth conditions tell us what happens inside a Moon habitat?
            </h1>
            {/* The challenge's central question, kept verbatim under the plain-language headline so judges
                can match the app to the brief. Atmosphere numbers come from the HAB-03 dataset row. */}
            <p className="mt-4 max-w-2xl border-l-2 border-habitat pl-3 text-base leading-relaxed">
              <span className="eyebrow block text-habitat">The challenge question</span>
              How relevant is the existing research to a habitat with <span className="text-habitat">higher oxygen</span> and <span className="text-habitat">lower pressure</span>? NASA&apos;s exploration atmosphere is <span className="num">{exploration.pressure_psia} psia ({exploration.pressure_kpa} kPa) at {exploration.o2_pct}% O₂</span>.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
              NASA has decades of spacecraft fire research. But most tests used air-like oxygen levels and near-Earth pressure. A future habitat may use <span className="text-habitat">more oxygen and lower pressure</span>, changing how well those tests apply. Ember Atlas lets you compare a habitat with the conditions NASA tested, see the strength of the evidence, and find what is still unknown.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              This is a research screening tool. It helps explore evidence and gaps; it does not certify a habitat or predict fire safety.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <HomeMatcherLink />
              <Link href="/method" className="rounded-lg border border-line-strong px-4 py-2.5 text-sm hover:border-habitat/60">
                How we grade evidence
              </Link>
            </div>
          </div>
          <div className="mx-auto hidden sm:block">
            <SphericalFlame size={260} label={false} />
          </div>
        </div>
      </section>

      <EvidenceGapChart />

      <section aria-labelledby="journey-title">
        <div className="mb-3">
          <p className="eyebrow">A clear path through the evidence</p>
          <h2 id="journey-title" className="mt-1 text-xl font-semibold">Start with a habitat. Follow the evidence.</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <article className="panel p-4">
            <p className="num text-xs text-habitat">01 · Choose a target</p>
            <h3 className="mt-2 font-semibold">Set the habitat conditions</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">Choose an atmosphere with the habitat selector. The selected conditions set the question for the map, matcher, and ranked findings.</p>
          </article>
          <article className="panel p-4">
            <p className="num text-xs text-habitat">02 · Inspect what was tested</p>
            <h3 className="mt-2 font-semibold">Find the nearest evidence</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">The matcher compares oxygen, pressure, fuel, and gravity, then links you to the underlying NASA test cards and findings.</p>
          </article>
          <article className="panel p-4">
            <p className="num text-xs text-habitat">03 · Read the limits</p>
            <h3 className="mt-2 font-semibold">See what is known—and missing</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">Each result describes its evidence tier, caveats, and gaps. Follow the source IDs to check the original NASA material.</p>
          </article>
        </div>
      </section>

      <HabitatEvidenceSummary />

      <section className="panel p-5" aria-labelledby="tiers-title">
        <div className="max-w-3xl">
          <p className="eyebrow">Read the evidence grades</p>
          <h2 id="tiers-title" className="mt-1 text-xl font-semibold">What each label means</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">These labels describe how closely the available tests support a question. They are not safety ratings.</p>
        </div>
        <div className="mt-4"><EvidenceTierGuide /></div>
      </section>

      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">
          Headline numbers
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="panel p-5">
            <p className="eyebrow">Cards in the exploration range</p>
            <p className="num mt-2 text-4xl font-medium text-tier-measured">{headline.tierA.pct}%</p>
            <p className="mt-1 text-sm text-muted">
              {headline.tierA.count} of {burnCards.length} burn cards are tier A (near {exploration.pressure_psia} psia / {exploration.o2_pct}% O₂). Most are gas or liquid tests; {tierASolids} are solid-material tests (Saffire-V/VI).
            </p>
            <div className="mt-3">
              <SourceChips ids={["PSI-159", "PSI-69", "PSI-10", "S01", "S02"]} />
            </div>
            <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed"><strong>What this means:</strong> this dataset’s exploration-range band is a small share of all records; most evidence comes from other conditions. <Link href="/explorer" className="text-habitat underline">See the test-condition map</Link>.</p>
          </div>
          <div className="panel p-5">
            <p className="eyebrow">Highest O₂ for a solid in microgravity</p>
            <p className="num mt-2 text-4xl font-medium text-solid">{headline.highestSolidMicrogravity.o2Pct}%</p>
            <p className="mt-1 text-sm text-muted">
              {headline.highestSolidMicrogravity.acronym} {headline.highestSolidMicrogravity.fuelName} at {headline.highestSolidMicrogravity.pressureKpa} kPa (card{" "}
              <span className="num">{headline.highestSolidMicrogravity.cardId}</span>). That is {o2Difference} oxygen percentage points below the exploration target in the habitat data, and the table is flagged for re-verification against the PDF.
            </p>
            <div className="mt-3">
              <SourceChips ids={["S01"]} />
            </div>
            <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed"><strong>What this means:</strong> the highest located solid-fuel oxygen value in microgravity remains below the selected exploration target; it is not a test at the target. The record is flagged for verification. <Link href={`/library?card=${encodeURIComponent(headline.highestSolidMicrogravity.cardId)}`} className="text-habitat underline">Open this card</Link>.</p>
          </div>
          <div className="panel p-5">
            <p className="eyebrow">Partial-gravity burn cards</p>
            <p className="num mt-2 text-4xl font-medium text-tier-analog">{headline.partialGravity.nonMicrogravityCount}</p>
            <p className="mt-1 text-sm text-muted">
              All {headline.partialGravity.acronyms.join(", ")}: {headline.partialGravity.lunarCount} lunar-gravity cards and {earthControlCount} Earth-gravity controls, in normal-pressure air. No card is labelled Mars gravity, and {partialAtTargetO2 === 0 ? `none of the lunar-gravity cards is at the exploration target of ${exploration.o2_pct}% O₂` : `${partialAtTargetO2} lunar-gravity card${partialAtTargetO2 === 1 ? "" : "s"} report the exploration target of ${exploration.o2_pct}% O₂`}.
            </p>
            <div className="mt-3">
              <SourceChips ids={["S07", "S33"]} />
            </div>
            <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed"><strong>What this means:</strong> these non-microgravity tests cover only the listed conditions; they cannot stand in for untested lunar or Mars habitat atmospheres. <Link href="/explorer" className="text-habitat underline">Inspect gravity coverage</Link>.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_22rem]" aria-labelledby="insights-title">
        <div>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="eyebrow">Ranked for your habitat</p>
              <h2 id="insights-title" className="mt-1 text-xl font-semibold">
                Top insights
              </h2>
            </div>
            <Link href="/ranking" className="text-xs text-habitat hover:underline" title="Home shows at most 2 insights per area; the full ranking is on the method page">
              Ranking method and weights →
            </Link>
          </div>
          <HomeInsights byHabitat={byHabitat} />
        </div>
        <aside className="space-y-4">
          <HomeHabitatCard />
          <section className="panel p-4" aria-labelledby="designer-title">
            <h2 id="designer-title" className="font-semibold">
              What these findings may mean
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">Team interpretation of cited NASA findings. Open each source to review the reported evidence and its limits.</p>
            <ul className="mt-3 space-y-3 text-sm">
              {designerNotes.map((note) => (
                <li key={note.ids.join()} className="leading-relaxed">
                  {note.text}{" "}
                  <span className="num text-[11px] text-ember">{note.ids.join(", ")}</span>
                  <div className="mt-1">
                    <SourceChips ids={note.sources} label="" />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-muted">For research screening only. Not a certification source.</p>
          </section>
        </aside>
      </section>

      <section aria-labelledby="primary-tiles-title">
        <h2 id="primary-tiles-title" className="text-xl font-semibold">Continue with the evidence</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {primaryTiles.map((tile) => (
            <Link key={tile.href} href={tile.href} className="panel group p-4 transition-colors hover:border-ember/50">
              <p className="font-medium group-hover:text-ember">{tile.title} →</p>
              <p className="mt-1 text-sm text-muted">{tile.text}</p>
            </Link>
          ))}
        </div>
        <details className="mt-5 rounded-xl border border-line bg-panel/40 p-4">
          <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-habitat">More tools for learning and exploration</summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {secondaryTiles.map((tile) => (
              <Link key={tile.href} href={tile.href} className="panel group p-4 transition-colors hover:border-ember/50">
                <p className="font-medium group-hover:text-ember">{tile.title} →</p>
                <p className="mt-1 text-sm text-muted">{tile.text}</p>
              </Link>
            ))}
          </div>
        </details>
        <p className="num mt-4 text-xs text-faint">
          {burnCards.length} burn cards · {investigations.length} investigations ({inScope} in scope) · {findings.length} findings · {sources.length} sources · {discrepancies.length} known discrepancies
        </p>
      </section>
    </div>
  );
}
