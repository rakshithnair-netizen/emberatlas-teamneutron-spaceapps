# Demo script

## 30-second path

| Time | Screen | Say / do |
|---|---|---|
| 0–5 s | **Home** (`/`) | "Will a fire test from near Earth conditions tell us what happens inside a Moon habitat? NASA's lunar habitats will run at 8.2 psi and 34% oxygen. Only 3.3% of tests are near it, and no solid has burned above 31% in flight." Point at the challenge question, then scroll to the evidence-gap chart: "every dot is a NASA burn; the star is the habitat." |
| 5–12 s | **Explore evidence** (`/explorer`) | "Every burn as a dot; the cyan crosshair is the habitat." Toggle **Gravity overlay**: "Four tests ever left microgravity, all LUCI, in normal air." |
| 12–20 s | **Check a habitat** (`/matcher?o2=34&p=56.54&g=lunar&fuel=solid`), or the home button **See what the evidence says** | "The verdict says what the evidence can and cannot tell us. Solids at the exploration atmosphere on the Moon: **Extrapolated**, 14 O₂ points beyond the only lunar test. Here's the experiment that would close the gap: FM2, whose oxygen conditions conflict between NASA sources." |
| 20–26 s | **Ask Atlas** (`/atlas`, under **More tools**) | Click "Would SIBAL burn at 34% O₂ and 8.2 psi?" "Answer, evidence tier, NASA sources, and what isn't known. The model can only answer through tools over the NASA dataset, and its citations are checked." |
| 26–30 s | **Fire Watch** (`/fire-watch`, under **More tools**) | Start shift and answer one event. "Every outcome is a real NASA finding. Graded evidence, not guesses." |

Backup: if the network is slow, the Matcher URL above loads directly and is shareable. If the deployment has no `AI_API_KEY`, Atlas falls back to Atlas Lite (templated answers from the same retrieval); say "retrieval-only mode" instead of naming a model.

## 7-slide outline

1. **The question.** 8.2 psia / 34% O₂ habitats vs data taken at 1 atm / 21% O₂ in microgravity. "How relevant is what we know?"
2. **The data.** 1,732 burn cards from the PSI repository and NASA publications, 30 investigations, 54 findings, 67 sources. Every row reconciled, blanks kept blank, 17 discrepancies logged.
3. **The idea: graded evidence.** Five evidence grades (Measured → No data), explained in plain language, kept separate from the dataset's A–F relevance bands; distance to the habitat, sources and a "what we don't know" line on every answer. A screening tool, not a safety certification.
4. **What the data say.**
   - 3.3% of cards are near the exploration atmosphere.
   - The solid-fuel ceiling is 31% O₂ (Saffire-VI).
   - 4 non-microgravity cards, all LUCI; LUCI spread rates are 0.38–0.6× of 1 g.
   - The ISS detector missed Kapton smoke in half of tests.
5. **The tools.** Check a habitat (Condition Matcher), Explore evidence (Envelope Map), evidence-gap chart and "what NASA has tested / what is missing" panel on Home, Ask Atlas (SI answers grounded in the dataset through tools; Atlas Lite fallback works offline), ranked insights with adjustable weights, Family Tree.
6. **Impact.**
   - Habitat designers get a test-gap list: solids at ≥ 34% O₂ and ~55 kPa, and anything in partial gravity.
   - On Earth, the same data feed better detectors, suppressants, engines and wildfire models.
   - Learn modules and the Fire Watch game reach students.
7. **Validity and next steps.**
   - Open data and method page, CSV/JSON downloads, tests, AI disclosure.
   - Next: ingest FM2 results when published, add NASA-STD-6001 ground data as a separate analog tier.
