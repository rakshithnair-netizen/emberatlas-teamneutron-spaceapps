import type { Metadata } from "next";
import Link from "next/link";
import { SourceChips } from "@/components/SourceChips";
import { findings, investigationById } from "@/lib/data";

export const metadata: Metadata = { title: "Earth Applications" };

const domains: { key: string; title: string; why: string }[] = [
  { key: "fire_suppression", title: "Fire suppression", why: "Without buoyancy, a suppressant's effect on the flame is not masked by convection, so agent concentrations and limiting oxygen can be measured cleanly." },
  { key: "smoke_detection", title: "Smoke detection", why: "Smoke in microgravity ages and grows differently, exposing which particle sizes real detectors miss on Earth as well as in orbit." },
  { key: "wildfire_and_building_fire_models", title: "Wildfire and building fire models", why: "Simple, spherical microgravity flames are clean test cases for the computer models later used on complex terrestrial fires." },
  { key: "combustion_model_validation", title: "Combustion model validation", why: "Removing buoyancy removes one hard-to-model term, so model chemistry and transport can be checked on their own." },
  { key: "efficiency_and_emissions", title: "Efficiency and emissions", why: "Long-lived, stable flames let researchers study soot and pollutant formation step by step." },
  { key: "engines", title: "Engines", why: "Cool-flame chemistry seen in droplet burns is the same low-temperature chemistry that matters for engine knock and efficiency." },
  { key: "soot_and_air_quality", title: "Soot and air quality", why: "Microgravity flames make much more soot, giving extreme benchmarks for soot models." },
  { key: "burners_and_heating", title: "Burners and heating", why: "Weak, diluted flames that persist in microgravity point to stabilisation mechanisms for low-emission burners." },
  { key: "flame_stability", title: "Flame stability", why: "Extended dilution limits in microgravity show how close to extinction a flame can still be held." },
];

export default function EarthPage() {
  const withDomain = findings.filter((finding) => finding.earth_domain);
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Earth Applications</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">What space fire research does for Earth</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          {withDomain.length} findings in the dataset are tagged with an Earth-application domain. Each card links to its NASA source and the investigations behind it. The &ldquo;why&rdquo; line is our plain-language summary of the mechanism, not a NASA quote.
        </p>
      </div>
      {domains.map((domain) => {
        const items = withDomain.filter((finding) => finding.earth_domain === domain.key);
        if (!items.length) return null;
        return (
          <section key={domain.key} className="space-y-3" aria-labelledby={`domain-${domain.key}`}>
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h2 id={`domain-${domain.key}`} className="text-lg font-semibold">
                {domain.title}
              </h2>
              <span className="num text-xs text-faint">{items.length} finding(s)</span>
            </div>
            <p className="max-w-3xl text-sm text-ember-soft">Why space data helps: {domain.why}</p>
            <div className="grid gap-3 md:grid-cols-2">
              {items.map((finding) => (
                <article key={finding.finding_id} className="panel p-4">
                  <p className="flex items-center gap-2">
                    <span className="num text-xs text-ember">{finding.finding_id}</span>
                    <span className="eyebrow">{finding.subarea}</span>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed">{finding.statement}</p>
                  {finding.linked_investigations.length ? (
                    <p className="mt-2 flex flex-wrap gap-1.5 text-xs">
                      {finding.linked_investigations.map((id) => (
                        <Link key={id} href={`/library/${encodeURIComponent(id)}`} className="rounded border border-line px-1.5 py-0.5 hover:border-habitat/60">
                          {investigationById(id)?.acronym ?? id}
                        </Link>
                      ))}
                    </p>
                  ) : null}
                  <div className="mt-2">
                    <SourceChips ids={finding.source_ids} />
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
