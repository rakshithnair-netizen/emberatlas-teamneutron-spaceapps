import { describe, expect, it } from "vitest";
import { atlasLite } from "../atlas/lite";
import { parseQuestion } from "../atlas/tools";

const prompts = [
  "Would SIBAL burn at 34% O₂ and 8.2 psi?",
  "What does partial-gravity data say?",
  "Which investigations are closest to the exploration atmosphere?",
  "How well do ISS smoke detectors see Kapton smoke?",
];

describe("Atlas Lite", () => {
  it("parses SIBAL condition", () => {
    const parsed = parseQuestion(prompts[0]);
    expect(parsed.material).toBe("SIBAL");
    expect(parsed.condition?.o2Pct).toBe(34);
    expect(parsed.condition?.pressureKpa).toBeCloseTo(56.54, 1);
  });
  it("answers every suggested prompt with sources", () => {
    for (const prompt of prompts) {
      const answer = atlasLite(prompt);
      console.log(`\n### ${prompt}\n[${answer.tier}] ${answer.answer}\nSOURCES ${answer.sourceIds.join(",")}\nNOT KNOWN ${answer.notKnown}`);
      expect(answer.sourceIds.length).toBeGreaterThan(0);
      expect(answer.answer.length).toBeGreaterThan(40);
    }
  });
  it("finds Kapton detector finding", () => {
    expect(atlasLite(prompts[3]).answer).toContain("F012");
  });
  it("lists PSI-159 first for closest investigations", () => {
    expect(atlasLite(prompts[2]).answer).toMatch(/1\. PSI-159/);
  });
});
