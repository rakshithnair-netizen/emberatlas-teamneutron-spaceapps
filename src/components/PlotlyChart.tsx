"use client";

import { useEffect, useRef, useState } from "react";
import type { Config, Data, Layout, PlotMouseEvent } from "plotly.js";

type PlotlyModule = typeof import("plotly.js-dist-min").default;
let plotlyPromise: Promise<PlotlyModule> | null = null;

function loadPlotly(): Promise<PlotlyModule> {
  if (!plotlyPromise) plotlyPromise = import("plotly.js-dist-min").then((module) => module.default);
  return plotlyPromise;
}

export const darkAxis = {
  gridcolor: "rgba(255,255,255,0.06)",
  zerolinecolor: "rgba(255,255,255,0.12)",
  linecolor: "rgba(255,255,255,0.18)",
  tickfont: { family: "var(--font-plex-mono), monospace", size: 11, color: "#9aa8b7" },
  titlefont: { color: "#c8d3de", size: 12 },
};

export const baseLayout: Partial<Layout> = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(12,18,25,0.6)",
  font: { family: "var(--font-plex-sans), sans-serif", color: "#e7edf3", size: 12 },
  margin: { l: 56, r: 16, t: 16, b: 48 },
  hoverlabel: { bgcolor: "#111a24", bordercolor: "#2d3d4f", font: { family: "var(--font-plex-mono), monospace", size: 11, color: "#e7edf3" } },
  legend: { bgcolor: "rgba(6,9,13,0.7)", bordercolor: "#1f2b38", borderwidth: 1, font: { size: 11 } },
};

export function PlotlyChart({
  data,
  layout,
  config,
  className,
  onPointClick,
  ariaLabel,
}: {
  data: Data[];
  layout: Partial<Layout>;
  config?: Partial<Config>;
  className?: string;
  onPointClick?: (event: PlotMouseEvent) => void;
  ariaLabel: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const clickHandler = useRef(onPointClick);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  clickHandler.current = onPointClick;

  useEffect(() => {
    let disposed = false;
    loadPlotly()
      .then((Plotly) => {
        if (disposed || !container.current) return;
        const element = container.current;
        return Plotly.react(element, data, { ...baseLayout, ...layout, autosize: true }, {
          responsive: true,
          displaylogo: false,
          modeBarButtonsToRemove: ["lasso2d", "select2d", "autoScale2d"],
          ...config,
        }).then(() => {
          if (disposed) return;
          setStatus("ready");
          const plotted = element as unknown as { removeAllListeners?: (name: string) => void; on: (name: string, handler: (event: PlotMouseEvent) => void) => void };
          plotted.removeAllListeners?.("plotly_click");
          plotted.on("plotly_click", (event) => clickHandler.current?.(event));
        });
      })
      .catch(() => !disposed && setStatus("error"));
    return () => {
      disposed = true;
    };
  }, [data, layout, config]);

  useEffect(() => {
    const element = container.current;
    return () => {
      if (element) loadPlotly().then((Plotly) => Plotly.purge(element));
    };
  }, []);

  return (
    <div className={`relative ${className ?? ""}`} role="group" aria-label={ariaLabel} aria-roledescription="interactive chart">
      <div ref={container} className="h-full w-full" />
      {status !== "ready" ? (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted">
          {status === "error" ? "Chart failed to load." : "Loading chart…"}
        </div>
      ) : null}
    </div>
  );
}
