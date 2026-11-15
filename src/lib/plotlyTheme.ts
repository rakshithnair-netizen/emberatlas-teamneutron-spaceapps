import type { Layout, LayoutAxis } from "plotly.js";

export const themePalette = {
  ink: "#141413",
  paper: "#faf9f5",
  stone: "#b0aea5",
  sand: "#e8e6dc",
  clay: "#d97757",
  sky: "#6a9bcc",
  sage: "#788c5d",
  inkMuted: "#5e5d59",
  paperRaised: "#ffffff",
  sandStrong: "#d8d5c8",
  clayStrong: "#9f4e34",
  claySoft: "#f3e3da",
  skyStrong: "#3b6995",
  sageStrong: "#56683f",
  darkRaised: "#1f1e1c",
  darkBorder: "#3a3935",
  darkGrid: "#2e2d2a",
} as const;

export interface ChartTheme {
  dark: boolean;
  fg: string;
  muted: string;
  grid: string;
  axis: string;
  surface: string;
  border: string;
  clay: string;
  clayStrong: string;
  claySoft: string;
  sky: string;
  skyStrong: string;
  sage: string;
  sageStrong: string;
  stone: string;
  fuel: Record<string, string>;
  relevanceBand: Record<string, string>;
  family: string[];
}

export const fontDisplay = "var(--font-poppins), Arial, sans-serif";
export const fontMono = "var(--font-jetbrains), ui-monospace, monospace";

export function chartTheme(dark: boolean): ChartTheme {
  const p = themePalette;
  return {
    dark,
    fg: dark ? p.paper : p.ink,
    muted: dark ? p.stone : p.inkMuted,
    grid: dark ? p.darkGrid : p.sand,
    axis: dark ? p.stone : p.ink,
    surface: dark ? p.darkRaised : p.paperRaised,
    border: dark ? p.darkBorder : p.sandStrong,
    clay: p.clay,
    clayStrong: dark ? "#db7e5f" : p.clayStrong,
    claySoft: dark ? "#3b2a22" : p.claySoft,
    sky: p.sky,
    skyStrong: dark ? p.sky : p.skyStrong,
    sage: p.sage,
    sageStrong: dark ? "#899e6c" : p.sageStrong,
    stone: p.stone,
    fuel: { solid: p.clay, liquid: p.sky, gas: p.sage },
    relevanceBand: {
      A: dark ? "#899e6c" : p.sageStrong,
      B: dark ? p.sky : p.skyStrong,
      C: p.sky,
      D: p.stone,
      E: dark ? p.darkBorder : p.sandStrong,
      F: p.clay,
    },
    family: [p.clay, p.sky, p.sage, dark ? p.paper : p.ink, p.stone],
  };
}

export function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16));
  return `rgba(${r},${g},${b},${alpha})`;
}

export function axisStyle(theme: ChartTheme): Partial<LayoutAxis> {
  return {
    gridcolor: theme.grid,
    zerolinecolor: theme.axis,
    zerolinewidth: 1,
    linecolor: theme.axis,
    linewidth: 1,
    showline: true,
    tickfont: { family: fontMono, size: 11, color: theme.muted },
    title: { font: { family: fontDisplay, size: 12, color: theme.muted } },
  };
}

export function baseLayout(theme: ChartTheme): Partial<Layout> {
  return {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { family: fontDisplay, color: theme.muted, size: 12 },
    margin: { l: 56, r: 16, t: 16, b: 48 },
    hoverlabel: {
      bgcolor: theme.dark ? themePalette.paper : themePalette.ink,
      bordercolor: theme.dark ? themePalette.paper : themePalette.ink,
      font: { family: fontMono, size: 11, color: theme.dark ? themePalette.ink : themePalette.paper },
    },
    legend: { bgcolor: "rgba(0,0,0,0)", borderwidth: 0, font: { size: 11, color: theme.muted } },
  };
}
