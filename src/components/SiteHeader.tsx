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
          className="w-full max-w-[17rem] appearance-none truncate rounded-full border py-1.5 pl-3 pr-7 text-xs tabular-nums hover:border-stone"
          aria-label="Target habitat atmosphere"
        >
          {habitatList.map((entry) => (
            <option key={entry.habitat_id} value={entry.habitat_id}>
              {selectedLabel(entry)}
            </option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted" width="10" height="10" viewBox="0 0 10 10" aria-hidden>
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 4);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

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
    <header className="site-header sticky top-0 z-40 border-b border-sand-strong bg-paper" data-scrolled={scrolled ? "true" : undefined}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:rounded focus:bg-paper-raised focus:px-3 focus:py-2">
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-5 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Ember Atlas home">
          <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden>
            <circle cx="16" cy="16" r="8" fill="var(--color-clay)" />
            <circle cx="16" cy="16" r="12" fill="none" stroke="var(--color-clay)" strokeOpacity="0.45" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="15" fill="none" stroke="var(--color-ink)" strokeWidth="1" strokeDasharray="2 3" />
          </svg>
          <span className="font-display text-[15px] font-semibold tracking-tight">
            Ember <span className="text-ink-muted">Atlas</span>
          </span>
        </Link>
        <nav className="hidden flex-1 items-center gap-1 xl:flex" aria-label="Primary">
          {primaryNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`nav-link inline-flex min-h-11 items-center whitespace-nowrap px-1.5 font-display text-[15px] font-medium ${active ? "text-ink" : "text-ink-muted hover:text-ink"}`}
              >
                {item.label}
              </Link>
            );
          })}
          <details ref={moreTools} className="relative">
            <summary className="flex min-h-11 cursor-pointer list-none items-center whitespace-nowrap px-1.5 font-display text-[15px] font-medium text-ink-muted hover:text-ink">More tools</summary>
            <ul className="absolute right-0 top-full z-50 mt-1 min-w-52 rounded-lg border border-sand-strong bg-paper-raised p-2 shadow-card">
              {secondaryNav.map((item) => <li key={item.href}><Link href={item.href} aria-current={pathname.startsWith(item.href) ? "page" : undefined} className="flex min-h-11 items-center rounded px-3 text-sm text-ink-muted hover:bg-sand hover:text-ink">{item.label}</Link></li>)}
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
            className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-sand-strong xl:hidden"
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
        <nav id="mobile-nav" ref={mobileNav} className="border-t border-sand-strong bg-paper px-4 pb-4 pt-2 xl:hidden" aria-label="Primary">
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
                    className={`flex min-h-11 items-center rounded-md px-3 font-display text-[15px] font-medium ${active ? "bg-clay-soft text-ink" : "text-ink-muted"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <details className="mt-2 border-t border-sand-strong pt-2">
            <summary className="flex min-h-11 cursor-pointer items-center rounded-md px-3 text-sm font-medium text-clay-strong">More tools</summary>
            <ul className="grid gap-1 sm:grid-cols-2">
              {secondaryNav.map((item) => <li key={item.href}><Link href={item.href} aria-current={pathname.startsWith(item.href) ? "page" : undefined} className="flex min-h-11 items-center rounded-md px-3 text-sm text-ink-muted hover:bg-sand hover:text-ink">{item.label}</Link></li>)}
            </ul>
          </details>
        </nav>
      ) : null}
    </header>
  );
}
