import { NextResponse } from "next/server";
import { askAtlas, configuredProvider } from "@/lib/atlas/llm";

export const runtime = "nodejs";

export async function GET() {
  const config = configuredProvider();
  return NextResponse.json({ mode: config ? "llm" : "lite", provider: config ? `${config.provider}:${config.model}` : null });
}

export async function POST(request: Request) {
  let question = "";
  try {
    const body = await request.json();
    question = String(body?.question ?? "").trim().slice(0, 600);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!question) return NextResponse.json({ error: "Question is required" }, { status: 400 });
  const answer = await askAtlas(question);
  return NextResponse.json(answer);
}
