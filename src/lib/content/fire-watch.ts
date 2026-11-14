export type ModuleId = "lab" | "hab" | "galley" | "storage" | "airlock";

export interface WatchAction {
  label: string;
  result: "correct" | "partial" | "wrong";
}

export interface WatchScenario {
  id: string;
  module: ModuleId;
  alert: string;
  situation: string;
  actions: WatchAction[];
  explanation: string;
  findingIds: string[];
  sourceIds: string[];
  learn: string;
}

export const habitatModules: { id: ModuleId; name: string; x: number; y: number; w: number; h: number }[] = [
  { id: "airlock", name: "Airlock", x: 20, y: 70, w: 70, h: 60 },
  { id: "hab", name: "Crew quarters", x: 100, y: 40, w: 120, h: 120 },
  { id: "lab", name: "Lab", x: 230, y: 40, w: 110, h: 55 },
  { id: "galley", name: "Galley", x: 230, y: 105, w: 110, h: 55 },
  { id: "storage", name: "Storage", x: 350, y: 70, w: 80, h: 60 },
];

export const scenarios: WatchScenario[] = [
  {
    id: "W-KAPTON",
    module: "lab",
    alert: "Burnt-plastic smell near a wiring harness",
    situation: "Kapton-insulated wiring in the Lab is overheating. The light-scattering smoke detector is silent.",
    actions: [
      { label: "Detector is quiet, so no smoke. Log it and move on", result: "wrong" },
      { label: "Check with a different sensor (ionization detector or particle counter)", result: "correct" },
      { label: "Turn ventilation up to clear the air", result: "wrong" },
      { label: "Evacuate the whole habitat", result: "partial" },
    ],
    explanation: "The ISS detector missed Kapton smoke in half of SAME tests. The particles are under 300 nm, below the near-IR detector's sweet spot, and the ionization detector responded slightly better. More airflow feeds the fire and filtration can hide early smoke.",
    findingIds: ["F012", "F014", "F019"],
    sourceIds: ["S06", "S23", "S19"],
    learn: "smoke-detection",
  },
  {
    id: "W-NOMEX",
    module: "storage",
    alert: "Flame on a stowage bag",
    situation: "A Nomex-blend bag in Storage ignites from a faulty light. Cabin: 34% O₂ at 8.2 psia.",
    actions: [
      { label: "Isolate: cut local power and airflow, then suppress", result: "correct" },
      { label: "Aim a narrow suppressant jet straight at the flame", result: "wrong" },
      { label: "Ignore it. Nomex is flame-resistant on Earth", result: "wrong" },
    ],
    explanation: "First response is isolation: turn off power and airflow. A local jet can entrain air and sustain the flame. Nomex is acceptable to 30% O₂ / 10.2 psia but unlikely to be acceptable at 34–40% O₂ / 8.2 psia.",
    findingIds: ["F029", "F025", "F050"],
    sourceIds: ["S15", "S44", "S03"],
    learn: "oxygen-pressure",
  },
  {
    id: "W-COOL",
    module: "lab",
    alert: "Droplet experiment: flame out",
    situation: "A heptane droplet test's visible flame has disappeared. The experimenter wants to open the chamber.",
    actions: [
      { label: "Flame is out. Open the chamber now", result: "wrong" },
      { label: "Keep it sealed and watch temperature and gas readings first", result: "correct" },
      { label: "Pump cabin air into the chamber to cool it", result: "wrong" },
    ],
    explanation: "FLEX showed cool flames can keep burning for a long time after the visible flame goes out. They are nearly invisible, so a dark chamber is not proof the reaction has stopped.",
    findingIds: ["F028", "F021"],
    sourceIds: ["S15", "S18"],
    learn: "cool-flames",
  },
  {
    id: "W-LUNAR",
    module: "hab",
    alert: "Lunar surface: fabric burning downward",
    situation: "On the lunar surface (0.165 g), a SIBAL-like fabric panel is burning downward. On Earth this burn would self-extinguish.",
    actions: [
      { label: "It will die out like it does in 1 g. Monitor only", result: "wrong" },
      { label: "Expect slower spread (about 0.4–0.6× of 1 g) that keeps going, and act now", result: "correct" },
      { label: "Expect much faster spread than on Earth", result: "partial" },
    ],
    explanation: "LUCI measured SIBAL spreading at 0.6× (base) and 0.39× (tip) of its 1 g rate in lunar gravity, and SIBAL burns downward in lunar g but extinguishes right after ignition in 1 g. Slower does not mean safer.",
    findingIds: ["F041", "F042", "F035"],
    sourceIds: ["S07", "S08"],
    learn: "partial-gravity",
  },
  {
    id: "W-CO2",
    module: "galley",
    alert: "Galley fire, crew nearby",
    situation: "You grab the CO₂ extinguisher for a Galley fire in a small closed module with two crew inside.",
    actions: [
      { label: "Discharge freely. CO₂ is harmless to people", result: "wrong" },
      { label: "Use it, but protect the crew (masks) because CO₂ is not inert to people at these levels", result: "correct" },
      { label: "Use nitrogen from a hose instead", result: "wrong" },
    ],
    explanation: "CO₂ is not physiologically inert at extinguishing concentrations, and without buoyancy it is not carried away. Nitrogen applied locally can strengthen a flame.",
    findingIds: ["F023", "F025"],
    sourceIds: ["S24", "S15", "S44"],
    learn: "spread-limits",
  },
  {
    id: "W-SAFFIRE",
    module: "storage",
    alert: "Smoke haze, no alarm yet",
    situation: "Crew smell smoke from an acrylic (PMMA) panel in a sealed module. The smoke alarm has not tripped.",
    actions: [
      { label: "Wait for the alarm to confirm", result: "wrong" },
      { label: "Treat it as a fire now: isolate, masks on, check CO", result: "correct" },
      { label: "Open the hatch to air the module out", result: "wrong" },
    ],
    explanation: "In Saffire-VI the alarm threshold came at 981 s, after most of the hazardous gas had been released. PMMA tests exceeded 1-hour CO₂ and 24-hour CO limits. Opening the hatch supplies fresh oxygen.",
    findingIds: ["F018", "F029"],
    sourceIds: ["S01", "S15"],
    learn: "large-scale-fire",
  },
  {
    id: "W-FOAM",
    module: "hab",
    alert: "Design review: insulation choice",
    situation: "Melamine foam insulation flew safely at 30% O₂ / 10.2 psia. Can it go in the new 34% O₂ / 8.2 psia habitat?",
    actions: [
      { label: "Yes, it is already flight-proven", result: "wrong" },
      { label: "No: it was assessed flammable at 34–40% O₂; look at alternatives such as Solimide HT-340", result: "correct" },
      { label: "Only if the cabin fans run all the time", result: "wrong" },
    ],
    explanation: "Melamine foam was acceptable at 30% O₂ / 10.2 psia but flammable at 34–40% O₂ / 8.2 psia. Solimide HT-340 was suggested as a possible replacement.",
    findingIds: ["F049", "F054"],
    sourceIds: ["S03", "S35"],
    learn: "oxygen-pressure",
  },
  {
    id: "W-FILTER",
    module: "galley",
    alert: "Particle counts low, faint odour",
    situation: "A faint smouldering odour in the Galley, but particle counts stay low while the cabin filter runs hard.",
    actions: [
      { label: "Low counts mean no fire", result: "wrong" },
      { label: "Filtration may be outpacing the smoke. Inspect the area and check CO", result: "correct" },
      { label: "Turn the filter up further", result: "wrong" },
    ],
    explanation: "ECLSS particle filtration can outpace smoke accumulation in an early small fire, so detection may be delayed. Smoke in poorly ventilated pockets also ages into larger particles.",
    findingIds: ["F019", "F016"],
    sourceIds: ["S06", "S21"],
    learn: "smoke-detection",
  },
  {
    id: "W-INTERP",
    module: "airlock",
    alert: "Planning call: Mars suit-port materials",
    situation: "A colleague proposes estimating Mars-gravity (0.38 g) flammability by averaging the microgravity and 1 g results.",
    actions: [
      { label: "Agree, interpolation is fine", result: "wrong" },
      { label: "Object: partial-gravity fire cannot be interpolated from 0 g and 1 g; test or flag as a gap", result: "correct" },
      { label: "Use 1 g results only; Earth is always worst-case", result: "wrong" },
    ],
    explanation: "Partial-gravity fire behaviour cannot be interpolated from 0 g and 1 g. Lunar g may be the most flammable condition for some fuels, so 1 g is not always worst-case.",
    findingIds: ["F033", "F030", "F036"],
    sourceIds: ["S11", "S13", "S09"],
    learn: "partial-gravity",
  },
];
