"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function RevealOnScroll() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section")).filter((section) => !section.closest("[data-revealed]") && section.getBoundingClientRect().top > window.innerHeight);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "true");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    for (const section of sections) {
      section.classList.add("reveal");
      observer.observe(section);
    }
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}
