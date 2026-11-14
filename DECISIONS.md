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
