import type { EvidenceTier } from "@/lib/types";
import { evidenceTierMeta } from "@/lib/evidence";
import { chartTheme } from "@/lib/plotlyTheme";

const tierStyle: Record<EvidenceTier, string> = {
  measured: "bg-sage-soft text-sage-strong border-sage-strong",
  interpolated: "bg-sky-soft text-sky-strong border-sky-strong",
  extrapolated: "bg-clay-soft text-clay-strong border-clay-strong",
  analog: "bg-sand text-ink-muted border-sand-strong border-dashed",
  no_data: "bg-transparent text-ink-subtle border-stone border-dotted",
};

const tierPalette = chartTheme(false);

export const tierHex: Record<EvidenceTier, string> = {
  measured: tierPalette.sageStrong,
  interpolated: tierPalette.skyStrong,
  extrapolated: tierPalette.clay,
  analog: tierPalette.stone,
  no_data: tierPalette.stone,
};

export function TierIcon({ tier, size = 14 }: { tier: EvidenceTier; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 16 16", "aria-hidden": true, className: "shrink-0" } as const;
  switch (tier) {
    case "measured":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.2" />
          <path d="M4.5 8.2 7 10.6l4.6-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "interpolated":
      return (
        <svg {...common}>
          <path d="M8 1.5 14.5 8 8 14.5 1.5 8Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="2" fill="currentColor" />
        </svg>
      );
    case "extrapolated":
      return (
        <svg {...common}>
          <path d="M8 1.8 15 14H1Z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M8 6v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="8" cy="12" r="0.9" fill="currentColor" />
        </svg>
      );
    case "analog":
      return (
        <svg {...common}>
          <circle cx="5.5" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="10.5" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 1.5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.5 2" />
          <path d="M5.5 10.5 10.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
}

export function EvidenceBadge({ tier, size = "md", detail, compact = false }: { tier: EvidenceTier; size?: "sm" | "md" | "lg"; detail?: string; compact?: boolean }) {
  const style = tierStyle[tier];
  const meta = evidenceTierMeta[tier];
  const sizing = size === "lg" ? "px-4 py-2 text-lg font-semibold gap-2" : size === "sm" ? "px-2 py-0.5 text-[11px] font-medium gap-1" : "px-2.5 py-1 text-xs font-medium gap-1.5";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border font-display ${style} ${sizing}`}
      title={`${meta.label}: ${meta.description}`}
    >
      <TierIcon tier={tier} size={size === "lg" ? 18 : size === "sm" ? 11 : 13} />
      <span>{compact ? "" : <span className="font-normal">Evidence: </span>}{meta.label}</span>
      {detail ? <span className="num font-normal">· {detail}</span> : null}
    </span>
  );
}

export const tierOrder: EvidenceTier[] = ["measured", "interpolated", "extrapolated", "analog", "no_data"];
