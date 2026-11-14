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
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Learn</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Microgravity fire in nine short modules</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Each module is a two-minute read with one diagram. Every fact carries its finding ID and NASA source. Each module ends with a three-question check that uses the same question bank as Fire Watch.
        </p>
        <nav aria-label="Modules" className="mt-4 flex flex-wrap gap-2">
          {learnModules.map((module, index) => (
            <a key={module.slug} href={`#${module.slug}`} className="rounded-md border border-line px-2.5 py-1 text-xs text-muted hover:border-ember/50 hover:text-ink">
              <span className="num mr-1 text-faint">{index + 1}</span>
              {module.title}
            </a>
          ))}
        </nav>
      </div>
      {learnModules.map((module, index) => (
        <section key={module.slug} id={module.slug} className="panel scroll-mt-20 p-5 sm:p-6" aria-labelledby={`${module.slug}-title`}>
          <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
            <div>
              <p className="eyebrow">Module {index + 1}</p>
              <h2 id={`${module.slug}-title`} className="mt-1 text-xl font-semibold">
                {module.title}
              </h2>
              <p className="mt-3 leading-relaxed">{module.summary}</p>
              <ul className="mt-4 space-y-3">
                {module.facts.map((fact) => (
                  <li key={fact.text} className="border-l-2 border-ember/40 pl-3 text-sm leading-relaxed">
                    {fact.text}
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {fact.findingIds?.length ? <span className="num text-[11px] text-ember">{fact.findingIds.join(", ")}</span> : null}
                      {fact.cardIds?.length ? (
                        <span className="flex flex-wrap gap-1">
                          {fact.cardIds.map((id) => (
                            <Link key={id} href={`/library?card=${id}`} className="num rounded border border-line px-1.5 py-0.5 text-[11px] text-muted hover:text-ink">
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
              <p className="text-[11px] text-muted">Schematic drawn for this app, not to scale.</p>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="eyebrow mb-2">Check yourself</h3>
            <Quiz questions={questionsForModule(module.slug)} />
          </div>
        </section>
      ))}
      <p className="text-sm text-muted">
        Ready to apply it?{" "}
        <Link href="/fire-watch" className="text-ember hover:underline">
          Play Fire Watch →
        </Link>
      </p>
    </div>
  );
}
