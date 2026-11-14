export function SphericalFlame({ size = 220, label = true }: { size?: number; label?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" role={label ? "img" : undefined} aria-hidden={label ? undefined : true} aria-label={label ? "Illustration of a spherical microgravity flame around a fuel droplet" : undefined}>
      <defs>
        <radialGradient id="sfShell" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#06090d" stopOpacity="0" />
          <stop offset="58%" stopColor="#1d4ed8" stopOpacity="0" />
          <stop offset="74%" stopColor="#3b82f6" stopOpacity="0.55" />
          <stop offset="82%" stopColor="#ff7a3d" stopOpacity="0.55" />
          <stop offset="90%" stopColor="#ffb07f" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ff7a3d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sfGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff7a3d" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ff7a3d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sfCore" cx="40%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#a16207" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill="url(#sfGlow)" className="flame-flicker" />
      <g className="flame-breathe">
        <circle cx="100" cy="100" r="78" fill="url(#sfShell)" />
        <circle cx="100" cy="100" r="62" fill="none" stroke="#60a5fa" strokeOpacity="0.35" strokeWidth="0.8" />
      </g>
      <circle cx="100" cy="100" r="9" fill="url(#sfCore)" />
      <line x1="100" y1="109" x2="100" y2="196" stroke="#9aa8b7" strokeOpacity="0.35" strokeWidth="0.8" />
    </svg>
  );
}
