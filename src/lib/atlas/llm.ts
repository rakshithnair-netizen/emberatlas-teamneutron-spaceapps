import { sources } from "../data";
import { evidenceTierMeta } from "../evidence";
import type { EvidenceTier } from "../types";
import { atlasLite, certificationNotice, certificationPattern, type AtlasAnswer, type AtlasCardRef } from "./lite";
import { classifyCondition, getInvestigation, getSources, queryCards, searchFindings, type CardFilters } from "./tools";

interface ToolSpec {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export const toolSpecs: ToolSpec[] = [
  {
    name: "searchFindings",
    description: "Full-text search over NASA findings, investigation objectives, per-investigation card summaries, known discrepancies and habitat atmospheres. Returns ids, text and source_ids.",
    parameters: { type: "object", properties: { q: { type: "string", description: "Search query" } }, required: ["q"] },
  },
  {
    name: "queryCards",
    description: "Filter the 1,732 burn cards. Returns matching cards sorted by distance to the 8.2 psia / 34% O2 exploration atmosphere.",
    parameters: {
      type: "object",
      properties: {
        investigation_id: { type: "string" },
        acronym: { type: "string" },
        fuel_class: { type: "string", enum: ["gas", "liquid", "solid"] },
        fuel_name_contains: { type: "string" },
        gravity: { type: "string", enum: ["microgravity", "lunar", "earth"] },
        o2_min: { type: "number" },
        o2_max: { type: "number" },
        pressure_min_kpa: { type: "number" },
        pressure_max_kpa: { type: "number" },
        outcome: { type: "string" },
        limit: { type: "number" },
      },
    },
  },
  {
    name: "classifyEvidence",
    description: "Grade the evidence at a condition: returns tier (measured, interpolated, extrapolated, analog, no_data), nearest cards, gap statement and what experiment would close the gap. 1 psia = 6.894757 kPa.",
    parameters: {
      type: "object",
      properties: {
        o2Pct: { type: "number" },
        pressureKpa: { type: "number" },
        gravity: { type: "string", enum: ["microgravity", "lunar", "mars", "earth"] },
        fuelClass: { type: "string", enum: ["gas", "liquid", "solid", "any"] },
        fuelName: { type: "string", description: "Optional material substring such as PMMA or SIBAL" },
      },
      required: ["o2Pct", "pressureKpa", "gravity"],
    },
  },
  {
    name: "getInvestigation",
    description: "Investigation details by id (e.g. PSI-69) or acronym (e.g. FLEX): objective, envelope, findings, discrepancies, source ids.",
    parameters: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },
  {
    name: "getSources",
    description: "Resolve source ids to titles and URLs.",
    parameters: { type: "object", properties: { ids: { type: "array", items: { type: "string" } } }, required: ["ids"] },
  },
];

const systemPrompt = `You are Atlas, a research-screening assistant for NASA microgravity combustion data and Moon/Mars habitat fire safety.
Rules:
- Answer ONLY from tool results. Never use outside knowledge for facts or numbers. If the tools return nothing relevant, say so.
- Always call at least one tool. Use classifyEvidence whenever the question names an atmosphere, oxygen level, pressure or gravity.
- The exploration atmosphere is 8.2 psia (56.5 kPa) at 34% O2. Distance d = sqrt(((o2-34)/10)^2 + ((p-56.5)/40)^2).
- Cite source ids from tool results in square brackets, e.g. [S07] or [PSI-69]. Cite card ids and finding ids where used.
- Values with basis platform_nominal are not measured; say so if you use them.
- Keep the answer under 180 words: a direct answer first, then key evidence.
- Write plain text with Unicode symbols (O₂, ≈, ×). No LaTeX or $...$ math: the UI shows text as-is.
- End with one line starting exactly "Not known from this data:" naming the most important gap.
- Never give engineering certification or flight-approval advice; frame everything as research screening.`;

type ToolArgs = Record<string, unknown>;

interface ToolRun {
  name: string;
  args: ToolArgs;
  result: unknown;
}

function runTool(name: string, args: ToolArgs): unknown {
  switch (name) {
    case "searchFindings":
      return searchFindings(String(args.q ?? ""), 6);
    case "queryCards":
      return queryCards(args as CardFilters);
    case "classifyEvidence":
      return classifyCondition({
        o2Pct: Number(args.o2Pct),
        pressureKpa: Number(args.pressureKpa),
        gravity: (args.gravity as "microgravity") ?? "microgravity",
        fuelClass: (args.fuelClass as "any") ?? "any",
        fuelName: (args.fuelName as string) ?? null,
      });
    case "getInvestigation":
      return getInvestigation(String(args.id ?? ""));
    case "getSources":
      return getSources(Array.isArray(args.ids) ? (args.ids as string[]) : []);
    default:
      return { error: `Unknown tool ${name}` };
  }
}

function collectSourceIds(value: unknown, into: Set<string>) {
  if (Array.isArray(value)) value.forEach((entry) => collectSourceIds(entry, into));
  else if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      if ((key === "source_ids" || key === "sourceIds" || key === "evidence_source_ids") && Array.isArray(entry)) entry.forEach((id) => typeof id === "string" && into.add(id));
      else if (key === "source_id" && typeof entry === "string") into.add(entry);
      else collectSourceIds(entry, into);
    }
  }
}

const MAX_STEPS = 5;

// The whole model conversation must finish well inside Vercel's function limit (300 s on Hobby).
// Gemini sometimes accepts a request and never answers it (measured 2026-11-15: most calls took
// 3-6 s, about 1 in 6 hung). Without these limits a single stalled request hung /api/atlas until
// Vercel killed it with a 504, so the user never even got the Atlas Lite fallback. A stalled call
// is retried once (as is a 503 "overloaded" reply), since the retry usually comes back in a few seconds.
const TOTAL_BUDGET_MS = 50_000;
const PER_CALL_MS = 18_000;

async function fetchWithTimeout(url: string, init: RequestInit, deadline: number): Promise<Response> {
  for (let attempt = 1; ; attempt++) {
    const remaining = deadline - Date.now();
    if (remaining <= 1_000) throw new Error("model time budget used up");
    const started = Date.now();
    try {
      const response = await fetch(url, { ...init, signal: AbortSignal.timeout(Math.min(PER_CALL_MS, remaining)) });
      // Logged so slow providers show up in Vercel's function logs.
      console.log(`[atlas] ${new URL(url).hostname} ${response.status} in ${Date.now() - started} ms (attempt ${attempt})`);
      // 503 means the model is briefly overloaded; one retry usually succeeds.
      if (response.status === 503 && attempt < 2) continue;
      return response;
    } catch (error) {
      const timedOut = (error as Error).name === "TimeoutError";
      console.log(`[atlas] ${new URL(url).hostname} ${timedOut ? "timed out" : "failed"} after ${Date.now() - started} ms (attempt ${attempt})`);
      if (!timedOut || attempt >= 2) throw new Error(timedOut ? `model call timed out after ${Date.now() - started} ms` : (error as Error).message);
    }
  }
}

async function postJson(url: string, headers: Record<string, string>, body: unknown, deadline: number): Promise<Record<string, unknown>> {
  const response = await fetchWithTimeout(url, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) }, deadline);
  if (!response.ok) throw new Error(`${response.status} ${(await response.text()).slice(0, 300)}`);
  return response.json();
}

async function runAnthropic(question: string, apiKey: string, model: string, runs: ToolRun[], deadline: number): Promise<string> {
  const messages: Record<string, unknown>[] = [{ role: "user", content: question }];
  for (let step = 0; step < MAX_STEPS; step++) {
    const data = await postJson(
      "https://api.anthropic.com/v1/messages",
      { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      {
        model,
        max_tokens: 1024,
        system: systemPrompt,
        tools: toolSpecs.map((tool) => ({ name: tool.name, description: tool.description, input_schema: tool.parameters })),
        tool_choice: step === 0 ? { type: "any" } : { type: "auto" },
        messages,
      },
      deadline,
    );
    const content = data.content as { type: string; text?: string; id?: string; name?: string; input?: ToolArgs }[];
    const toolUses = content.filter((block) => block.type === "tool_use");
    if (!toolUses.length) return content.filter((block) => block.type === "text").map((block) => block.text).join("\n");
    messages.push({ role: "assistant", content });
    messages.push({
      role: "user",
      content: toolUses.map((block) => {
        const result = runTool(block.name!, block.input ?? {});
        runs.push({ name: block.name!, args: block.input ?? {}, result });
        return { type: "tool_result", tool_use_id: block.id, content: JSON.stringify(result).slice(0, 12000) };
      }),
    });
  }
  throw new Error("Tool loop did not finish");
}

async function runOpenAI(question: string, apiKey: string, model: string, runs: ToolRun[], deadline: number): Promise<string> {
  const messages: Record<string, unknown>[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: question },
  ];
  for (let step = 0; step < MAX_STEPS; step++) {
    const data = await postJson(
      "https://api.openai.com/v1/chat/completions",
      { authorization: `Bearer ${apiKey}` },
      {
        model,
        messages,
        tools: toolSpecs.map((tool) => ({ type: "function", function: { name: tool.name, description: tool.description, parameters: tool.parameters } })),
        tool_choice: step === 0 ? "required" : "auto",
      },
      deadline,
    );
    const message = (data.choices as { message: { content: string | null; tool_calls?: { id: string; function: { name: string; arguments: string } }[] } }[])[0].message;
    if (!message.tool_calls?.length) return message.content ?? "";
    messages.push(message as unknown as Record<string, unknown>);
    for (const call of message.tool_calls) {
      let args: ToolArgs = {};
      try {
        args = JSON.parse(call.function.arguments || "{}");
      } catch {}
      const result = runTool(call.function.name, args);
      runs.push({ name: call.function.name, args, result });
      messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result).slice(0, 12000) });
    }
  }
  throw new Error("Tool loop did not finish");
}

async function runGemini(question: string, apiKey: string, model: string, runs: ToolRun[], deadline: number): Promise<string> {
  const contents: Record<string, unknown>[] = [{ role: "user", parts: [{ text: question }] }];
  for (let step = 0; step < MAX_STEPS; step++) {
    const data = await postJson(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      { "x-goog-api-key": apiKey },
      {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        tools: [{ functionDeclarations: toolSpecs.map((tool) => ({ name: tool.name, description: tool.description, parameters: tool.parameters })) }],
        toolConfig: { functionCallingConfig: { mode: step === 0 ? "ANY" : "AUTO" } },
      },
      deadline,
    );
    const parts = ((data.candidates as { content: { parts: { text?: string; functionCall?: { name: string; args: ToolArgs } }[] } }[])?.[0]?.content?.parts ?? []);
    const calls = parts.filter((part) => part.functionCall);
    if (!calls.length) return parts.map((part) => part.text ?? "").join("\n");
    contents.push({ role: "model", parts });
    contents.push({
      role: "user",
      parts: calls.map((part) => {
        const result = runTool(part.functionCall!.name, part.functionCall!.args ?? {});
        runs.push({ name: part.functionCall!.name, args: part.functionCall!.args ?? {}, result });
        return { functionResponse: { name: part.functionCall!.name, response: { result } } };
      }),
    });
  }
  throw new Error("Tool loop did not finish");
}

const defaultModels: Record<string, string> = {
  anthropic: "claude-sonnet-5-5",
  openai: "gpt-4.1-mini",
  // gemini-2.5-* and the gemini-flash-latest alias stopped working for new keys (404 / hangs) in Nov 2026.
  gemini: "gemini-3.5-flash-lite",
};

export function configuredProvider(): { provider: string; apiKey: string; model: string } | null {
  const provider = (process.env.AI_PROVIDER ?? "").toLowerCase().trim();
  const apiKey = process.env.AI_API_KEY ?? "";
  if (!provider || !apiKey || !defaultModels[provider]) return null;
  return { provider, apiKey, model: process.env.AI_MODEL || defaultModels[provider] };
}

export async function askAtlas(question: string): Promise<AtlasAnswer> {
  const lite = atlasLite(question);
  const config = configuredProvider();
  if (!config) return lite;
  const runs: ToolRun[] = [];
  try {
    const runner = config.provider === "anthropic" ? runAnthropic : config.provider === "openai" ? runOpenAI : runGemini;
    const text = (await runner(question, config.apiKey, config.model, runs, Date.now() + TOTAL_BUDGET_MS)).trim();
    if (!runs.length || !text) throw new Error("Model answered without tools");
    const allowed = new Set<string>();
    runs.forEach((run) => collectSourceIds(run.result, allowed));
    const cited = [...text.matchAll(/\[([^\]]+)\]/g)].flatMap((match) => match[1].split(/[,;]\s*/)).map((id) => id.trim());
    const known = new Set(sources.map((source) => source.source_id));
    const sourceIds = [...new Set(cited.filter((id) => known.has(id) && allowed.has(id)))];
    const classify = runs.find((run) => run.name === "classifyEvidence")?.result as { tier: EvidenceTier; gapStatement: string; nearestCards: AtlasCardRef[] } | undefined;
    const notKnownMatch = text.match(/Not known from this data:\s*(.+)$/im);
    const answer = text.replace(/\n?Not known from this data:.*$/im, "").trim();
    const tier = classify?.tier ?? lite.tier;
    return {
      mode: "llm",
      provider: `${config.provider}:${config.model}`,
      answer,
      tier,
      tierReason: classify?.gapStatement ?? lite.tierReason,
      sourceIds: sourceIds.length ? sourceIds : [...allowed].filter((id) => known.has(id)).slice(0, 6),
      notKnown: notKnownMatch?.[1]?.trim() ?? lite.notKnown,
      cards: classify?.nearestCards ?? lite.cards,
      evidence: lite.evidence,
      toolCalls: runs.map((run) => ({ name: run.name, args: run.args })),
      notice: certificationPattern.test(question) ? certificationNotice : undefined,
    };
  } catch (error) {
    return { ...lite, notice: `${lite.notice ? `${lite.notice} ` : ""}The ${config.provider} model call failed (${(error as Error).message.slice(0, 120)}); this is the Atlas Lite answer from the same retrieval.` };
  }
}

export { evidenceTierMeta };
