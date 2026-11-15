import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { JetBrains_Mono, Lora, Poppins } from "next/font/google";
import { HabitatProvider } from "@/components/HabitatProvider";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { SiteHeader } from "@/components/SiteHeader";
import { themePalette } from "@/lib/plotlyTheme";
import "./globals.css";

const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], display: "swap", preload: false });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "500"], display: "swap", preload: false });

export const metadata: Metadata = {
  title: { default: "Ember Atlas · Graded fire-safety evidence for Moon and Mars habitats", template: "%s · Ember Atlas" },
  description:
    "Summarizes, ranks and explains decades of NASA microgravity combustion results against the 8.2 psia / 34% O₂ exploration atmosphere, with graded evidence and a source for every number.",
  // Space Apps 2026 rules require SI-assisted code to be acknowledged in metadata as well as text.
  other: {
    "si-disclosure":
      "Code and plain-language text written with SI assistance (Anthropic Claude via Claude Code) and reviewed by the team. Dataset compiled from NASA sources with SI assistance (table extraction, paraphrased findings) and checked by the team against each source; no data values were SI-invented. No SI-generated images, video or audio.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: themePalette.paper },
    { media: "(prefers-color-scheme: dark)", color: themePalette.ink },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable} ${lora.variable} ${jetbrains.variable}`}>
      <body className="antialiased">
        <HabitatProvider>
          <SiteHeader />
          <RevealOnScroll />
          <main id="main" className="mx-auto min-h-[calc(100vh-9rem)] max-w-[1200px] px-4 pb-24 pt-8 sm:pt-12">
            {children}
          </main>
          <footer className="border-t border-sand-strong bg-sand">
            <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 py-8 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
              <p>Data: NASA PSI repository and NASA publications. Research screening tool, not a certification source.</p>
              <p className="flex gap-3">
                <Link href="/method" className="hover:text-ink">
                  Data &amp; Method
                </Link>
                <Link href="/ranking" className="hover:text-ink">
                  Ranking method
                </Link>
                <span>NASA Space Apps 2026 · Uses NASA data</span>
              </p>
            </div>
          </footer>
        </HabitatProvider>
      </body>
    </html>
  );
}
