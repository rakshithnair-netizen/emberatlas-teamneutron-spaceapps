"use client";

import Link from "next/link";
import { habitatQueryGravity, useHabitat } from "./HabitatProvider";

// Home-page primary call to action. A client component because the link depends on the habitat chosen
// in the header picker (stored in localStorage), which the server-rendered home page cannot see.
export function HomeMatcherLink() {
  const { habitat } = useHabitat();
  const gravity = habitatQueryGravity(habitat.habitat_id);
  return <Link href={`/matcher?o2=${habitat.o2_pct}&p=${habitat.pressure_kpa}&g=${gravity}&fuel=solid`} className="inline-flex min-h-11 items-center rounded-lg bg-ember px-4 text-sm font-semibold text-black hover:bg-ember-soft">See what the evidence says</Link>;
}
