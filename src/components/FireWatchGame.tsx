"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { learnModules } from "@/lib/content/learn";
import { questionBank } from "@/lib/content/question-bank";
import { habitatModules, scenarios, type ModuleId } from "@/lib/content/fire-watch";
import { SourceChips } from "./SourceChips";

const ROUND_SECONDS = 20;
const SCENARIO_COUNT = 7;
const QUIZ_COUNT = 3;

interface Round {
  kind: "scenario" | "quiz";
  id: string;
  module: ModuleId;
  alert: string;
  situation: string;
  options: { label: string; result: "correct" | "partial" | "wrong" }[];
  explanation: string;
  findingIds: string[];
  sourceIds: string[];
  learn: string;
}

interface RoundResult {
  round: Round;
  result: "correct" | "partial" | "wrong" | "timeout";
  points: number;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function buildShift(): Round[] {
  const modules: ModuleId[] = ["lab", "hab", "galley", "storage", "airlock"];
  const scenarioRounds: Round[] = shuffle(scenarios)
    .slice(0, SCENARIO_COUNT)
    .map((scenario) => ({ kind: "scenario", id: scenario.id, module: scenario.module, alert: scenario.alert, situation: scenario.situation, options: shuffle(scenario.actions), explanation: scenario.explanation, findingIds: scenario.findingIds, sourceIds: scenario.sourceIds, learn: scenario.learn }));
  const quizRounds: Round[] = shuffle(questionBank)
    .slice(0, QUIZ_COUNT)
    .map((question, index) => ({
      kind: "quiz",
      id: question.id,
      module: modules[index % modules.length],
      alert: "Crew briefing question",
      situation: question.prompt,
      options: question.options.map((label, optionIndex) => ({ label, result: optionIndex === question.answer ? "correct" : "wrong" })),
      explanation: question.explanation,
      findingIds: question.findingIds,
      sourceIds: question.sourceIds,
      learn: question.module,
    }));
  const rounds = [...scenarioRounds];
  quizRounds.forEach((round, index) => rounds.splice(2 + index * 3, 0, round));
  return rounds;
}

function HabitatMap({ active, alarmed }: { active: ModuleId | null; alarmed: boolean }) {
  return (
    <svg viewBox="0 0 450 200" className="h-auto w-full" role="img" aria-label={`Habitat map${active ? `, event in ${habitatModules.find((module) => module.id === active)?.name}` : ""}`}>
      <rect x="1" y="1" width="448" height="198" rx="14" fill="var(--color-paper-raised)" stroke="var(--color-sand-strong)" />
      <path d="M90 100 H100 M220 67 H230 M220 132 H230 M340 100 H350" stroke="var(--color-stone)" strokeWidth="6" />
      {habitatModules.map((module) => {
        const isActive = module.id === active;
        return (
          <g key={module.id}>
            <rect x={module.x} y={module.y} width={module.w} height={module.h} rx="10" fill={isActive ? "var(--color-clay-soft)" : "var(--color-sand)"} stroke={isActive ? "var(--color-clay)" : "var(--color-ink)"} strokeWidth={isActive ? 2 : 1} className={isActive && alarmed ? "flame-flicker" : undefined} />
            <text x={module.x + module.w / 2} y={module.y + module.h / 2 + 4} textAnchor="middle" fontSize="11" fill={isActive ? "var(--color-clay-strong)" : "var(--color-ink)"} fontFamily="var(--font-poppins)">
              {module.name}
            </text>
            {isActive ? (
              <g transform={`translate(${module.x + module.w - 16} ${module.y + 16})`}>
                <circle r="8" fill="var(--color-clay)" fillOpacity="0.35" className={alarmed ? "flame-breathe" : undefined} />
                <circle r="3.5" fill="var(--color-clay-strong)" />
              </g>
            ) : null}
          </g>
        );
      })}
      <text x="225" y="190" textAnchor="middle" fontSize="10" fill="var(--color-ink-muted)" fontFamily="var(--font-jetbrains)">
        cabin 34% O₂ · 8.2 psia (56.5 kPa)
      </text>
    </svg>
  );
}

export function FireWatchGame() {
  const [phase, setPhase] = useState<"intro" | "playing" | "feedback" | "done">("intro");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [remaining, setRemaining] = useState(ROUND_SECONDS);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const startedAt = useRef(0);
  const nextButton = useRef<HTMLButtonElement>(null);

  const round = rounds[index];
  const score = results.reduce((sum, entry) => sum + entry.points, 0);

  const start = () => {
    setRounds(buildShift());
    setIndex(0);
    setResults([]);
    setStreak(0);
    setBestStreak(0);
    setRemaining(ROUND_SECONDS);
    startedAt.current = Date.now();
    setPhase("playing");
  };

  const resolve = useCallback(
    (result: RoundResult["result"]) => {
      if (!round) return;
      const elapsed = (Date.now() - startedAt.current) / 1000;
      const speedBonus = result === "correct" ? Math.max(0, Math.round(50 * (1 - elapsed / ROUND_SECONDS))) : 0;
      const nextStreak = result === "correct" ? streak + 1 : 0;
      const points = result === "correct" ? 100 + speedBonus + Math.max(0, nextStreak - 1) * 10 : result === "partial" ? 40 : 0;
      setStreak(nextStreak);
      setBestStreak((best) => Math.max(best, nextStreak));
      setResults((previous) => [...previous, { round, result, points }]);
      setPhase("feedback");
    },
    [round, streak],
  );

  useEffect(() => {
    if (phase !== "playing") return;
    const timer = window.setInterval(() => {
      const left = Math.max(0, ROUND_SECONDS - (Date.now() - startedAt.current) / 1000);
      setRemaining(left);
      if (left <= 0) resolve("timeout");
    }, 200);
    return () => window.clearInterval(timer);
  }, [phase, resolve]);

  useEffect(() => {
    if (phase === "feedback") nextButton.current?.focus();
  }, [phase]);

  const next = () => {
    if (index + 1 >= rounds.length) {
      setPhase("done");
      return;
    }
    setIndex(index + 1);
    setRemaining(ROUND_SECONDS);
    startedAt.current = Date.now();
    setPhase("playing");
  };

  const last = results[results.length - 1];
  const missedModules = [...new Set(results.filter((entry) => entry.result !== "correct").map((entry) => entry.round.learn))];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Fire Watch</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">Your shift on the lunar habitat</h1>
        </div>
        {phase !== "intro" ? (
          <dl className="num flex gap-4 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-ink-muted">Score</dt>
              <dd className="text-clay-strong">{score}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-ink-muted">Streak</dt>
              <dd>{streak}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-ink-muted">Event</dt>
              <dd>
                {Math.min(index + 1, rounds.length)}/{rounds.length}
              </dd>
            </div>
          </dl>
        ) : null}
      </div>

      <div className="panel p-3">
        <HabitatMap active={phase === "playing" || phase === "feedback" ? round?.module ?? null : null} alarmed={phase === "playing"} />
      </div>

      {phase === "intro" ? (
        <section className="panel p-5">
          <p className="leading-relaxed">
            You are the crew member on fire watch in a habitat running the exploration atmosphere. Over one shift you face {SCENARIO_COUNT} events and {QUIZ_COUNT} briefing questions, with {ROUND_SECONDS} seconds each. Every outcome is explained by a real NASA finding.
          </p>
          <ul className="mt-3 list-inside list-disc text-sm text-ink-muted">
            <li>Correct: 100 points plus up to 50 for speed, plus a streak bonus.</li>
            <li>Partly right: 40 points. Wrong or out of time: 0.</li>
            <li>A short game for learning, not an operational procedure.</li>
          </ul>
          <button type="button" onClick={start} className="btn btn-accent mt-4">
            Start shift
          </button>
        </section>
      ) : null}

      {phase === "playing" && round ? (
        <section className="panel space-y-4 p-5" aria-live="assertive">
          <div className="h-1.5 overflow-hidden rounded bg-sand" role="progressbar" aria-label="Time remaining" aria-valuemin={0} aria-valuemax={ROUND_SECONDS} aria-valuenow={Math.round(remaining)}>
            <div className={`h-full ${remaining < 6 ? "bg-tier-extrapolated" : "bg-clay"}`} style={{ width: `${(remaining / ROUND_SECONDS) * 100}%` }} />
          </div>
          <div>
            <p className="eyebrow text-clay-strong">
              {round.kind === "quiz" ? "Briefing" : "Alert"} · {habitatModules.find((module) => module.id === round.module)?.name} · <span className="num">{Math.ceil(remaining)} s</span>
            </p>
            <h2 className="mt-1 text-lg font-semibold">{round.alert}</h2>
            <p className="mt-1 leading-relaxed text-ink-muted">{round.situation}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {round.options.map((option) => (
              <button key={option.label} type="button" onClick={() => resolve(option.result)} className="rounded-xl border border-ink bg-paper-raised px-4 py-3 text-left text-sm hover:bg-sand">
                {option.label}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {phase === "feedback" && last ? (
        <section className={`panel space-y-3 p-5 ${last.result === "correct" ? "border-sage-strong bg-sage-soft" : last.result === "partial" ? "border-sky-strong bg-sky-soft" : "border-clay-strong bg-clay-soft"}`} aria-live="assertive">
          <p className={`text-lg font-semibold ${last.result === "correct" ? "text-tier-measured" : last.result === "partial" ? "text-tier-interpolated" : "text-tier-extrapolated"}`}>
            {last.result === "correct" ? `Good call: +${last.points}` : last.result === "partial" ? `Partly right: +${last.points}` : last.result === "timeout" ? "Out of time" : "Not the best move"}
          </p>
          {last.result !== "correct" ? (
            <p className="text-sm">
              Best action: <span className="font-medium">{last.round.options.find((option) => option.result === "correct")?.label}</span>
            </p>
          ) : null}
          <p className="text-sm leading-relaxed text-ink-muted">{last.round.explanation}</p>
          <div className="flex flex-wrap items-center gap-2">
            {last.round.findingIds.length ? <span className="num text-xs text-clay-strong">{last.round.findingIds.join(", ")}</span> : null}
            <SourceChips ids={last.round.sourceIds} />
          </div>
          <button ref={nextButton} type="button" onClick={next} className="btn btn-primary">
            {index + 1 >= rounds.length ? "End shift" : "Next event"}
          </button>
        </section>
      ) : null}

      {phase === "done" ? (
        <section className="panel space-y-4 p-5">
          <h2 className="text-xl font-semibold">Shift complete</h2>
          <dl className="num grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-sand p-3">
              <dt className="text-[10px] uppercase tracking-wider text-ink-muted">Score</dt>
              <dd className="text-2xl text-clay-strong">{score}</dd>
            </div>
            <div className="rounded-lg bg-sand p-3">
              <dt className="text-[10px] uppercase tracking-wider text-ink-muted">Correct</dt>
              <dd className="text-2xl">
                {results.filter((entry) => entry.result === "correct").length}/{results.length}
              </dd>
            </div>
            <div className="rounded-lg bg-sand p-3">
              <dt className="text-[10px] uppercase tracking-wider text-ink-muted">Best streak</dt>
              <dd className="text-2xl">{bestStreak}</dd>
            </div>
          </dl>
          {missedModules.length ? (
            <div>
              <p className="text-sm">Brush up on:</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {missedModules.map((slug) => (
                  <li key={slug}>
                    <Link href={`/learn#${slug}`} className="rounded-md border border-sand-strong px-3 py-1.5 text-sm hover:border-clay/60">
                      {learnModules.find((module) => module.slug === slug)?.title ?? slug} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-tier-measured">A clean shift. Every call matched the NASA evidence.</p>
          )}
          <button type="button" onClick={start} className="btn btn-primary">
            Play again
          </button>
        </section>
      ) : null}
    </div>
  );
}
