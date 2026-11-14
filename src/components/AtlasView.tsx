"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AtlasAnswer } from "@/lib/atlas/lite";
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
    <div className="space-y-2.5 text-[15px] leading-relaxed">
      {text.split(/\n{2,}/).map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line">
          {paragraph.split(/(\[[^\]]+\])/g).map((part, partIndex) =>
            /^\[[^\]]+\]$/.test(part) ? (
              <span key={partIndex} className="num text-xs text-habitat">
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
    <div className="panel space-y-4 p-4 sm:p-5">
      {answer.notice ? <p className="rounded-md border border-tier-extrapolated/40 bg-tier-extrapolated/5 px-3 py-2 text-xs text-tier-extrapolated">{answer.notice}</p> : null}
      <AnswerText text={answer.answer} />
      <div className="flex flex-wrap items-center gap-2">
        <EvidenceBadge tier={answer.tier} />
        <span className="text-xs text-muted">{answer.tierReason}</span>
      </div>
      <SourceChips ids={answer.sourceIds} label="Cited sources" />
      {answer.notKnown ? (
        <p className="rounded-md border border-line bg-panel-2 px-3 py-2 text-sm">
          <span className="eyebrow mr-2 text-tier-analog">Not known from this data</span>
          {answer.notKnown}
        </p>
      ) : null}
      {answer.cards.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-xs">
            <thead>
              <tr className="text-left text-muted">
                <th className="py-1 font-normal">Card</th>
                <th className="py-1 font-normal">Fuel</th>
                <th className="py-1 text-right font-normal">O₂</th>
                <th className="py-1 text-right font-normal">Pressure</th>
                <th className="py-1 font-normal pl-3">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {answer.cards.slice(0, 5).map((card) => (
                <tr key={card.card_id}>
                  <td className="py-1.5">
                    <Link href={`/library?card=${card.card_id}`} className="num text-habitat hover:underline">
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
      <details className="text-xs text-muted">
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
                <span className="num text-ember">{item.id}</span> {item.title}
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
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="eyebrow">Ask Atlas</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Questions answered from the data, not from memory</h1>
        <p className="mt-1 text-sm text-muted">
          Atlas searches findings, investigations, card summaries, discrepancies and habitat atmospheres, grades the evidence and cites every source. It is a research screening tool, not certification advice.
        </p>
        {mode ? (
          <p className="num mt-2 text-[11px] text-faint">
            Mode: {mode.mode === "llm" ? `model-assisted (${mode.provider}), tools required` : "Atlas Lite: deterministic retrieval and templated answers (no API key set)"}
          </p>
        ) : null}
      </div>

      {!turns.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {suggestions.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => ask(suggestion)} className="panel p-3 text-left text-sm hover:border-ember/50">
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}

      <div className="space-y-6" aria-live="polite">
        {turns.map((turn, index) => (
          <div key={index} className="space-y-3">
            <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-ember/15 px-4 py-2 text-sm">{turn.question}</p>
            {turn.answer ? <AnswerCard answer={turn.answer} /> : null}
            {turn.error ? <p className="panel p-3 text-sm text-tier-extrapolated">Atlas could not answer: {turn.error}</p> : null}
            {!turn.answer && !turn.error ? <p className="text-sm text-muted">Searching the dataset…</p> : null}
          </div>
        ))}
        <div ref={bottom} />
      </div>

      <form
        className="sticky bottom-3 flex gap-2 rounded-xl border border-line-strong bg-panel/95 p-2 backdrop-blur"
        onSubmit={(event) => {
          event.preventDefault();
          ask(question);
        }}
      >
        <label htmlFor="atlas-input" className="sr-only">
          Ask a question
        </label>
        <input id="atlas-input" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="e.g. Would Nomex burn at 34% O₂ and 8.2 psi?" className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none" maxLength={600} />
        <button type="submit" disabled={busy || !question.trim()} className="rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-black disabled:opacity-40">
          Ask
        </button>
      </form>
    </div>
  );
}
