"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { habitatList, shortHabitatName, useHabitat } from "./HabitatProvider";

// The five core screening steps are always visible; the rest live under "More tools" to keep the
// first-time path short.
const primaryNav = [
  { href: "/", label: "Home" },
  { href: "/matcher", label: "Check a habitat" },
  { href: "/explorer", label: "Explore evidence" },
  { href: "/library", label: "Sources & library" },
  { href: "/method", label: "Method & limits" },
];

const secondaryNav = [
  { href: "/atlas", label: "Ask Atlas" },
  { href: "/ranking", label: "Rankings" },
  { href: "/learn", label: "Learn" },
  { href: "/fire-watch", label: "Fire Watch" },
  { href: "/earth", label: "Earth Applications" },
  { href: "/family-tree", label: "Family Tree" },
];

// "/" only matches the home page itself; every other entry also matches its nested routes.
function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function HabitatPicker({ compact = false }: { compact?: boolean }) {
  const { habitatId, setHabitatId, habitat } = useHabitat();
  const selectedLabel = (entry: (typeof habitatList)[number]) => `${shortHabitatName(entry).replace(/\s+\d+(?:\.\d+)?%$/, "")} · ${entry.o2_pct}% O₂ · ${entry.pressure_kpa.toFixed(1)} kPa`;
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className={compact ? "sr-only" : "eyebrow"}>Target:</span>
      <span className="relative">
        <select
          value={habitatId}
          onChange={(event) => setHabitatId(event.target.value)}
          className="num appearance-none rounded-md border border-habitat/40 bg-habitat/10 py-1.5 pl-2.5 pr-7 text-xs text-habitat hover:border-habitat/70"
          aria-label="Target habitat atmosphere"
        >
          {habitatList.map((entry) => (
            <option key={entry.habitat_id} value={entry.habitat_id}>
              {selectedLabel(entry)}
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
  const menuButton = useRef<HTMLButtonElement>(null);
  const mobileNav = useRef<HTMLElement>(null);
  const moreTools = useRef<HTMLDetailsElement>(null);

  // The header lives in the root layout and stays mounted across client navigations, so menus must be
  // closed explicitly when the route changes. The desktop "More tools" <details> previously stayed open
  // over the new page after clicking one of its links.
  useEffect(() => {
    setOpen(false);
    if (moreTools.current) moreTools.current.open = false;
  }, [pathname]);

  // Close the desktop "More tools" dropdown on a click outside it or on Escape, like a normal menu.
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const details = moreTools.current;
      if (details?.open && !details.contains(event.target as Node)) details.open = false;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const details = moreTools.current;
      if (event.key === "Escape" && details?.open) {
        details.open = false;
        details.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Mobile menu: move focus into it when opened, and let Escape close it and return focus to the toggle.
  useEffect(() => {
    if (!open) return;
    const firstLink = mobileNav.current?.querySelector<HTMLElement>("a, summary");
    firstLink?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

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
        <nav className="hidden flex-1 items-center gap-0.5 xl:flex" aria-label="Primary">
          {primaryNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-md px-2 text-[13px] ${active ? "bg-panel-2 text-ink" : "text-muted hover:text-ink"}`}
              >
                {item.label}
              </Link>
            );
          })}
          <details ref={moreTools} className="relative">
            <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-md px-2 text-[13px] text-muted hover:text-ink">More tools</summary>
            <ul className="absolute right-0 top-full z-50 mt-1 min-w-52 rounded-lg border border-line bg-panel p-2 shadow-xl">
              {secondaryNav.map((item) => <li key={item.href}><Link href={item.href} aria-current={pathname.startsWith(item.href) ? "page" : undefined} className="flex min-h-11 items-center rounded px-3 text-sm text-muted hover:bg-panel-2 hover:text-ink">{item.label}</Link></li>)}
            </ul>
          </details>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <HabitatPicker />
          </div>
          <button
            ref={menuButton}
            type="button"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-line xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
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
        <nav id="mobile-nav" ref={mobileNav} className="border-t border-line bg-bg px-4 pb-4 pt-2 xl:hidden" aria-label="Primary">
          <div className="mb-3 sm:hidden">
            <HabitatPicker />
          </div>
          <ul className="grid gap-1 sm:grid-cols-2">
            {primaryNav.map((item) => {
              // Use the same rule for the highlight and for aria-current, so screen readers announce the
              // current section on nested pages like /library/PSI-100 just as sighted users see it.
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-11 items-center rounded-md px-3 text-sm ${active ? "bg-panel-2 text-ink" : "text-muted"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <details className="mt-2 border-t border-line pt-2">
            <summary className="flex min-h-11 cursor-pointer items-center rounded-md px-3 text-sm font-medium text-habitat">More tools</summary>
            <ul className="grid gap-1 sm:grid-cols-2">
              {secondaryNav.map((item) => <li key={item.href}><Link href={item.href} aria-current={pathname.startsWith(item.href) ? "page" : undefined} className="flex min-h-11 items-center rounded-md px-3 text-sm text-muted hover:bg-panel-2 hover:text-ink">{item.label}</Link></li>)}
            </ul>
          </details>
        </nav>
      ) : null}
    </header>
  );
}
