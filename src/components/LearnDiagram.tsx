const ink = "#e7edf3";
const muted = "#9aa8b7";
const ember = "#ff7a3d";
const cyan = "#22d3ee";
const blue = "#60a5fa";

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 320 160" className="h-auto w-full" role="img" aria-label={label}>
      <rect x="0.5" y="0.5" width="319" height="159" rx="10" fill="#0a1017" stroke="#1f2b38" />
      {children}
    </svg>
  );
}

export function LearnDiagram({ kind }: { kind: string }) {
  switch (kind) {
    case "spherical":
      return (
        <Frame label="Left: a teardrop flame on Earth with a rising plume. Right: a spherical flame in microgravity.">
          <text x="80" y="20" fill={muted} fontSize="10" textAnchor="middle">Earth (1 g)</text>
          <path d="M80 130 C55 105 62 70 80 35 C98 70 105 105 80 130Z" fill={ember} fillOpacity="0.35" stroke={ember} />
          <path d="M80 30 V8" stroke={muted} strokeDasharray="3 3" markerEnd="url(#arrow)" />
          <circle cx="80" cy="122" r="5" fill="#f5d04c" />
          <text x="240" y="20" fill={muted} fontSize="10" textAnchor="middle">Microgravity</text>
          <circle cx="240" cy="85" r="45" fill={blue} fillOpacity="0.12" stroke={blue} />
          <circle cx="240" cy="85" r="34" fill="none" stroke={ember} strokeOpacity="0.6" />
          <circle cx="240" cy="85" r="6" fill="#f5d04c" />
          <text x="160" y="150" fill={muted} fontSize="9" textAnchor="middle">no buoyancy → no plume → round flame</text>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10z" fill={muted} />
            </marker>
          </defs>
        </Frame>
      );
    case "flow":
      return (
        <Frame label="A fan pushes air across a burning sample; the flame leans downstream. Turning off the fan removes the oxygen supply.">
          {[40, 70, 100].map((y) => (
            <path key={y} d={`M20 ${y} H120`} stroke={cyan} strokeOpacity="0.6" markerEnd="url(#flowArrow)" />
          ))}
          <rect x="140" y="95" width="140" height="8" fill="#f5d04c" fillOpacity="0.6" />
          <path d="M160 95 C175 70 220 62 270 70 C230 78 190 85 175 95Z" fill={ember} fillOpacity="0.45" stroke={ember} />
          <text x="70" y="128" fill={muted} fontSize="10" textAnchor="middle">ventilation flow</text>
          <text x="210" y="128" fill={muted} fontSize="10" textAnchor="middle">flame fed by the flow</text>
          <text x="160" y="150" fill={ink} fontSize="9" textAnchor="middle">Isolate: power off, airflow off</text>
          <defs>
            <marker id="flowArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 L10 5 L0 10z" fill={cyan} />
            </marker>
          </defs>
        </Frame>
      );
    case "limits":
      return (
        <Frame label="Chart sketch: flame survives above a limiting oxygen line; adding suppressant raises the line.">
          <line x1="40" y1="130" x2="300" y2="130" stroke={muted} />
          <line x1="40" y1="130" x2="40" y2="15" stroke={muted} />
          <text x="170" y="150" fill={muted} fontSize="9" textAnchor="middle">suppressant fraction (MEC) →</text>
          <text x="14" y="75" fill={muted} fontSize="9" transform="rotate(-90 14 75)" textAnchor="middle">O₂ →</text>
          <path d="M40 95 L290 30" stroke={ember} strokeWidth="2" />
          <text x="200" y="40" fill={ember} fontSize="10">LOI = 0.209 × (1 − MEC)</text>
          <text x="80" y="55" fill={ink} fontSize="10">burns</text>
          <text x="200" y="115" fill={muted} fontSize="10">extinguished</text>
        </Frame>
      );
    case "ppo2":
      return (
        <Frame label="Two bars: air at 101 kPa and 21% O₂ versus the exploration atmosphere at 56.5 kPa and 34% O₂; the oxygen partial pressures are similar.">
          {[
            { x: 70, total: 101.35, o2: 21, label: "Air 14.7 psia" },
            { x: 210, total: 56.54, o2: 34, label: "8.2 psia / 34%" },
          ].map((bar) => {
            const height = bar.total * 1.05;
            const o2Height = height * (bar.o2 / 100);
            return (
              <g key={bar.label}>
                <rect x={bar.x} y={130 - height} width="50" height={height} fill="#1f2b38" stroke={muted} />
                <rect x={bar.x} y={130 - o2Height} width="50" height={o2Height} fill={cyan} fillOpacity="0.55" />
                <text x={bar.x + 25} y={145} fill={muted} fontSize="9" textAnchor="middle">{bar.label}</text>
                <text x={bar.x + 25} y={124 - o2Height} fill={cyan} fontSize="9" textAnchor="middle">ppO₂ {(bar.total * bar.o2 / 100).toFixed(1)} kPa</text>
              </g>
            );
          })}
        </Frame>
      );
    case "cool":
      return (
        <Frame label="A droplet with a bright hot flame that goes dark, followed by a faint cool flame that keeps reacting.">
          <circle cx="80" cy="80" r="40" fill={ember} fillOpacity="0.3" stroke={ember} />
          <circle cx="80" cy="80" r="6" fill="#f5d04c" />
          <text x="80" y="140" fill={muted} fontSize="10" textAnchor="middle">hot flame (visible)</text>
          <path d="M135 80 H185" stroke={muted} markerEnd="url(#coolArrow)" />
          <circle cx="240" cy="80" r="32" fill="#b294ff" fillOpacity="0.08" stroke="#b294ff" strokeDasharray="2 4" />
          <circle cx="240" cy="80" r="5" fill="#f5d04c" />
          <text x="240" y="140" fill={muted} fontSize="10" textAnchor="middle">cool flame (nearly invisible)</text>
          <defs>
            <marker id="coolArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 L10 5 L0 10z" fill={muted} />
            </marker>
          </defs>
        </Frame>
      );
    case "smoke":
      return (
        <Frame label="Particle size axis: the ISS detector is most sensitive above 1 micrometre; Kapton and Teflon smoke is below 300 nanometres.">
          <line x1="20" y1="100" x2="300" y2="100" stroke={muted} />
          {[
            { x: 40, label: "100 nm" },
            { x: 110, label: "300 nm" },
            { x: 170, label: "600 nm" },
            { x: 240, label: "1 µm" },
          ].map((tick) => (
            <g key={tick.label}>
              <line x1={tick.x} y1="96" x2={tick.x} y2="104" stroke={muted} />
              <text x={tick.x} y="118" fill={muted} fontSize="9" textAnchor="middle">{tick.label}</text>
            </g>
          ))}
          <rect x="40" y="60" width="70" height="30" rx="4" fill={ember} fillOpacity="0.3" stroke={ember} />
          <text x="75" y="79" fill={ink} fontSize="9" textAnchor="middle">Kapton, Teflon</text>
          <rect x="240" y="60" width="60" height="30" rx="4" fill={cyan} fillOpacity="0.2" stroke={cyan} />
          <text x="270" y="79" fill={ink} fontSize="9" textAnchor="middle">detector best</text>
          <text x="160" y="145" fill={muted} fontSize="9" textAnchor="middle">sub-micron smoke can slip past light-scattering detectors</text>
        </Frame>
      );
    case "saffire":
      return (
        <Frame label="A Cygnus cargo vehicle containing a Saffire flow duct with a large burning sample.">
          <rect x="40" y="40" width="240" height="80" rx="30" fill="#111a24" stroke={muted} />
          <rect x="90" y="62" width="140" height="36" fill="#0a1017" stroke={cyan} strokeOpacity="0.6" />
          <rect x="105" y="78" width="110" height="5" fill="#f5d04c" fillOpacity="0.6" />
          <path d="M120 78 C150 68 180 66 210 70 C185 74 150 76 135 78Z" fill={ember} fillOpacity="0.6" />
          <text x="160" y="32" fill={muted} fontSize="10" textAnchor="middle">Cygnus, after leaving the ISS (uncrewed)</text>
          <text x="160" y="140" fill={ink} fontSize="9" textAnchor="middle">Saffire-VI: up to 31% O₂ at about 54 kPa</text>
        </Frame>
      );
    case "partial":
      return (
        <Frame label="Bars for spread-rate ratio lunar to Earth gravity: PMMA tip 0.38, SIBAL tip 0.39, SIBAL base 0.6.">
          {[
            { label: "PMMA tip", value: 0.38 },
            { label: "SIBAL tip", value: 0.39 },
            { label: "SIBAL base", value: 0.6 },
          ].map((bar, index) => (
            <g key={bar.label}>
              <text x="20" y={45 + index * 35} fill={muted} fontSize="10">{bar.label}</text>
              <rect x="95" y={34 + index * 35} width={200 * bar.value} height="14" fill="#d8a6ff" fillOpacity="0.5" />
              <rect x="95" y={34 + index * 35} width="200" height="14" fill="none" stroke="#2d3d4f" />
              <text x={100 + 200 * bar.value} y={45 + index * 35} fill={ink} fontSize="10">{bar.value}×</text>
            </g>
          ))}
          <text x="195" y="145" fill={muted} fontSize="9" textAnchor="middle">LUCI spread rate, lunar g ÷ 1 g (air, normal pressure)</text>
        </Frame>
      );
    default:
      return (
        <Frame label="Concentric distance rings around the exploration atmosphere marker, with tier labels.">
          <ellipse cx="160" cy="80" rx="120" ry="60" fill="none" stroke="#fbbf24" strokeDasharray="4 4" />
          <ellipse cx="160" cy="80" rx="70" ry="35" fill="none" stroke="#60a5fa" />
          <ellipse cx="160" cy="80" rx="30" ry="15" fill="#4ade80" fillOpacity="0.15" stroke="#4ade80" />
          <path d="M150 80 H170 M160 70 V90" stroke={cyan} strokeWidth="2" />
          <text x="160" y="105" fill="#4ade80" fontSize="9" textAnchor="middle">≤0.35 measured</text>
          <text x="160" y="126" fill="#60a5fa" fontSize="9" textAnchor="middle">inside coverage: interpolated</text>
          <text x="160" y="152" fill="#fbbf24" fontSize="9" textAnchor="middle">outside coverage: extrapolated</text>
        </Frame>
      );
  }
}
