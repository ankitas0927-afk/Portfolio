import type { Metadata } from "next";
import { Section } from "@/components/common/section";
import { ResumePanel } from "@/components/portfolio/resume-panel";
import { fetchPortfolio } from "@/services/portfolio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resume",
  description: "Preview and download the active resume for Ankita Singh."
};

export default async function ResumePage() {
  const portfolio = await fetchPortfolio();
  return (
    <Section title="Resume" eyebrow="Resume" description="The active resume is streamed from MongoDB GridFS and previewed when the file format supports it.">
      <ResumePanel resume={portfolio?.activeResume ?? null} />
    </Section>
  );
}
