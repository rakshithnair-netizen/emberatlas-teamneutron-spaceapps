import fs from "node:fs";
import path from "node:path";
import { chromium, type Page } from "playwright";

const investigations: { investigation_id: string }[] = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../src/data/raw/investigations.json"), "utf8"));

const routes = [
  "/",
  "/explorer",
  "/matcher",
  "/matcher?o2=34&p=56.54&g=lunar&fuel=solid",
  "/atlas",
  "/library",
  "/family-tree",
  "/learn",
  "/earth",
  "/fire-watch",
  "/method",
  "/ranking",
  ...investigations.map((entry) => `/library/${entry.investigation_id}`),
];

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const extractScript = `(() => {
  const lines = [];
  const visible = (element) => element.checkVisibility ? element.checkVisibility({ checkOpacity: false, checkVisibilityCSS: true }) : true;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    const parent = current.parentElement;
    const text = (current.textContent || "").replace(/\\s+/g, " ").trim();
    if (text && parent && !parent.closest("script, style, noscript") && visible(parent)) lines.push(text);
    current = walker.nextNode();
  }
  for (const element of Array.from(document.querySelectorAll("[alt], [aria-label], [title], [placeholder]"))) {
    for (const name of ["alt", "aria-label", "title", "placeholder"]) {
      const value = element.getAttribute(name);
      if (value !== null) lines.push("@" + name + "=" + value.replace(/\\s+/g, " ").trim());
    }
  }
  lines.push("@document.title=" + document.title);
  return lines;
})()`;

async function extract(page: Page): Promise<string[]> {
  return page.evaluate(extractScript) as Promise<string[]>;
}

async function crawl(baseUrl: string): Promise<Map<string, string[]>> {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome" });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
  const results = new Map<string, string[]>();
  for (const route of routes) {
    const page = await context.newPage();
    await page.goto(new URL(route, baseUrl).toString(), { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    results.set(route, await extract(page));
    await page.close();
  }
  await browser.close();
  return results;
}

function diff(before: string[], after: string[]): string[] {
  const counts = new Map<string, number>();
  for (const line of before) counts.set(line, (counts.get(line) ?? 0) + 1);
  for (const line of after) counts.set(line, (counts.get(line) ?? 0) - 1);
  const changes: string[] = [];
  for (const [line, count] of counts) {
    if (count > 0) changes.push(`- ${line}${count > 1 ? ` (×${count})` : ""}`);
    if (count < 0) changes.push(`+ ${line}${count < -1 ? ` (×${-count})` : ""}`);
  }
  return changes;
}

async function main() {
  const before = argument("before");
  const after = argument("after");
  if (!before || !after) {
    console.error("Usage: tsx scripts/check-text-unchanged.ts --before http://localhost:3201 --after http://localhost:3202");
    process.exit(2);
  }
  const [beforeText, afterText] = [await crawl(before), await crawl(after)];
  let failures = 0;
  for (const route of routes) {
    const changes = diff(beforeText.get(route) ?? [], afterText.get(route) ?? []);
    if (changes.length) {
      failures++;
      console.log(`\n${route}: ${changes.length} difference(s)`);
      for (const change of changes.slice(0, 40)) console.log(`  ${change}`);
    }
  }
  const total = [...beforeText.values()].reduce((sum, lines) => sum + lines.length, 0);
  console.log(`\nChecked ${routes.length} routes, ${total} text items. ${failures ? `${failures} route(s) differ.` : "No differences."}`);
  process.exit(failures ? 1 : 0);
}

main();
