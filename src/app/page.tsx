import Link from "next/link";
import { EvidenceBadge, tierOrder } from "@/components/EvidenceBadge";
import { HomeHabitatCard } from "@/components/HomeHabitatCard";
import { HomeInsights } from "@/components/InsightList";
import { SourceChips } from "@/components/SourceChips";
import { SphericalFlame } from "@/components/SphericalFlame";
import { burnCards, derived, discrepancies, findings, investigations, sources } from "@/lib/data";
import { insightsByHabitat } from "@/lib/insights-server";

const tiles = [
  { href: "/explorer", title: "Envelope Map", text: "All 1,732 burn cards on one O₂–pressure map, with the habitat atmospheres and coverage hulls." },
  { href: "/matcher", title: "Condition Matcher", text: "Type a habitat condition and get an evidence grade, nearest cards and the gap." },
  { href: "/atlas", title: "Ask Atlas", text: "Questions answered only from the dataset, with sources and what is not known." },
  { href: "/library", title: "Flame Library", text: "Search and filter every card and investigation, with quality flags in plain English." },
  { href: "/family-tree", title: "Family Tree", text: "How 30 investigations connect: Saffire I→VI, LUCI→FM2, shared hardware and fuels." },
  { href: "/learn", title: "Learn", text: "Nine short modules on microgravity fire, each with a diagram, sources and a quiz." },
  { href: "/earth", title: "Earth Applications", text: "Space fire data behind better detectors, suppressants, engines and wildfire models." },
  { href: "/fire-watch", title: "Fire Watch", text: "A 3-minute habitat shift. Every outcome is a real NASA finding." },
  { href: "/method", title: "Data & Method", text: "Pipeline, reconciliation, rejected rows, tiers, caveats and downloads." },
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

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-line bg-panel/60 px-5 py-8 sm:px-10 sm:py-12">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow text-ember">NASA Space Apps 2026 · Flame in Freefall</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              How relevant is decades of space-fire research to a habitat with <span className="text-habitat">more oxygen</span> and{" "}
              <span className="text-habitat">less pressure</span>?
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
              NASA&apos;s exploration atmosphere is <span className="num text-ink">8.2 psia (56.5 kPa) at 34% O₂</span>. Almost all flight data were taken near 1 atm and 21% O₂, in microgravity, not lunar or Martian gravity. This dashboard grades every answer:
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {tierOrder.map((tier) => (
                <EvidenceBadge key={tier} tier={tier} size="sm" compact />
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/matcher?o2=34&p=56.54&g=microgravity&fuel=solid" className="rounded-lg bg-ember px-4 py-2.5 text-sm font-semibold text-black hover:bg-ember-soft">
                Check the exploration atmosphere
              </Link>
              <Link href="/explorer" className="rounded-lg border border-line-strong px-4 py-2.5 text-sm hover:border-habitat/60">
                Open the Envelope Map
              </Link>
              <Link href="/atlas" className="rounded-lg border border-line-strong px-4 py-2.5 text-sm hover:border-habitat/60">
                Ask Atlas
              </Link>
            </div>
          </div>
          <div className="mx-auto hidden sm:block">
            <SphericalFlame size={260} />
          </div>
        </div>
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
              {headline.tierA.count} of {burnCards.length} burn cards are tier A (near 8.2 psia / 34% O₂). Mostly gas jets (ACME CFI-G) and droplets (FLEX); only 6 are solids (Saffire-V/VI).
            </p>
            <div className="mt-3">
              <SourceChips ids={["PSI-159", "PSI-69", "PSI-10", "S01", "S02"]} />
            </div>
          </div>
          <div className="panel p-5">
            <p className="eyebrow">Highest O₂ for a solid in microgravity</p>
            <p className="num mt-2 text-4xl font-medium text-solid">{headline.highestSolidMicrogravity.o2Pct}%</p>
            <p className="mt-1 text-sm text-muted">
              {headline.highestSolidMicrogravity.acronym} {headline.highestSolidMicrogravity.fuelName} at {headline.highestSolidMicrogravity.pressureKpa} kPa (card{" "}
              <span className="num">{headline.highestSolidMicrogravity.cardId}</span>). That is 3 O₂ points short of 34%, and the table is flagged for re-verification against the PDF.
            </p>
            <div className="mt-3">
              <SourceChips ids={["S01"]} />
            </div>
          </div>
          <div className="panel p-5">
            <p className="eyebrow">Partial-gravity burn cards</p>
            <p className="num mt-2 text-4xl font-medium text-tier-analog">{headline.partialGravity.nonMicrogravityCount}</p>
            <p className="mt-1 text-sm text-muted">
              All {headline.partialGravity.acronyms.join(", ")}: {headline.partialGravity.lunarCount} at lunar g on a rotating capsule plus 2 Earth-gravity controls, in normal-pressure air. Nothing at Mars gravity, nothing at 34% O₂.
            </p>
            <div className="mt-3">
              <SourceChips ids={["S07", "S33"]} />
            </div>
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
              What this means for a habitat designer
            </h2>
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

      <section aria-labelledby="tiles-title">
        <h2 id="tiles-title" className="text-xl font-semibold">
          Explore
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((tile) => (
            <Link key={tile.href} href={tile.href} className="panel group p-4 transition-colors hover:border-ember/50">
              <p className="font-medium group-hover:text-ember">{tile.title} →</p>
              <p className="mt-1 text-sm text-muted">{tile.text}</p>
            </Link>
          ))}
        </div>
        <p className="num mt-4 text-xs text-faint">
          {burnCards.length} burn cards · {investigations.length} investigations ({inScope} in scope) · {findings.length} findings · {sources.length} sources · {discrepancies.length} known discrepancies
        </p>
      </section>
    </div>
  );
}
