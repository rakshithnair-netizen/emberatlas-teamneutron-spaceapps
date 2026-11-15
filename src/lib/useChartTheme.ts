"use client";

import { useEffect, useMemo, useState } from "react";
import { chartTheme, type ChartTheme } from "./plotlyTheme";

const darkQuery = "(prefers-color-scheme: dark)";

export function useChartTheme(): ChartTheme {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(darkQuery);
    const update = () => setDark(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return useMemo(() => chartTheme(dark), [dark]);
}
