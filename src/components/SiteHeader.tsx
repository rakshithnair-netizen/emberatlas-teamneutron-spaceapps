"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { habitatList, shortHabitatName, useHabitat } from "./HabitatProvider";

export const navItems = [
  { href: "/explorer", label: "Envelope Map", short: "Map" },
  { href: "/matcher", label: "Condition Matcher", short: "Matcher" },
  { href: "/atlas", label: "Ask Atlas", short: "Atlas" },
  { href: "/library", label: "Flame Library", short: "Library" },
  { href: "/family-tree", label: "Family Tree", short: "Family Tree" },
  { href: "/learn", label: "Learn", short: "Learn" },
  { href: "/earth", label: "Earth Applications", short: "Earth" },
  { href: "/fire-watch", label: "Fire Watch", short: "Fire Watch" },
  { href: "/method", label: "Data & Method", short: "Method" },
];

export function HabitatPicker({ compact = false }: { compact?: boolean }) {
  const { habitatId, setHabitatId, habitat } = useHabitat();
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className={compact ? "sr-only" : "eyebrow 2xl:not-sr-only sr-only"}>Habitat</span>
      <span className="relative">
        <select
          value={habitatId}
          onChange={(event) => setHabitatId(event.target.value)}
          className="num appearance-none rounded-md border border-habitat/40 bg-habitat/10 py-1.5 pl-2.5 pr-7 text-xs text-habitat hover:border-habitat/70"
          aria-label="Habitat atmosphere"
        >
          {habitatList.map((entry) => (
            <option key={entry.habitat_id} value={entry.habitat_id}>
              {shortHabitatName(entry)} · {entry.o2_pct}% / {entry.pressure_kpa} kPa
            </option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-habitat" width="10" height="10" viewBox="0 0 10 10" aria-hidden>
          <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </span>
      <span className="sr-only">Current: {habitat.name}</span>
    </label>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:rounded focus:bg-panel focus:px-3 focus:py-2">
        Skip to content
      </a>
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Flame in Freefall home">
          <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden>
            <defs>
              <radialGradient id="logoFlame" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff4d6" />
                <stop offset="35%" stopColor="#ffb07f" />
                <stop offset="70%" stopColor="#ff7a3d" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
              </radialGradient>
            </defs>
            <circle cx="16" cy="16" r="13" fill="url(#logoFlame)" />
            <circle cx="16" cy="16" r="15" fill="none" stroke="#22d3ee" strokeOpacity="0.5" strokeDasharray="2 3" />
          </svg>
          <span className="text-sm font-semibold tracking-tight">
            Flame <span className="text-muted">in</span> Freefall
          </span>
        </Link>
        <nav className="hidden flex-1 items-center gap-0.5 overflow-x-auto xl:flex" aria-label="Main">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-md px-2 py-1.5 text-[13px] ${active ? "bg-panel-2 text-ink" : "text-muted hover:text-ink"}`}
              >
                {item.short}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <HabitatPicker />
          </div>
          <button
            type="button"
            className="rounded-md border border-line p-2 xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">Menu</span>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
              {open ? (
                <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.6" />
              ) : (
                <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.6" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-nav" className="border-t border-line bg-bg px-4 pb-4 pt-2 xl:hidden" aria-label="Main mobile">
          <div className="mb-3 sm:hidden">
            <HabitatPicker />
          </div>
          <ul className="grid grid-cols-2 gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded-md px-3 py-2 text-sm ${pathname.startsWith(item.href) ? "bg-panel-2 text-ink" : "text-muted"}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
