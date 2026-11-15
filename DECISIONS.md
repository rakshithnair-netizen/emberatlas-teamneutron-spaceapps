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
