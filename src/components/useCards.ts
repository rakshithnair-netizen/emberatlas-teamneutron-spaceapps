"use client";

import { useEffect, useState } from "react";
import type { BurnCard } from "@/lib/types";

let cache: BurnCard[] | null = null;
let pending: Promise<BurnCard[]> | null = null;

export function loadCards(): Promise<BurnCard[]> {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = fetch("/data/burn_cards.json")
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load burn cards (${response.status})`);
        return response.json() as Promise<BurnCard[]>;
      })
      .then((cards) => {
        cache = cards;
        return cards;
      })
      .catch((error) => {
        pending = null;
        throw error;
      });
  }
  return pending;
}

export function useCards(): { cards: BurnCard[] | null; error: string | null } {
  const [cards, setCards] = useState<BurnCard[] | null>(cache);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (cache) return;
    let active = true;
    loadCards()
      .then((loaded) => active && setCards(loaded))
      .catch((reason: Error) => active && setError(reason.message));
    return () => {
      active = false;
    };
  }, []);
  return { cards, error };
}
