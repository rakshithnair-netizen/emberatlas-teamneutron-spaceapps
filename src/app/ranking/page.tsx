import type { Metadata } from "next";
import { RankingView } from "@/components/RankingView";
import { insightsByHabitat } from "@/lib/insights-server";

export const metadata: Metadata = { title: "Ranking method" };

export default function RankingPage() {
  return <RankingView byHabitat={insightsByHabitat()} />;
}
