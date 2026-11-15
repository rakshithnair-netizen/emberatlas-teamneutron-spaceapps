"use client";

import Link from "next/link";
import { habitatQueryGravity, useHabitat } from "./HabitatProvider";

// Home-page primary call to action. A client component because the link depends on the habitat chosen
// in the header picker (stored in localStorage), which the server-rendered home page cannot see.
export function HomeMatcherLink() {
  const { habitat } = useHabitat();
  const gravity = habitatQueryGravity(habitat.habitat_id);
  return <Link href={`/matcher?o2=${habitat.o2_pct}&p=${habitat.pressure_kpa}&g=${gravity}&fuel=solid`} className="btn btn-accent">See what the evidence says</Link>;
}
