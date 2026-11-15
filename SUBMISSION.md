# Submission: Flame in Freefall

## Project title
Flame in Freefall: graded fire-safety evidence for Moon and Mars habitats

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

## AI tools used
- **Anthropic Claude (Claude Code)**: helped write the application code, tests, plain-language Learn text and these documents; the team reviewed the output. It did not generate or alter any data values.
- **Optional LLM in Ask Atlas** (Anthropic, OpenAI or Gemini, set by the deployer): answers questions only via retrieval tools over the dataset, with citations validated server-side. The default demo runs Atlas Lite, which uses no model.
- No AI-generated images are used. All graphics are hand-built SVG.
