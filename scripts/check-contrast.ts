import fs from "node:fs";
import path from "node:path";

const css = fs.readFileSync(path.resolve(__dirname, "../src/app/globals.css"), "utf8");

function readTokens(block: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  for (const match of block.matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)) tokens[match[1]] = match[2].toLowerCase();
  return tokens;
}

const themeBlock = css.slice(css.indexOf("@theme {"), css.indexOf("@media (prefers-color-scheme: dark)"));
const darkBlock = css.slice(css.indexOf("@media (prefers-color-scheme: dark)"), css.indexOf(":root {\n  color-scheme"));
const light = readTokens(themeBlock);
const dark = { ...light, ...readTokens(darkBlock) };

function luminance(hex: string): number {
  const channel = (offset: number) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

function ratio(a: string, b: string): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

const pairs: [string, string, string][] = [
  ["ink", "paper", "body text"],
  ["ink", "paper-raised", "card text"],
  ["ink", "sand", "chips, footer, filter rail"],
  ["ink-muted", "paper", "secondary text"],
  ["ink-muted", "paper-raised", "secondary text on cards"],
  ["ink-muted", "sand", "footer text, analog badge"],
  ["ink-subtle", "paper", "captions"],
  ["ink-subtle", "paper-raised", "captions on cards"],
  ["clay-strong", "paper", "links"],
  ["clay-strong", "paper-raised", "links on cards"],
  ["clay-strong", "clay-soft", "Extrapolated badge, selected chips"],
  ["clay-strong", "sand", "links on sand"],
  ["sky-strong", "sky-soft", "Interpolated badge"],
  ["sky-strong", "paper-raised", "liquid legend text"],
  ["sage-strong", "sage-soft", "Measured badge"],
  ["sage-strong", "paper-raised", "gas legend text, success"],
  ["ink-subtle", "paper", "No data badge (transparent)"],
  ["paper", "ink", "primary button"],
  ["on-clay", "clay", "accent button"],
  ["paper", "clay-strong", "accent button hover"],
  ["ink", "clay-soft", "selected row / correct-wrong quiz text"],
  ["ink", "sage-soft", "quiz correct"],
];

let failures = 0;
const lines = ["| Text | Background | Use | Light | Dark |", "|---|---|---|---|---|"];
for (const [fg, bg, use] of pairs) {
  const results = [light, dark].map((tokens) => {
    const value = ratio(tokens[fg], tokens[bg]);
    if (value < 4.5) failures++;
    return `${value.toFixed(2)}:1 ${value >= 4.5 ? "AA" : "FAIL"}`;
  });
  lines.push(`| \`--${fg}\` | \`--${bg}\` | ${use} | ${results[0]} | ${results[1]} |`);
}
console.log(lines.join("\n"));
console.log(failures ? `\n${failures} pair(s) below 4.5:1` : "\nAll pairs pass WCAG AA (4.5:1).");
process.exit(failures ? 1 : 0);
