import type { Metadata } from "next";
import { FireWatchGame } from "@/components/FireWatchGame";

export const metadata: Metadata = { title: "Fire Watch" };

export default function FireWatchPage() {
  return <FireWatchGame />;
}
