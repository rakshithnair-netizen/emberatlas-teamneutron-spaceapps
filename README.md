# Flame in Freefall

**Graded fire-safety evidence for Moon and Mars habitats.** A dashboard for the NASA Space Apps Challenge 2026 challenge *Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data*. It summarizes, ranks and explains decades of NASA microgravity combustion results against one question:

> How relevant is the existing research to a habitat with higher oxygen and lower pressure?

NASA's exploration atmosphere is 8.2 psia (56.5 kPa) at 34% O₂. Almost all flight data were taken near 1 atm and 21% O₂, in microgravity. This app shows, for any condition, **how much is actually known**, using five evidence tiers: Measured, Interpolated, Extrapolated, Analog and No data. Each answer also gives the distance to the habitat atmosphere, a trail of NASA sources and a plain "what we don't know" statement.

## What it does

| Section | Route | What it answers |
|---|---|---|
| Home (Mission Dashboard) | `/` | The challenge question, evidence-gap chart, "what NASA has tested / what is missing", evidence-grade guide, headline numbers, ranked insights, habitat picker |
| Envelope Map | `/explorer` | All 1,732 burn cards on O₂ × pressure, habitat crosshairs, coverage hulls, iso-ppO₂ lines, gravity overlay |
| Condition Matcher | `/matcher` | Evidence tier, 5 nearest cards with deltas, relevant findings, caveats, "what would close this gap"; shareable URL |
| Ask Atlas | `/atlas` | Retrieval-grounded Q&A with cited sources; works without an API key (Atlas Lite) |
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

## Setup

```bash
npm install
npm run prepare-data
npm run dev
npm test
npm run build
```

`prepare-data` copies the dataset from `~/Desktop/SpaceApps-Data/dataset` (override with `DATASET_DIR`) into `src/data/raw` and `public/data`. It then generates TypeScript types from `data_dictionary.csv` (`src/lib/generated-types.ts`) and precomputes coverage hulls and headline numbers (`src/data/derived.json`). Copies are committed, so builds work without the source folder. `npm run build` runs it automatically.

### Ask Atlas with a model (recommended for the demo)

Atlas is the app's SI layer. Locally, copy `.env.example` to `.env.local`. On Vercel, set the same three variables under Project → Settings → Environment Variables and redeploy:

```
AI_PROVIDER=anthropic   # or openai, gemini
AI_API_KEY=...
AI_MODEL=               # optional override
```

Keys stay server-side in the `/api/atlas` route handler. The model must call at least one tool (`searchFindings`, `queryCards`, `classifyEvidence`, `getInvestigation`, `getSources`). Citations not found in tool results are dropped. With no key, or if the call fails, Atlas Lite answers from the same retrieval with templated text.

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

Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Plotly.js (plotly.js-dist-min, dynamically imported), React Flow (@xyflow/react), MiniSearch, Vitest. Deployable to Vercel (everything is static except `/api/atlas`).

## AI-use disclosure

- The code and plain-language summaries were written with the help of an AI coding assistant (Anthropic Claude via Claude Code) and reviewed by the team.
- No data values were generated by AI; every number comes from the dataset.
- Ask Atlas can optionally call an LLM through retrieval tools only.
- No AI-generated imagery is used; all graphics are hand-built SVG.

Research screening tool, not a certification source.
