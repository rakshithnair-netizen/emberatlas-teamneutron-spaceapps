"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AtlasAnswer } from "@/lib/atlas/lite";
import { evidenceTierMeta } from "@/lib/evidence";
import { EvidenceBadge } from "./EvidenceBadge";
import { SourceChips } from "./SourceChips";

const suggestions = [
  "Would SIBAL burn at 34% O₂ and 8.2 psi?",
  "What does partial-gravity data say?",
  "Which investigations are closest to the exploration atmosphere?",
  "How well do ISS smoke detectors see Kapton smoke?",
  "Would PMMA burn at 34% O₂ and 8.2 psi on the Moon?",
  "Does CO₂ work as a suppressant in microgravity?",
];

interface Turn {
  question: string;
  answer: AtlasAnswer | null;
  error: string | null;
}

function AnswerText({ text }: { text: string }) {
  return (
    <div className="font-body space-y-3 text-base">
      {text.split(/\n{2,}/).map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line">
          {paragraph.split(/(\[[^\]]+\])/g).map((part, partIndex) =>
            /^\[[^\]]+\]$/.test(part) ? (
              <span key={partIndex} className="num text-xs text-clay-strong">
                {part}
              </span>
            ) : (
              <span key={partIndex}>{part}</span>
            ),
          )}
        </p>
      ))}
    </div>
  );
}

function AnswerCard({ answer }: { answer: AtlasAnswer }) {
  return (
    <div className="space-y-5 border-l border-sand-strong py-1 pl-5">
      {answer.notice ? <p className="rounded-lg border border-clay-strong bg-clay-soft px-3 py-2 text-xs text-clay-strong">{answer.notice}</p> : null}
      <AnswerText text={answer.answer} />
      <div className="flex flex-wrap items-center gap-2">
        <EvidenceBadge tier={answer.tier} />
        <span className="text-xs text-ink-muted">{evidenceTierMeta[answer.tier].description}</span>
        <span className="text-xs text-ink-muted">{answer.tierReason}</span>
      </div>
      <SourceChips ids={answer.sourceIds} label="Cited sources" />
      {answer.notKnown ? (
        <p className="rounded-lg bg-sand px-4 py-3 text-sm">
          <span className="eyebrow mr-2 text-tier-analog">Not known from this data</span>
          {answer.notKnown}
        </p>
      ) : null}
      {answer.cards.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-xs">
            <thead>
              <tr className="text-left">
                <th className="py-1 font-normal">Card</th>
                <th className="py-1 font-normal">Fuel</th>
                <th className="py-1 text-right font-normal">O₂</th>
                <th className="py-1 text-right font-normal">Pressure</th>
                <th className="py-1 font-normal pl-3">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-strong">
              {answer.cards.slice(0, 5).map((card) => (
                <tr key={card.card_id}>
                  <td className="py-1.5">
                    <Link href={`/library?card=${card.card_id}`} className="num text-clay-strong hover:underline">
                      {card.card_id}
                    </Link>
                  </td>
                  <td className="py-1.5">{card.fuel_name}</td>
                  <td className="num py-1.5 text-right">{card.o2_pct ?? "—"}%</td>
                  <td className="num py-1.5 text-right">{card.pressure_kpa ?? "—"} kPa</td>
                  <td className="py-1.5 pl-3">{card.outcome.replace(/_/g, " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <details className="text-xs text-ink-muted">
        <summary className="cursor-pointer">
          How this was answered: {answer.mode === "llm" ? `model ${answer.provider} with ${answer.toolCalls.length} tool call(s)` : "Atlas Lite (deterministic retrieval, no model)"}
        </summary>
        <ul className="mt-2 space-y-1">
          {answer.toolCalls.map((call, index) => (
            <li key={index} className="num break-all">
              {call.name}({JSON.stringify(call.args)})
            </li>
          ))}
        </ul>
        {answer.evidence.length ? (
          <ul className="mt-2 space-y-1">
            {answer.evidence.map((item) => (
              <li key={item.id}>
                <span className="num text-clay-strong">{item.id}</span> {item.title}
              </li>
            ))}
          </ul>
        ) : null}
      </details>
    </div>
  );
}

export function AtlasView() {
  const params = useSearchParams();
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<{ mode: string; provider: string | null } | null>(null);
  const asked = useRef(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/atlas")
      .then((response) => response.json())
      .then(setMode)
      .catch(() => setMode({ mode: "lite", provider: null }));
  }, []);

  const ask = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setBusy(true);
    setQuestion("");
    setTurns((previous) => [...previous, { question: trimmed, answer: null, error: null }]);
    try {
      const response = await fetch("/api/atlas", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: trimmed }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Request failed");
      setTurns((previous) => previous.map((turn, index) => (index === previous.length - 1 ? { ...turn, answer: data } : turn)));
    } catch (error) {
      setTurns((previous) => previous.map((turn, index) => (index === previous.length - 1 ? { ...turn, error: (error as Error).message } : turn)));
    } finally {
      setBusy(false);
      window.setTimeout(() => bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 50);
    }
  }, []);

  useEffect(() => {
    const initial = params.get("q");
    if (initial && !asked.current) {
      asked.current = true;
      ask(initial);
    }
  }, [params, ask]);

  return (
    <div className="mx-auto max-w-[760px] space-y-8">
      <div>
        <p className="eyebrow">Ask Atlas</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Questions answered from the data, not from memory</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Atlas searches findings, investigations, card summaries, discrepancies and habitat atmospheres, grades the evidence and cites every source. It is a research screening tool, not certification advice.
        </p>
        {mode ? (
          <p className="num mt-2 text-[11px] text-ink-subtle">
            Mode: {mode.mode === "llm" ? `model-assisted (${mode.provider}), tools required` : "Atlas Lite: deterministic retrieval and templated answers (no API key set)"}
          </p>
        ) : null}
      </div>

      {!turns.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {suggestions.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => ask(suggestion)} className="panel card-lift p-3 text-left text-sm hover:border-stone">
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}

      <div className="space-y-6" aria-live="polite">
        {turns.map((turn, index) => (
          <div key={index} className="space-y-3">
            <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-sand px-4 py-2 text-sm">{turn.question}</p>
            {turn.answer ? <AnswerCard answer={turn.answer} /> : null}
            {turn.error ? <p className="panel p-3 text-sm text-tier-extrapolated">Atlas could not answer: {turn.error}</p> : null}
            {!turn.answer && !turn.error ? <p className="text-sm text-ink-muted">Searching the dataset…</p> : null}
          </div>
        ))}
        <div ref={bottom} />
      </div>

      <form
        className="sticky bottom-3 flex items-center gap-2 rounded-full border border-sand-strong bg-paper-raised p-1.5 pl-5 shadow-card focus-within:border-clay focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-clay"
        onSubmit={(event) => {
          event.preventDefault();
          ask(question);
        }}
      >
        <label htmlFor="atlas-input" className="sr-only">
          Ask a question
        </label>
        <input id="atlas-input" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="e.g. Would Nomex burn at 34% O₂ and 8.2 psi?" className="min-w-0 flex-1 border-0 !bg-transparent text-sm outline-none" maxLength={600} />
        <button type="submit" disabled={busy || !question.trim()} className="btn btn-primary">
          Ask
        </button>
      </form>
    </div>
  );
}
