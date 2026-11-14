"use client";

import { useState } from "react";
import type { BankQuestion } from "@/lib/content/question-bank";
import { SourceChips } from "./SourceChips";

export function Quiz({ questions }: { questions: BankQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const correct = questions.filter((question) => answers[question.id] === question.answer).length;
  const done = Object.keys(answers).length === questions.length;
  return (
    <div className="space-y-3">
      {questions.map((question, index) => {
        const chosen = answers[question.id];
        const answered = chosen !== undefined;
        return (
          <fieldset key={question.id} className="rounded-lg border border-line bg-panel-2/50 p-3">
            <legend className="px-1 text-sm font-medium">
              {index + 1}. {question.prompt}
            </legend>
            <div className="mt-2 grid gap-1.5">
              {question.options.map((option, optionIndex) => {
                const isCorrect = optionIndex === question.answer;
                const state = !answered ? "idle" : isCorrect ? "correct" : optionIndex === chosen ? "wrong" : "idle";
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={answered}
                    onClick={() => setAnswers((previous) => ({ ...previous, [question.id]: optionIndex }))}
                    className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-left text-sm ${
                      state === "correct" ? "border-tier-measured/60 bg-tier-measured/10" : state === "wrong" ? "border-tier-extrapolated/60 bg-tier-extrapolated/10" : "border-line hover:border-line-strong"
                    }`}
                  >
                    <span aria-hidden className="num w-4 text-xs text-muted">
                      {state === "correct" ? "✓" : state === "wrong" ? "✗" : String.fromCharCode(65 + optionIndex)}
                    </span>
                    {option}
                    {state === "correct" ? <span className="sr-only">(correct answer)</span> : state === "wrong" ? <span className="sr-only">(your answer, incorrect)</span> : null}
                  </button>
                );
              })}
            </div>
            {answered ? (
              <div className="mt-2 text-xs text-muted" aria-live="polite">
                <p>{question.explanation}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {question.findingIds.length ? <span className="num text-ember">{question.findingIds.join(", ")}</span> : null}
                  <SourceChips ids={question.sourceIds} label="" />
                </div>
              </div>
            ) : null}
          </fieldset>
        );
      })}
      {done ? (
        <p className="num text-sm" aria-live="polite">
          Score: {correct}/{questions.length}
          <button type="button" onClick={() => setAnswers({})} className="ml-3 text-xs text-habitat hover:underline">
            Retry
          </button>
        </p>
      ) : null}
    </div>
  );
}
