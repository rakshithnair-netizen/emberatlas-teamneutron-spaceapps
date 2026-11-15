# Submission: Flame in Freefall

## Project title
Flame in Freefall: graded fire-safety evidence for Moon and Mars habitats

## Links
- **Live app:** https://flame-in-freefall-hazel.vercel.app
- **Source code:** https://github.com/rakshithnair-netizen/emberatlas-teamproton-spaceapps

## High-level summary (≤150 words)
NASA's exploration atmosphere is 8.2 psia at 34% O₂, but almost all space-fire data were taken at 1 atm and 21% O₂ in microgravity. Flame in Freefall asks one question: how relevant is that research to a Moon or Mars habitat? It turns 1,732 NASA burn records, 30 investigations and 54 findings into graded evidence. Every answer carries a tier (Measured, Interpolated, Extrapolated, Analog or No data), its distance from the habitat atmosphere, NASA sources and a plain "what we don't know" statement. An envelope map, condition matcher, ranked insights and a source-citing AI assistant show that only 3.3% of tests are near the exploration atmosphere. No flight solid has burned above 31% O₂, and just four tests (all LUCI) left microgravity. Learn modules, Earth applications and a short game make the evidence usable by designers, students and the public.

## Detailed description

### What it does
- **Home (Mission Dashboard)**: a plain-language headline plus the challenge question, an evidence-gap chart placing every NASA burn against the selected habitat, a "what NASA has tested / what is missing" panel with the solid-fuel evidence grade, a plain-language guide to the five evidence grades, three headline numbers computed from the data, insights ranked for a selected habitat (ISS, Shuttle, exploration 34%, 2006 design, design max 40%, EVA suit), and a "what these findings may mean" panel for habitat designers.
- **Navigation for first-time users**: five core steps (Home, Check a habitat, Explore evidence, Sources & library, Method & limits), with the other tools under "More tools". Keyboard and screen-reader friendly, with 44px touch targets.
- **Envelope Map**: every card plotted by pressure and O₂, coloured by fuel, shaped by gravity, solid or open by data basis. Shows habitat crosshairs, iso-ppO₂ guides, coverage hulls, distance rings, a gravity overlay and coverage bars per investigation.
- **Condition Matcher**: any O₂ / pressure (kPa or psia) / gravity / fuel / material / flow returns an evidence tier, the 5 nearest cards with per-axis deltas, relevant findings, data caveats and the experiment that would close the gap. Links are shareable.
- **Ask Atlas (the SI layer)**: retrieval-grounded Q&A powered by an LLM (Anthropic, OpenAI or Gemini). It never answers from model memory: tool calls over the dataset are mandatory and citations are checked against tool results. If no key is configured or a call fails, Atlas Lite answers from the same retrieval with templated text.
- **Flame Library and investigation pages**: search and filters, card drawers with every reported field, quality flags in plain English and known discrepancies.
- **Family Tree**: curated NASA lineage (Saffire I→VI, LUCI→FM2) kept separate from computed shared-hardware/fuel links.
- **Learn** (9 modules), **Earth Applications**, **Fire Watch** game, and **Data & Method** (pipeline, reconciliation, rejected rows, discrepancies, downloads, AI disclosure).

### Benefits
- Habitat designers see at a glance which conditions have real flight data and which rest on extrapolation, and what test would fill the gap.
- Reviewers can trace every number to a NASA source ID and see caveats instead of hidden assumptions.
- Students and the public learn why fire behaves differently in space, through a quiz-backed course and a game.

### How it addresses the challenge
- **Summarize**: per-investigation envelopes, Learn modules and Atlas summaries.
- **Rank**: a transparent five-factor ranking with weight sliders and CSV export.
- **Explain**: plain-language evidence grades, gap statements, "Not known from this data" lines and source chips everywhere. Results are labelled as research screening, not safety certification.
- **Moon/Mars relevance**: every view is scoped to a habitat atmosphere and gravity, and partial-gravity scarcity is shown explicitly.

### Tools
Next.js 15, TypeScript, Tailwind CSS 4, Plotly.js, React Flow, MiniSearch, Vitest, Vercel. Optional LLM providers for Atlas: Anthropic, OpenAI or Gemini.

## Use of Super Intelligence (SI)
Yes. SI tools were used as follows.

- **The idea (not SI).** The idea and approach for solving the challenge came only from the team's own brainstorming. SI was used afterwards as a tool to build it.
- **Code (SI-assisted).** Anthropic Claude, through the Claude Code coding assistant, helped write the application code, tests and build scripts. The team reviewed and tested every change (typecheck, lint, 30 unit tests, production build). This is acknowledged in descriptive text (README, this page and the in-app **Data & Method** page) and in metadata: an `siDisclosure` field in `package.json` and an `si-disclosure` meta tag on every page of the site.
- **Text (SI-assisted).** The plain-language Learn module text, the Fire Watch scenario wording, the "why space data helps" summaries on Earth Applications and these submission documents were drafted with Claude and edited by the team. The Earth Applications summaries are labelled in the app as our summary, not NASA quotes.
- **Data (SI-assisted compilation, no SI-generated values).** SI helped compile the dataset: extracting tables from NASA PSI records and publications, and paraphrasing the 54 NASA findings. The team checked every value against its NASA source. SI did not invent, estimate or alter any data value. Every number shown in the app traces to a NASA source ID, and missing values are shown as "—", never filled in. This is acknowledged in the metadata too: the `si-disclosure` tag and the `package.json` field.
- **SI inside the product: Ask Atlas.** Atlas can call an LLM (Anthropic Claude, OpenAI or Google Gemini, chosen by the deployer). It is only allowed to answer through retrieval tools over the NASA dataset. It must call at least one tool, and any citation not found in the tool results is dropped server-side. Every Atlas answer shows which mode produced it (model name, or "Atlas Lite" when no model is configured or a call fails).
- **Images, video and audio.** No SI-generated images, video or audio are used in the app. All graphics are hand-built SVG, so no watermarks are needed.
- **NASA branding.** No SI-generated content uses, contains or modifies NASA logos, flags, mission identifiers or other NASA design elements.

## NASA data used
Dataset built only from the NASA Physical Sciences Informatics (PSI) repository and NASA publications.

| ID | Title | URL |
|---|---|---|
| S01 | Saffire IV-VI heat release and CO/CO2 (ICES-2024-365) | https://ntrs.nasa.gov/citations/20240002981 |
| S02 | Fire Safety Implications of Preliminary Results from Saffire IV-V (ICES-2021-266) | https://ntrs.nasa.gov/citations/20210011521 |
| S03 | Low-pressure ECLSS / exploration atmosphere hardware flammability (ICES-2022-45) | https://ntrs.nasa.gov/citations/20220006612 |
| S04 | Modeling a 15-min EVA prebreathe protocol, 8.2 psi / 34% O2 atmosphere | https://www.nasa.gov/wp-content/uploads/2023/03/abercromby-8.2-34-atm-2015.pdf |
| S05 | Evidence Report: Risk of Hypoxia from the Exploration Atmosphere | https://ntrs.nasa.gov/citations/20150021491 |
| S06 | Research Questions and Challenges for Improved Spacecraft Fire Detection | https://ntrs.nasa.gov/citations/20210022143 |
| S07 | Lunar Combustion Investigation (LUCI): Flammability Results from a Rotating Sounding Rocket | https://ntrs.nasa.gov/citations/20250010653 |
| S08 | Flammability of Materials on the Moon (FM2) abstract | https://ntrs.nasa.gov/citations/20240015307 |
| S09 | Material Flammability at Lunar and Martian Gravity (LPSC 2026) | https://ntrs.nasa.gov/citations/20260000646 |
| S10 | Decadal Survey white paper: flammability in partial gravity (Miller) | https://science.nasa.gov/wp-content/uploads/2023/05/217_5dda37a2b088281953e769f275061ac8_MillerFletcherJ.pdf |
| S11 | Challenges and Research Needs for Micro- and Partial-Gravity Fires (Liao) | https://science.nasa.gov/wp-content/uploads/2023/05/60_afb22b1e538432728848e83bb3ade8c2_LiaoYaTingT.pdf |
| S12 | Solid Fuel Combustion in Partial and Micro-Gravity (Gollner) | https://science.nasa.gov/wp-content/uploads/2023/05/217_9ba7198f4af1488d0b4795cf594a906f_GollnerMichaelJ.pdf |
| S13 | Fire on the Moon overview charts | https://ntrs.nasa.gov/citations/20210020516 |
| S14 | Upward Flame Spread Over Thin Solids in Partial Gravity (AIAA 2001-0466) | https://ntrs.nasa.gov/citations/20010059376 |
| S15 | A Researcher's Guide to Combustion in Reduced Gravity (ISS) | https://www.nasa.gov/wp-content/uploads/2016/05/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf |
| S16 | BASS-II (NASA Glenn) | https://www1.grc.nasa.gov/space/iss-research/msg/bass-2/ |
| S17 | Advanced Combustion via Microgravity Experiments (ACME) fact sheet | https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf |
| S18 | PSI-69 FLEX investigation page | https://psi.nasa.gov/physci/repo/data/investigations/PSI-69 |
| S19 | Smoke Aerosol Measurement Experiment (SAME) fact sheet | https://www.nasa.gov/wp-content/uploads/2025/07/smoke-aerosol-measurement-experiment-same.pdf |
| S20 | SAME smoke particle size results (AIAA) | https://ntrs.nasa.gov/citations/20120012884 |
| S21 | Evaluation of Low-Gravity Smoke Particulate for Spacecraft Fire Detection | https://ntrs.nasa.gov/citations/20140006579 |
| S22 | Spacecraft Fire Detection: Smoke Properties and Transport | https://ntrs.nasa.gov/citations/20080012612 |
| S23 | An Overview of Smoke Detection and Spacecraft Fire Safety in Low Gravity | https://ntrs.nasa.gov/citations/20205008167 |
| S24 | FLEX Research Requirements Document (EIRD v4) | https://www1.grc.nasa.gov/wp-content/uploads/FLEX_EIRD_v4.pdf |
| S25 | Evaluation of CO2, N2 and He as Fire Suppression Agents in Microgravity | https://ntrs.nasa.gov/citations/20040161262 |
| S26 | Spacecraft Fire Safety Demonstration (Saffire) fact sheet | https://www.nasa.gov/wp-content/uploads/2025/07/spacecraft-fire-safety-demonstration-saffire.pdf |
| S27 | Flame Burns Out on NASA's Long-Running Spacecraft Fire Experiment | https://www.nasa.gov/centers-and-facilities/glenn/flame-burns-out-on-nasas-long-running-spacecraft-fire-experiment/ |
| S28 | Saffire Ignites New Discoveries in Space | https://www.nasa.gov/humans-in-space/saffire-ignites-new-discoveries-in-space/ |
| S29 | ECLSS overview incl. Saffire IV/V observations (ICES-2021-384) | https://ntrs.nasa.gov/citations/20210010866 |
| S30 | Operation and Development Status of Saffire (2017) | https://ntrs.nasa.gov/citations/20170000230 |
| S31 | Saffire status: IV, V, VI objectives | https://ntrs.nasa.gov/citations/20170002628 |
| S32 | Why NASA is studying flames in space | https://science.nasa.gov/biological-physical/resources/explainers-infographics/why-nasa-is-studying-flames-in-space/ |
| S33 | Moon Material Flammability (Houston We Have a Podcast ep. 386) | https://www.nasa.gov/podcasts/houston-we-have-a-podcast/moon-material-flammability/ |
| S34 | Development of Spacecraft Fire Safety Technology (2021) | https://ntrs.nasa.gov/citations/20210021318 |
| S35 | Recommendations for Fire Extinguisher Research (Easton) | https://ntrs.nasa.gov/citations/20210023340 |
| S37 | Combustion Science (NASA Glenn) | https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/ |
| S38 | Space Station's Quest for the Secrets of Fire | https://www.nasa.gov/humans-in-space/space-stations-quest-for-the-secrets-of-fire/ |
| S42 | BPS fluids/combustion status briefing, Apr 2024 (FM2 note) | https://science.nasa.gov/wp-content/uploads/2024/09/1-9-fluids-combustion-materials-carpenter-2024.pdf |
| S43 | NASA Materials Flammability Update (Urban, FLARE workshop 2021) | https://ntrs.nasa.gov/citations/20210021181 |
| S46 | Aeronautics and Space Report of the President, FY2025 | https://www.nasa.gov/wp-content/uploads/2026/06/fy-2025-presidents-report-tagged.pdf |
| S44 | BASS fact sheet | https://www.nasa.gov/wp-content/uploads/2025/07/burning-and-suppression-of-solids-bass.pdf |
| S45 | FLEX fact sheet | https://www.nasa.gov/wp-content/uploads/2025/07/flame-extinguishment-experiment-flex.pdf |
| PSI-100 | PSI-100 SAFFIRE-III | https://psi.nasa.gov/physci/repo/data/investigations/PSI-100 |
| PSI-102 | PSI-102 SAME | https://psi.nasa.gov/physci/repo/data/investigations/PSI-102 |
| PSI-106 | PSI-106 SLICE | https://psi.nasa.gov/physci/repo/data/investigations/PSI-106 |
| PSI-107 | PSI-107 SPICE | https://psi.nasa.gov/physci/repo/data/investigations/PSI-107 |
| PSI-108 | PSI-108 STDCE-1 | https://psi.nasa.gov/physci/repo/data/investigations/PSI-108 |
| PSI-10 | PSI-10 ACME/Flame Design | https://psi.nasa.gov/physci/repo/data/investigations/PSI-10 |
| PSI-115 | PSI-115 SAME-data modelling | https://psi.nasa.gov/physci/repo/data/investigations/PSI-115 |
| PSI-117 | PSI-117 Cool-flame CFD | https://psi.nasa.gov/physci/repo/data/investigations/PSI-117 |
| PSI-142 | PSI-142 Cool-flame counterflow | https://psi.nasa.gov/physci/repo/data/investigations/PSI-142 |
| PSI-159 | PSI-159 ACME CFI-G | https://psi.nasa.gov/physci/repo/data/investigations/PSI-159 |
| PSI-181 | PSI-181 Solder microgravity | https://psi.nasa.gov/physci/repo/data/investigations/PSI-181 |
| PSI-20 | PSI-20 ACME BRE | https://psi.nasa.gov/physci/repo/data/investigations/PSI-20 |
| PSI-21 | PSI-21 ACME CLD Flame | https://psi.nasa.gov/physci/repo/data/investigations/PSI-21 |
| PSI-22 | PSI-22 ACME E-FIELD Flames | https://psi.nasa.gov/physci/repo/data/investigations/PSI-22 |
| PSI-23 | PSI-23 ACME s-Flame | https://psi.nasa.gov/physci/repo/data/investigations/PSI-23 |
| PSI-25 | PSI-25 BASS-II | https://psi.nasa.gov/physci/repo/data/investigations/PSI-25 |
| PSI-26 | PSI-26 BASS | https://psi.nasa.gov/physci/repo/data/investigations/PSI-26 |
| PSI-39 | PSI-39 CFI | https://psi.nasa.gov/physci/repo/data/investigations/PSI-39 |
| PSI-47 | PSI-47 DAFT / DAFT-2 | https://psi.nasa.gov/physci/repo/data/investigations/PSI-47 |
| PSI-60 | PSI-60 SPICE data analysis | https://psi.nasa.gov/physci/repo/data/investigations/PSI-60 |
| PSI-62 | PSI-62 BASS flamelet modelling | https://psi.nasa.gov/physci/repo/data/investigations/PSI-62 |
| PSI-68 | PSI-68 FLEX-2 | https://psi.nasa.gov/physci/repo/data/investigations/PSI-68 |
| PSI-69 | PSI-69 FLEX | https://psi.nasa.gov/physci/repo/data/investigations/PSI-69 |
| PSI-98 | PSI-98 SAFFIRE-I | https://psi.nasa.gov/physci/repo/data/investigations/PSI-98 |
| PSI-99 | PSI-99 SAFFIRE-II | https://psi.nasa.gov/physci/repo/data/investigations/PSI-99 |

## Space Agency Partner Data and Other References

### Space Agency Partner data
None. All data comes from the NASA sources listed above.

### Dataset
- **Flame in Freefall dataset v1.0 (2026-11-14)**, compiled by the team only from the NASA PSI repository and the NASA publications listed above. It ships with the app as CSV and JSON under `/data`, with a data dictionary and a Frictionless `datapackage.json`.

### Software and libraries (all open source)
| Name | Version | License | Use | URL |
|---|---|---|---|---|
| Next.js | 15.5.29 | MIT | Web framework (App Router), static pages and the `/api/atlas` route | https://nextjs.org |
| React / React DOM | 19.1.0 | MIT | UI | https://react.dev |
| TypeScript | 5.9.3 | Apache-2.0 | Language | https://www.typescriptlang.org |
| Tailwind CSS (+ @tailwindcss/postcss) | 4.3.5 | MIT | Styling | https://tailwindcss.com |
| Plotly.js (plotly.js-dist-min) | 4.3.0 | MIT | Envelope Map and charts | https://plotly.com/javascript/ |
| React Flow (@xyflow/react) | 12.12.1 | MIT | Family Tree graph | https://reactflow.dev |
| MiniSearch | 7.2.0 | MIT | Full-text search for the Library and Atlas retrieval | https://github.com/lucaong/minisearch |
| Vitest | 5.1.0 | MIT | Unit tests | https://vitest.dev |
| tsx | 4.23.15 | MIT | Runs the data-preparation script | https://github.com/privatenumber/tsx |
| ESLint + eslint-config-next | 9.39.5 / 15.5.29 | MIT | Linting | https://eslint.org |
| create-next-app template | 15.5 | MIT | Starting project skeleton and default favicon | https://nextjs.org/docs/app/api-reference/cli/create-next-app |

### Fonts
- **IBM Plex Sans and IBM Plex Mono** (SIL Open Font License 1.1), loaded through Google Fonts via `next/font`. https://github.com/IBM/plex

### Images
- No third-party images. All diagrams, the flame illustration and the site icon in the header are hand-built SVG made by the team.

### SI tools and services
- **Anthropic Claude (Claude Code)**: coding and writing assistant (see "Use of Super Intelligence" above). https://www.anthropic.com/claude-code
- **Optional Ask Atlas model providers**: Anthropic Claude API (https://docs.anthropic.com), OpenAI API (https://platform.openai.com/docs) and Google Gemini API (https://ai.google.dev). Only one is used, set by the deployer.

### Hosting and tools
- **Vercel**: hosting. https://vercel.com (live at https://flame-in-freefall-hazel.vercel.app)
- **GitHub**: source code. https://github.com/rakshithnair-netizen/emberatlas-teamproton-spaceapps

### Methods
- The distance formula `d = sqrt(((o2 − 34)/10)² + ((p_kPa − 56.5)/40)²)` and the A–F relevance bands come from the dataset. The convex hull, point-in-polygon test, evidence grades and ranking formula were written by the team (`src/lib/geometry.ts`, `src/lib/evidence.ts`, `src/lib/ranking.ts`).
