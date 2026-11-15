# Decisions

Calls made during the build without stopping to ask, with the reason for each.

## Data
- **Basis mapping.** The dataset uses `stated`, `platform_nominal (…)`, `stated (approx)`, `flight value from S02…`, `stated as normal pressure…` and `not_stated`, not measured/nominal/derived/range. Mapping: `stated*` and `flight value*` → measured (solid). `platform_nominal*` → nominal (≈, dotted). `approx`/`assumed` → approximate (≈, dotted). Cards with `o2_pct_low` → range.
- **Gravity.** `gravity_regime` strings are normalized by prefix to microgravity, lunar or earth. Mars is a query option only; there are no Mars cards.
- **Headline "partial-gravity cards".** The UI says 4 non-microgravity cards (2 lunar + 2 Earth controls, all LUCI). Strictly, only 2 are partial gravity.
- **Highest solid O₂.** The data say 31% (SAFFIRE-VI-0001), not ~22%. ~22% is the ISS-era (pre-Saffire-VI) ceiling. The app shows 31% together with its re-verification flag.
- **Discrepancy attachment.** A discrepancy attaches to a card when the investigation matches and either the handling text names one of the card's flags, the record names the card's `test_id`, or the record is "all rows". Final-O₂ outliers need both flag and test ID.

## Evidence tiers
- **Measured** requires d ≤ 0.35, same gravity, same fuel class (if given), a stated or range O₂ basis, and a pressure basis that is not platform-nominal.
- **Interpolated** uses the convex hull in normalized space (p/40, O₂/10) for the same fuel class and gravity regime.
- **Analog** requires a related card within d ≤ 3; beyond that the answer is **No data**.
- The material filter in the Matcher restricts the pool to that `fuel_name`.

## Ranking
- Habitat gravity: lunar for exploration atmospheres and the suit (HAB-03 to HAB-06), microgravity for ISS and Shuttle references.
- `habitat_materials` findings have no linked cards, so their proximity uses the condition they state (34% O₂ / 8.2 psia, S03).
- Home shows at most 2 insights per area so one investigation family does not fill the list. `/ranking` shows the full list.
- Insight badges show the microgravity tier, with the lunar tier alongside for lunar habitats.

## Tech
- Plotly is used directly via `plotly.js-dist-min` with a small wrapper instead of `react-plotly.js`, which has peer-dependency conflicts with React 19. SVG `scatter` is used, not `scattergl`, so the map works where WebGL is unavailable.
- Burn cards (2.7 MB, about 96 kB gzipped) are fetched client-side from `/data/burn_cards.json` and cached. Server components import the smaller tables directly.
- Default Atlas models: `claude-sonnet-5-5`, `gpt-4.1-mini`, `gemini-2.5-flash`, all overridable with `AI_MODEL`. The first model turn forces tool use.
- The habitat picker persists in `localStorage` and re-scopes Home rankings and the Envelope Map. Matcher presets read the habitat list.
- Fire Watch draws 7 of 9 scenarios plus 3 questions from the shared Learn question bank.
- Earth Applications groups every finding with an `earth_domain` (29), not only `area = earth_application` (10), to match the domain list in the brief.
- The "why space data helps" lines on Earth Applications are labelled as our summary, not NASA quotes.

## Project rules
- **Code comments are now allowed (changed 2026-11-15).** The original brief said no comments. That rule is lifted: add comments where they explain *why* (assumptions, data caveats, non-obvious fixes), not to restate what the code does. Decisions still get logged here, and displayed values must still come from the dataset.

## v2 first-time experience (PR #1)
- **Habitat gravity mapping is shared.** `habitatQueryGravity()` in `HabitatProvider.tsx` is the single source for the Ranking rule above (HAB-01/02 microgravity, HAB-03 to HAB-06 lunar). Home links, the habitat card and the evidence summary all use it instead of hardcoding microgravity.
- **Two vocabularies, kept apart.** The A–F `habitat_relevance_tier` values from the dataset are labelled "dataset relevance bands". "Evidence grades" means only the five condition-specific tiers (Measured, Interpolated, Extrapolated, Analog, No data) from `lib/evidence.ts`.
- **Grade descriptions are plain language.** `evidenceTierMeta` was rewritten for first-time readers; the classification rules themselves are unchanged.
- **Primary vs secondary navigation.** Five core screening links are always visible; Atlas, Rankings, Learn, Fire Watch, Earth and Family Tree sit under "More tools".
- **Evidence gap chart is a proximity count, not a grade.** It counts cards within d ≤ 0.35 across all fuels and gravities and says so; only the Matcher assigns grades. It is a hand-drawn SVG, not Plotly, to keep the home page light.
- **Home stat copy is computed from data.** O₂ gap, Earth-control count, lunar cards at the target O₂ and tier-A solid count are derived at build time rather than written into the text.

## v2 review fixes (2026-11-15)
- **Matcher map summary describes the card, not the query.** For Analog results the nearest card is from another gravity or fuel group, so the summary names the card's own fuel and gravity and calls it an analog.
- **Touch targets in `@layer base`.** The 44px minimum height is in Tailwind's base layer so utilities can override it, and React Flow's fixed-size zoom buttons are excluded.
- **Card drawer focus trap ignores `tabindex="-1"`.** The full-screen backdrop button is not focusable, so it must not count as the trap's first element.
- **Header menus close on navigation.** The desktop "More tools" dropdown closes on route change, outside click and Escape. Mobile nav highlight and `aria-current` use the same active rule.
- **Air-baseline comparison uses HAB-01 values.** The home habitat card shows the dataset's air reference numbers, and changes its takeaway when HAB-01 itself is selected.
- **Challenge question restored on Home.** The v2 plain-language headline stays as the `<h1>`; the brief's central question sits verbatim right under it, with the HAB-03 atmosphere numbers read from the dataset, so judges can map the app to the challenge.
- **Atlas presented as the SI layer.** README, SUBMISSION and the demo script describe Ask Atlas as the LLM-powered part and tell the deployer to set `AI_PROVIDER` / `AI_API_KEY` on Vercel; Atlas Lite is described as the fallback, not the default.
- **Docs follow the v2 navigation.** DEMO_SCRIPT, SUBMISSION and README use the v2 screen names ("Check a habitat", "Explore evidence", "More tools") and describe the new Home panels.

## Submission form alignment (2026-11-15)
- **SI wording follows the 2026 guide.** The guide calls AI "Super Intelligence (SI)" and requires SI-assisted code and data to be acknowledged in descriptive text *and* metadata. Text: README, SUBMISSION and the Method page. Metadata: `siDisclosure` in `package.json` and an `si-disclosure` `<meta>` tag set in `layout.tsx`.
- **References section added.** SUBMISSION.md now has the form's "Space Agency Partner Data and Other References" field: no partner-agency data, plus every library (version and license from `package-lock.json`), font, hosting service and SI tool.

## Deployment (2026-11-15)
- **Hosted on Vercel** as project `flame-in-freefall` in the Team Proton team (Hobby plan), production URL https://ember-atlas-app.vercel.app (the original https://flame-in-freefall-hazel.vercel.app still works). The build uses the committed dataset copies because `~/Desktop/SpaceApps-Data` does not exist on Vercel.
- **Deployed from a clean clone of `main`**, so local-only files such as `.env.local` never reach the build.
- **Atlas uses Gemini on Vercel** (`AI_PROVIDER=gemini`, `AI_MODEL=gemini-3.5-flash-lite`). The key is a Production secret; without it Atlas falls back to Lite mode. `gemini-2.5-*` is closed to new keys (404) and `gemini-flash-latest` hung, so the faster Lite model was picked; it also has its own free-tier quota (the free tier allows 20 requests per model per day for `gemini-3.5-flash`, about 7–10 Atlas questions).
- **Atlas model calls are time-limited** (18 s per call, one retry, 50 s total) because about 1 in 6 Gemini calls stalled with no reply, and one stall used to hang the function until Vercel's 300 s limit.

## Rename to Ember Atlas (2026-11-15)
- **The app is called Ember Atlas.** "Flame in Freefall" is the name of the Space Apps challenge, so the app had been sharing the challenge's name. Space Apps lets teams choose their own project title; the only naming limit is not using "NASA" in a way that suggests NASA endorsement, which "Ember Atlas" does not.
- **The challenge keeps its name.** Text that refers to the challenge (README intro, the Home eyebrow, the SUBMISSION "Challenge" line) still says Flame in Freefall.
- **The dataset keeps its name.** "Flame in Freefall dataset v1.0" is named after the challenge, and its README and `datapackage.json` are copied from the source dataset by `prepare-data`, so they are left as they are.
- **New URL.** `ember-atlas.vercel.app` and `emberatlas.vercel.app` are taken by other sites, so the project serves https://ember-atlas-app.vercel.app. The Vercel project id is still `flame-in-freefall`; renaming it would not change any URL.

## Editorial restyle (2026-11-15)
- **Visual-only.** The dark theme was replaced by a light, warm editorial palette with a system-preference dark mode. No visible text changed, which `scripts/check-text-unchanged.ts` verifies against `main`. Full details are in `DESIGN_NOTES.md`.
- **Accessibility won over the brief's exact hex values.** Three text tones were darkened until every text/background pair passes WCAG AA.
- **On-screen colour words win over the brief.** Text such as "cyan line", "green ring" and "Solid orange edges" stays true, so those marks keep matching colours.
