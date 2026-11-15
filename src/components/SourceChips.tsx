import sourcesJson from "@/data/raw/sources.json";
import type { Source } from "@/lib/types";

const sources = sourcesJson as unknown as Source[];
const sourceById = new Map(sources.map((source) => [source.source_id, source]));

export function resolveSource(id: string): Source | undefined {
  return sourceById.get(id);
}

export function SourceChips({ ids, label = "Sources" }: { ids: string[]; label?: string }) {
  const unique = [...new Set(ids)].filter(Boolean);
  if (!unique.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="eyebrow mr-0.5">{label}</span>
      {unique.map((id) => {
        const source = sourceById.get(id);
        if (!source) {
          return (
            <a key={id} href={`/library/${encodeURIComponent(id)}`} className="num inline-flex min-h-11 items-center rounded border border-line px-2 text-[11px] text-muted hover:text-ink" title="Investigation record in this dataset (its NASA sources are listed on the investigation page)">
              {id}
            </a>
          );
        }
        return (
          <a
            key={id}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`${source.title} (${source.nasa_id}), retrieved ${source.retrieved}`}
            className="num inline-flex min-h-11 items-center gap-1 rounded border border-line-strong bg-panel-2 px-2 text-[11px] text-habitat hover:border-habitat/60 hover:bg-habitat/10"
          >
            {id}
            <svg width="9" height="9" viewBox="0 0 12 12" aria-hidden>
              <path d="M4 2h6v6M10 2 3 9" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="sr-only">: {source.title} (opens in new tab)</span>
          </a>
        );
      })}
    </div>
  );
}
