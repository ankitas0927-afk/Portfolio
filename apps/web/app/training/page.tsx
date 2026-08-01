import type { Metadata } from "next";
import { TrainingSection } from "@/components/portfolio/content-sections";
import { fetchPortfolio } from "@/services/portfolio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Training",
  description: "Professional industrial training for Ankita Singh."
};

export default async function TrainingPage() {
  const portfolio = await fetchPortfolio();
  return <TrainingSection training={portfolio?.training ?? []} />;
}
