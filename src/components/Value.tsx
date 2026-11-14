import { basisKind, basisLabels, describeFlag, isSolidBasis } from "@/lib/basis";

export function formatNumber(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = Math.round(value * 10 ** digits) / 10 ** digits;
  return rounded.toLocaleString("en-US", { maximumFractionDigits: digits });
}

export function Missing() {
  return (
    <span className="num text-faint" title="Not reported in the source">
      —<span className="sr-only">not reported</span>
    </span>
  );
}

export function Value({
  value,
  unit,
  basis,
  hasRange,
  digits = 1,
}: {
  value: number | null | undefined;
  unit: string;
  basis?: string | null;
  hasRange?: boolean;
  digits?: number;
}) {
  if (value === null || value === undefined || !Number.isFinite(value)) return <Missing />;
  const kind = basis === undefined ? "measured" : basisKind(basis, hasRange);
  const solid = isSolidBasis(kind);
  return (
    <span
      className={`num whitespace-nowrap ${solid ? "" : "value-approx"}`}
      title={basis ? `${basisLabels[kind]} (${basis})` : undefined}
    >
      {solid ? "" : "≈"}
      {formatNumber(value, digits)}
      <span className="ml-0.5 text-muted">{unit}</span>
    </span>
  );
}

export function FlagIcon({ flags }: { flags: string[] }) {
  if (!flags.length) return null;
  const text = flags.map(describeFlag).join("\n");
  return (
    <span className="inline-flex items-center gap-1 text-tier-extrapolated" title={text}>
      <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden>
        <path d="M3 15V2m0 0h9l-2 3.5L12 9H3" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <span className="num text-[11px]">{flags.length}</span>
      <span className="sr-only">quality flags: {flags.map(describeFlag).join("; ")}</span>
    </span>
  );
}
