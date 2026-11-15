import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { HabitatProvider } from "@/components/HabitatProvider";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const plexSans = IBM_Plex_Sans({ variable: "--font-plex-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: { default: "Flame in Freefall · Graded fire-safety evidence for Moon and Mars habitats", template: "%s · Flame in Freefall" },
  description:
    "Summarizes, ranks and explains decades of NASA microgravity combustion results against the 8.2 psia / 34% O₂ exploration atmosphere, with graded evidence and a source for every number.",
  // Space Apps 2026 rules require SI-assisted code to be acknowledged in metadata as well as text.
  other: {
    "si-disclosure":
      "Code and plain-language text written with SI assistance (Anthropic Claude via Claude Code) and reviewed by the team. Dataset compiled from NASA sources with SI assistance (table extraction, paraphrased findings) and checked by the team against each source; no data values were SI-invented. No SI-generated images, video or audio.",
  },
};

export const viewport: Viewport = {
  themeColor: "#06090d",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${plexSans.variable} ${plexMono.variable} antialiased`}>
        <HabitatProvider>
          <SiteHeader />
          <main id="main" className="mx-auto min-h-[calc(100vh-9rem)] max-w-7xl px-4 pb-16 pt-6">
            {children}
          </main>
          <footer className="border-t border-line">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
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
