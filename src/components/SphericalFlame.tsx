export function SphericalFlame({ size = 220, label = true }: { size?: number; label?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" role={label ? "img" : undefined} aria-hidden={label ? undefined : true} aria-label={label ? "Illustration of a spherical microgravity flame around a fuel droplet" : undefined}>
      <defs>
        <radialGradient id="sfShell" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-clay-soft)" stopOpacity="0" />
          <stop offset="58%" stopColor="var(--color-clay-soft)" stopOpacity="0.2" />
          <stop offset="76%" stopColor="var(--color-clay)" stopOpacity="0.75" />
          <stop offset="88%" stopColor="var(--color-clay-soft)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--color-clay-soft)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sfGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-clay-soft)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--color-clay-soft)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sfCore" cx="40%" cy="38%" r="60%">
          <stop offset="0%" stopColor="var(--color-clay-soft)" />
          <stop offset="100%" stopColor="var(--color-clay-strong)" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill="url(#sfGlow)" className="flame-flicker" />
      <g className="flame-breathe">
        <circle cx="100" cy="100" r="78" fill="url(#sfShell)" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="var(--color-ink)" strokeOpacity="0.85" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="62" fill="none" stroke="var(--color-ink)" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 4" />
      </g>
      <circle cx="100" cy="100" r="9" fill="url(#sfCore)" stroke="var(--color-ink)" strokeWidth="1.5" />
      <line x1="100" y1="109" x2="100" y2="196" stroke="var(--color-ink-muted)" strokeOpacity="0.6" strokeWidth="1" />
    </svg>
  );
}
