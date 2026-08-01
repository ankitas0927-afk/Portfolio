import type { Metadata } from "next";
import { EducationSection } from "@/components/portfolio/content-sections";
import { fetchPortfolio } from "@/services/portfolio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Education",
  description: "Education records for Ankita Singh."
};

export default async function EducationPage() {
  const portfolio = await fetchPortfolio();
  return <EducationSection education={portfolio?.education ?? []} />;
}
