# Flame in Freefall dataset (v1.0, 2026-11-14)

Unified dataset for the NASA Space Apps 2026 challenge "Flame in Freefall". Built only from NASA PSI repository records (psi.nasa.gov) and NASA publications. Nothing is invented: blanks mean the source did not state a value.

## Tables (CSV in this folder, typed JSON in `json/`)
| Table | Rows | Purpose |
|---|---|---|
| burn_cards | 1732 | One row per test/burn. Drives envelope map, condition matcher, flame library |
| test_campaigns | 122 | Daily summaries, planned matrices, instrument sessions |
| investigations | 30 | Investigation metadata, curated fire-safety roles, status |
| investigation_envelope | per investigation | O2/pressure coverage and the card closest to 8.2 psi / 34% O2 |
| habitat_atmospheres | 6 | ISS, Shuttle, exploration atmosphere, suit |
| family_tree_edges | 138 | Lineage (curated) plus shared hardware/fuel (derived) |
| findings | 54 | Paraphrased NASA findings, tagged by Earth-application domain |
| test_platforms, publications, sources | | Reference tables; every source_id resolves in sources.csv |
| known_discrepancies | 17 | Source conflicts and how each was handled |
| rejected_rows, qa_reconciliation | | Every raw row is either a card/campaign row or logged here |

`data_dictionary.csv` describes every column; `datapackage.json` is the Frictionless descriptor.

## Evidence tiers (habitat_relevance_tier)
Distance to the exploration atmosphere (8.2 psia, 34% O2, 56.5 kPa) decides the tier: A exploration-range, B elevated O2 at normal pressure, C reduced pressure at normal O2, D ambient reference, F beyond exploration O2, E not assessable (missing O2 or pressure). Partial-gravity evidence is identified by `gravity_regime` (only the 4 LUCI cards are non-microgravity: 2 lunar, 2 Earth control).

## Caveats
- BASS and BASS-II pressure/O2 are platform-nominal (`pressure_basis`, `o2_basis`). SPICE has no year.
- PSI has no partial-gravity combustion data; LUCI results come from NASA publications.
- Saffire-VI results table could not be re-read from the PDF; those rows carry `results_table_recheck_against_pdf`. Verify before submission.
- FM2 oxygen conditions conflict between NASA sources (21/34% vs 37%); see known_discrepancies.csv.
- Family-tree edges with basis `derived_*` are computed from shared hardware/fuel, not NASA statements.
