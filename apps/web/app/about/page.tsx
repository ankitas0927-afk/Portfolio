import type { Metadata } from "next";
import { EmptyState } from "@/components/portfolio/empty-state";
import { AboutSection, SkillsSection } from "@/components/portfolio/content-sections";
import { Section } from "@/components/common/section";
import { fetchPortfolio } from "@/services/portfolio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description: "Professional biography, summary and strengths for Ankita Singh."
};

export default async function AboutPage() {
  const portfolio = await fetchPortfolio();
  if (!portfolio?.profile) {
    return (
      <Section title="About" eyebrow="Profile" description="Professional biography, summary and strengths for Ankita Singh.">
        <EmptyState title="About content is unavailable right now. Start MongoDB, run the seed import and refresh this page." />
      </Section>
    );
  }
  return (
    <>
      <AboutSection profile={portfolio.profile} personalSkills={portfolio.personalSkills} />
      <SkillsSection
        categories={portfolio.skillCategories}
        skills={portfolio.skills}
        languages={portfolio.languages}
        interests={portfolio.interests}
      />
    </>
  );
}
