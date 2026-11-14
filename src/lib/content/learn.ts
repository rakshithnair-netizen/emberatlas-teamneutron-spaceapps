export interface LearnFact {
  text: string;
  findingIds?: string[];
  sourceIds?: string[];
  cardIds?: string[];
}

export interface LearnModule {
  slug: string;
  title: string;
  summary: string;
  diagram: string;
  facts: LearnFact[];
}

export const learnModules: LearnModule[] = [
  {
    slug: "spherical-flames",
    title: "Why flames are round in microgravity",
    summary: "On Earth, hot combustion gases are lighter than the air around them and rise, pulling fresh air in from below. That buoyant plume stretches a candle flame into a teardrop. In orbit there is no buoyancy, so nothing pulls the hot gas upward and oxygen only arrives by slow diffusion.",
    diagram: "spherical",
    facts: [
      { text: "In space, fuels burn as oval balls. This simpler process is used to test the computer models later applied to wildfires and building fires.", findingIds: ["F001"], sourceIds: ["S16"] },
      { text: "Microgravity flames contain 5–8 times more soot than equivalent normal-gravity flames, which makes them demanding benchmarks for models.", findingIds: ["F005"], sourceIds: ["S17"] },
      { text: "Highly diluted weak flames are more stable in microgravity, extending dilution limits.", findingIds: ["F006"], sourceIds: ["S17"] },
    ],
  },
  {
    slug: "buoyancy-flow",
    title: "Buoyancy versus forced flow",
    summary: "With no buoyancy, a spacecraft fire is fed by the ventilation system. A gentle airflow can sustain a flame that would otherwise starve itself of oxygen, and a stronger flow can blow it out. This is why the first crew response is isolation: turn off local power and airflow.",
    diagram: "flow",
    facts: [
      { text: "First-response practice is isolation: turn off local power and airflow.", findingIds: ["F029"], sourceIds: ["S15"] },
      { text: "A local suppressant jet is not adequate: it entrains air and can sustain the flame, and nitrogen can strengthen a flame.", findingIds: ["F025"], sourceIds: ["S15", "S44"] },
      { text: "In KC-135 PMMA tests, the suppressant concentration needed rose with flow velocity up to about 10 cm/s.", findingIds: ["F026"], sourceIds: ["S25"] },
    ],
  },
  {
    slug: "spread-limits",
    title: "Flame spread and extinction limits",
    summary: "Every fuel has a limiting oxygen level below which a flame cannot survive. Fire-safety screening asks where that limit sits, and how flow, pressure and diluents move it. Microgravity changes the limits because heat and oxygen move differently without buoyancy.",
    diagram: "limits",
    facts: [
      { text: "FLEX burned heptane and methanol droplets to find the limiting oxygen index and how suppressants shift it.", findingIds: ["F021"], sourceIds: ["S18", "S15"] },
      { text: "FLEX relates the two as LOI = 0.209 × (1 − MEC).", findingIds: ["F022"], sourceIds: ["S24"] },
      { text: "NASA-STD-6001 Test 1 is run in 1 g. One source says it is not conservative for microgravity; another says lunar g could be worse than 1 g.", findingIds: ["F036"], sourceIds: ["S09", "S15"] },
    ],
  },
  {
    slug: "oxygen-pressure",
    title: "Oxygen, pressure and ppO₂",
    summary: "Partial pressure of oxygen (ppO₂ = O₂ fraction × total pressure) is what the crew breathes. Lowering cabin pressure to 8.2 psia shortens EVA prebreathe, so O₂ is raised to 34% to keep ppO₂ near sea level (about 19.2 versus 21.3 kPa). Flames respond to the O₂ fraction as well, so the cabin becomes more flammable even though breathing is similar.",
    diagram: "ppo2",
    facts: [
      { text: "Exploration atmosphere: 8.2 psia (56.54 kPa), 34% O₂, ppO₂ 19.2 kPa. Standard air: 14.7 psia, 21% O₂, ppO₂ 21.28 kPa.", sourceIds: ["S04", "S05", "S06"] },
      { text: "At 34% O₂ and 8.2 psia, materials that are non-flammable on Earth can become flammable, and flammable materials need lower ignition energy.", findingIds: ["F054"], sourceIds: ["S35"] },
      { text: "Melamine foam and Nomex were acceptable at 30% O₂ / 10.2 psia but flammable or unlikely to be acceptable at 34–40% O₂ / 8.2 psia.", findingIds: ["F049", "F050"], sourceIds: ["S03"] },
    ],
  },
  {
    slug: "cool-flames",
    title: "Cool flames (FLEX)",
    summary: "Some fuel droplets in microgravity keep reacting after the visible flame disappears. These cool flames run on low-temperature chemistry, are almost invisible, and release little light. To a crew member, a cool flame can look like a fire that is already out.",
    diagram: "cool",
    facts: [
      { text: "FLEX showed cool flames can burn for a prolonged period after visible flame extinction.", findingIds: ["F028"], sourceIds: ["S15"] },
      { text: "FLEX test envelope: O₂ mole fraction 0.10–0.50, suppressant (CO₂, He) 0–0.70, pressure 0.5–3.0 atm.", findingIds: ["F020"], sourceIds: ["S24", "S45"] },
      { text: "Cool-flame chemistry matters for internal combustion engines with higher efficiency and lower emissions.", findingIds: ["F008"], sourceIds: ["S15", "S18"] },
    ],
  },
  {
    slug: "smoke-detection",
    title: "Smoke and detection (SAME, DAFT)",
    summary: "Smoke detectors are tuned to the particles terrestrial fires make. SAME heated real spacecraft materials on the ISS and measured the smoke. Some of it was too small for the ISS detector to see reliably.",
    diagram: "smoke",
    facts: [
      { text: "The ISS detector failed to alarm for Kapton smoke in half of tests and for Teflon smoke in two-thirds.", findingIds: ["F012"], sourceIds: ["S06"] },
      { text: "All fuels produced substantial sub-micron particles (100–600 nm); Teflon and Kapton were smallest. The near-IR forward-scattering detector is most sensitive above 1 µm.", findingIds: ["F013", "F014"], sourceIds: ["S21", "S23", "S19"] },
      { text: "ECLSS filtration can outpace smoke accumulation in an early small fire, delaying detection.", findingIds: ["F019"], sourceIds: ["S06"] },
    ],
  },
  {
    slug: "large-scale-fire",
    title: "Large-scale fire (Saffire)",
    summary: "Small samples in a glovebox cannot show how a real fire grows. Saffire burned large samples inside uncrewed Cygnus cargo vehicles after they left the ISS. Saffire-IV to VI moved toward exploration conditions: higher oxygen and lower pressure.",
    diagram: "saffire",
    facts: [
      { text: "Saffire-VI burned SIBAL and PMMA at 28.8–31% O₂ and 54.1–55.2 kPa. These are the only flight solid burns near 8.2 psia; their table is flagged for re-verification against the PDF.", cardIds: ["SAFFIRE-VI-0001", "SAFFIRE-VI-0002", "SAFFIRE-VI-0003"], sourceIds: ["S01"] },
      { text: "In Saffire-VI the smoke alarm threshold came at 981 s, after most hazardous gas release; PMMA tests exceeded 1-hour CO₂ and 24-hour CO limits.", findingIds: ["F018"], sourceIds: ["S01"] },
      { text: "Saffire runs inside Cygnus after ISS departure, so no crew is at risk.", sourceIds: ["S26", "S30"] },
    ],
  },
  {
    slug: "partial-gravity",
    title: "Partial gravity (LUCI, FM2)",
    summary: "The Moon (0.165 g) and Mars (0.38 g) have weak buoyancy: enough to drive a plume, but slow. Weak buoyancy may let a flame get enough oxygen without being cooled or blown out, so lunar gravity may be the most flammable condition for some materials. Flight data are almost nonexistent.",
    diagram: "partial",
    facts: [
      { text: "LUCI (rotating New Shepard capsule, lunar g, air): PMMA rod flame tip spread 0.15 cm/s vs 0.40 cm/s at 1 g (ratio 0.38); SIBAL base spread ratio 0.6.", findingIds: ["F043", "F041"], sourceIds: ["S07"] },
      { text: "SIBAL burns downward in air in lunar gravity but extinguishes right after ignition in Earth gravity.", findingIds: ["F035"], sourceIds: ["S08"] },
      { text: "Partial-gravity fire cannot be interpolated from 0 g and 1 g. FM2 is planned to burn acrylic at 34% O₂ / 8.2 psia on the Moon; its O₂ condition conflicts between sources.", findingIds: ["F033", "F038", "F039"], sourceIds: ["S11", "S08", "S42"] },
    ],
  },
  {
    slug: "evidence-tiers",
    title: "How to read evidence tiers",
    summary: "Every answer here carries one of five grades. Measured: a burn card sits at or very near the condition (distance ≤ 0.35, same gravity, stated basis). Interpolated: inside the tested coverage. Extrapolated: outside it, with the distance and direction shown. Analog: only another gravity or fuel class. No data: nothing relevant.",
    diagram: "tiers",
    facts: [
      { text: "Distance to a condition: d = √(((O₂ − 34)/10)² + ((p − 56.5)/40)²), the same metric the dataset uses for its A–F habitat tiers." },
      { text: "Values marked ≈ with a dotted underline are platform-nominal or approximate. Many MSG tests report the platform's nominal 14.7 psi cabin air, not a measurement.", sourceIds: ["S06"] },
      { text: "Only 4 of 1,732 cards are not microgravity: LUCI's 2 lunar-g burns and 2 Earth controls.", cardIds: ["LUCI-0001", "LUCI-0002", "LUCI-0003", "LUCI-0004"], sourceIds: ["S07"] },
    ],
  },
];
