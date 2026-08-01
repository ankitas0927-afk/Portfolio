import type { Metadata } from "next";
import { ExperienceSection } from "@/components/portfolio/content-sections";
import { fetchPortfolio } from "@/services/portfolio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Experience",
  description: "Research Analyst experience for Ankita Singh."
};

export default async function ExperiencePage() {
  const portfolio = await fetchPortfolio();
  return <ExperienceSection experiences={portfolio?.experiences ?? []} />;
}
