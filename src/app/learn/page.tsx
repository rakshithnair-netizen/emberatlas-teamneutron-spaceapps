import type { Metadata } from "next";
import Link from "next/link";
import { LearnDiagram } from "@/components/LearnDiagram";
import { Quiz } from "@/components/Quiz";
import { SourceChips } from "@/components/SourceChips";
import { learnModules } from "@/lib/content/learn";
import { questionsForModule } from "@/lib/content/question-bank";

export const metadata: Metadata = { title: "Learn" };

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-[760px] space-y-14 sm:space-y-20">
      <div>
        <p className="eyebrow">Learn</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Microgravity fire in nine short modules</h1>
        <p className="mt-3 text-base text-ink-muted">
          Each module is a two-minute read with one diagram. Every fact carries its finding ID and NASA source. Each module ends with a three-question check that uses the same question bank as Fire Watch.
        </p>
        <nav aria-label="Modules" className="mt-6 flex flex-wrap gap-2">
          {learnModules.map((module, index) => (
            <a key={module.slug} href={`#${module.slug}`} className="chip hover:bg-sand-strong">
              <span className="num mr-1 text-ink-subtle">{index + 1}</span>
              {module.title}
            </a>
          ))}
        </nav>
      </div>
      {learnModules.map((module, index) => (
        <section key={module.slug} id={module.slug} className="scroll-mt-24 border-t border-sand-strong pt-10" aria-labelledby={`${module.slug}-title`}>
          <div className="space-y-8">
            <div>
              <p className="eyebrow">Module {index + 1}</p>
              <h2 id={`${module.slug}-title`} className="mt-2 text-3xl">
                {module.title}
              </h2>
              <p className="mt-4 text-base">{module.summary}</p>
              <ul className="mt-6 space-y-4">
                {module.facts.map((fact) => (
                  <li key={fact.text} className="font-body border-l-2 border-clay pl-4 text-base">
                    {fact.text}
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {fact.findingIds?.length ? <span className="num text-[11px] text-clay-strong">{fact.findingIds.join(", ")}</span> : null}
                      {fact.cardIds?.length ? (
                        <span className="flex flex-wrap gap-1">
                          {fact.cardIds.map((id) => (
                            <Link key={id} href={`/library?card=${id}`} className="num rounded-full border border-sand-strong px-2 py-0.5 text-[11px] text-ink-muted hover:border-clay-strong hover:text-clay-strong">
                              {id}
                            </Link>
                          ))}
                        </span>
                      ) : null}
                      {fact.sourceIds?.length ? <SourceChips ids={fact.sourceIds} label="" /> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <LearnDiagram kind={module.diagram} />
              <p className="text-[11px] text-ink-muted">Schematic drawn for this app, not to scale.</p>
            </div>
          </div>
          <div className="mt-8">
            <h3 className="eyebrow mb-3">Check yourself</h3>
            <Quiz questions={questionsForModule(module.slug)} />
          </div>
        </section>
      ))}
      <p className="text-sm text-ink-muted">
        Ready to apply it?{" "}
        <Link href="/fire-watch" className="text-clay-strong hover:underline">
          Play Fire Watch →
        </Link>
      </p>
    </div>
  );
}
