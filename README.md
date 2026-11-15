# Ember Atlas

**Graded fire-safety evidence for Moon and Mars habitats.** A dashboard built for the NASA Space Apps Challenge 2026 challenge *Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data*. It summarizes, ranks and explains decades of NASA microgravity combustion results against one question:

> How relevant is the existing research to a habitat with higher oxygen and lower pressure?

**Live app:** https://ember-atlas-app.vercel.app

NASA's exploration atmosphere is 8.2 psia (56.5 kPa) at 34% O₂. Almost all flight data were taken near 1 atm and 21% O₂, in microgravity. This app shows, for any condition, **how much is actually known**, using five evidence tiers: Measured, Interpolated, Extrapolated, Analog and No data. Each answer also gives the distance to the habitat atmosphere, a trail of NASA sources and a plain "what we don't know" statement.

## What it does

| Section | Route | What it answers |
|---|---|---|
| Home (Mission Dashboard) | `/` | The challenge question, evidence-gap chart, "what NASA has tested / what is missing", evidence-grade guide, headline numbers, ranked insights, habitat picker |
| Envelope Map | `/explorer` | All 1,732 burn cards on O₂ × pressure, habitat crosshairs, coverage hulls, iso-ppO₂ lines, gravity overlay |
| Condition Matcher | `/matcher` | Evidence tier, 5 nearest cards with deltas, relevant findings, caveats, "what would close this gap"; shareable URL |
| Ask Atlas | `/atlas` | Retrieval-grounded Q&A with cited sources, powered by Google Gemini; falls back to Atlas Lite if the model is unavailable |
| Flame Library | `/library`, `/library/[id]` | Search and filter cards; investigation pages with envelope, findings, campaigns, publications, mini family tree |
| Family Tree | `/family-tree` | 30 investigations, 138 edges; curated lineage vs computed shared hardware/fuel |
| Learn | `/learn` | Nine short modules, each with a diagram, sourced facts and a 3-question check |
| Earth Applications | `/earth` | Findings grouped by Earth domain (suppression, detection, engines…) |
| Fire Watch | `/fire-watch` | A 3-minute habitat-shift game; every outcome is a NASA finding |
| Data & Method | `/method` | Pipeline, reconciliation, rejected rows, tiers, discrepancies, flags, downloads, AI disclosure |
| Ranking method | `/ranking` | Transparent scoring with weight sliders and CSV export |

## Key results surfaced by the app

- 58 of 1,732 cards (3.3%) are in the exploration-atmosphere range (tier A). Only 6 of them are solids (Saffire-V/VI).
- The highest O₂ for a solid in microgravity is 31% (SAFFIRE-VI-0001, SIBAL, 54.1 kPa), 3 points short of 34%. Its table is flagged for re-verification against the PDF.
- Only 4 cards are not microgravity: all LUCI (2 at lunar g, 2 Earth controls), in normal-pressure air. Nothing exists at Mars gravity or at 34% O₂ in partial gravity.
- The closest card to 8.2 psia / 34% is PSI-159-0128 (ACME CFI-G ethane, d = 0.146).

## Using the app

Open **https://ember-atlas-app.vercel.app** in any modern browser, on desktop or phone. There is nothing to install and no account to create.

1. **Pick a target habitat** with the selector in the header. It sets the atmosphere that every page compares against, and the app remembers it.
2. **Check a habitat** (`/matcher`): enter an oxygen level, pressure, gravity and fuel to get an evidence grade, the nearest NASA tests and what is still unknown. The URL updates as you go, and **Copy shareable link** gives you a link to that exact result.
3. **Explore evidence** (`/explorer`): see every NASA burn on one map and click any point for its full record.
4. **Ask Atlas** (under **More tools**): ask a question in plain English and get an answer drawn only from the NASA dataset, with cited sources.
5. **Sources & library** and **Method & limits**: trace any number back to its NASA source, and download the dataset as CSV or JSON.

Ask Atlas runs on Google Gemini through a server-side route, so no key or setup is needed to use it. If the model is busy or unavailable, Atlas falls back to **Atlas Lite**, which answers from the same retrieval with templated text, and the answer says which mode produced it.

## Method in brief

- **Distance**: `d = sqrt(((o2 − 34)/10)² + ((p_kPa − 56.5)/40)²)`, identical to the dataset.
- **Evidence tier** (`src/lib/evidence.ts`, `classifyEvidence`):
  - **Measured**: same-regime card within d ≤ 0.35 with a stated (not platform-nominal) basis.
  - **Interpolated**: inside the convex hull of same fuel class and gravity regime.
  - **Extrapolated**: outside it, with direction and distance.
  - **Analog**: only another regime or fuel class within d ≤ 3.
  - **No data**: nothing relevant.
- **Ranking** (`src/lib/ranking.ts`, `rankInsights`): a weighted mean of habitat proximity, evidence strength, safety consequence, gravity match and recency, all shown on hover and adjustable.
- **Data rules**: no value is displayed that the dataset lacks ("—" = not reported). Nominal or approximate values carry "≈" and a dotted underline. Quality flags are translated to plain English. Known discrepancies appear on affected cards and investigations.

## Data provenance

Built only from the NASA PSI repository (psi.nasa.gov) and NASA publications (NTRS, nasa.gov, science.nasa.gov). See `/method` in the app and `SUBMISSION.md` for the full source list. Uses NASA data; no NASA logos or insignia are used.

## Tools

Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Plotly.js (plotly.js-dist-min, dynamically imported), React Flow (@xyflow/react), MiniSearch, Vitest. Hosted on Vercel: every page is pre-rendered, and the only server code is the `/api/atlas` route, which calls Google Gemini. Every push to `main` redeploys the site.

## Use of Super Intelligence (SI)

- **SI-assisted code and text.** The code, tests and plain-language summaries were written with the help of an SI coding assistant (Anthropic Claude via Claude Code) and reviewed by the team. This is also recorded as metadata: the `siDisclosure` field in `package.json` and the `si-disclosure` meta tag on every page.
- The dataset was compiled from NASA sources with SI assistance (table extraction, paraphrased findings) and checked by the team against each source. No data values were invented by SI; every number comes from the dataset.
- The idea and approach came only from the team's own brainstorming.
- Ask Atlas calls an LLM (Google Gemini on the live site) through retrieval tools only.
- No AI-generated imagery is used; all graphics are hand-built SVG.

Research screening tool, not a certification source.
