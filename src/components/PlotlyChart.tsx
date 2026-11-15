"use client";

import { useEffect, useRef, useState } from "react";
import type { Config, Data, Layout, PlotMouseEvent } from "plotly.js";
import { baseLayout } from "@/lib/plotlyTheme";
import { useChartTheme } from "@/lib/useChartTheme";

type PlotlyModule = typeof import("plotly.js-dist-min").default;
let plotlyPromise: Promise<PlotlyModule> | null = null;

function loadPlotly(): Promise<PlotlyModule> {
  if (!plotlyPromise) plotlyPromise = import("plotly.js-dist-min").then((module) => module.default);
  return plotlyPromise;
}

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
  const theme = useChartTheme();
  clickHandler.current = onPointClick;

  useEffect(() => {
    let disposed = false;
    loadPlotly()
      .then((Plotly) => {
        if (disposed || !container.current) return;
        const element = container.current;
        return Plotly.react(element, data, { ...baseLayout(theme), ...layout, autosize: true }, {
          responsive: true,
          displaylogo: false,
          displayModeBar: "hover",
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
  }, [data, layout, config, theme]);

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
        <div className="absolute inset-0 flex items-center justify-center text-xs text-ink-muted">
          {status === "error" ? "Chart failed to load." : "Loading chart…"}
        </div>
      ) : null}
    </div>
  );
}
