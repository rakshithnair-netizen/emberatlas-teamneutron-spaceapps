"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import habitatsJson from "@/data/raw/habitat_atmospheres.json";
import type { HabitatAtmosphere } from "@/lib/types";

export const habitatList = habitatsJson as unknown as HabitatAtmosphere[];
export const DEFAULT_HABITAT_ID = "HAB-03";
const STORAGE_KEY = "fif-habitat";

interface HabitatContextValue {
  habitat: HabitatAtmosphere;
  habitatId: string;
  setHabitatId: (id: string) => void;
}

const HabitatContext = createContext<HabitatContextValue | null>(null);

export function HabitatProvider({ children }: { children: React.ReactNode }) {
  const [habitatId, setHabitatIdState] = useState(DEFAULT_HABITAT_ID);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && habitatList.some((habitat) => habitat.habitat_id === stored)) setHabitatIdState(stored);
    } catch {}
  }, []);

  const setHabitatId = useCallback((id: string) => {
    setHabitatIdState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {}
  }, []);

  const value = useMemo(
    () => ({
      habitatId,
      setHabitatId,
      habitat: habitatList.find((habitat) => habitat.habitat_id === habitatId) ?? habitatList[2],
    }),
    [habitatId, setHabitatId],
  );

  return <HabitatContext.Provider value={value}>{children}</HabitatContext.Provider>;
}

export function useHabitat(): HabitatContextValue {
  const context = useContext(HabitatContext);
  if (!context) throw new Error("useHabitat must be used inside HabitatProvider");
  return context;
}

export function shortHabitatName(habitat: HabitatAtmosphere): string {
  const names: Record<string, string> = {
    "HAB-01": "ISS / air",
    "HAB-02": "Shuttle 10.2 psi",
    "HAB-03": "Exploration 34%",
    "HAB-04": "2006 design 32%",
    "HAB-05": "Design max 40%",
    "HAB-06": "EVA suit",
  };
  return names[habitat.habitat_id] ?? habitat.name;
}
