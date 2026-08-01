import type { Metadata } from "next";
import { HeroSection } from "@/components/portfolio/hero-section";
import { WhatIDoSection, WorkTogetherSection } from "@/components/portfolio/home-sections";
import { fetchPortfolio } from "@/services/portfolio";
import { mediaStreamUrl } from "@/lib/media";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const portfolio = await fetchPortfolio();
  const profile = portfolio?.profile;
  return {
    title: profile ? `${profile.name} | ${profile.rotatingTitles?.[0] || "Research Analyst"}` : "Ankita Singh",
    description: profile?.professionalSummary ?? null
  };
}

export default async function HomePage() {
  const portfolio = await fetchPortfolio();
  if (!portfolio?.profile) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-4 text-center">
        <div>
          <h1 className="text-3xl font-semibold text-ink dark:text-white">Portfolio content is unavailable</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">Start MongoDB, run the seed import and refresh this page.</p>
        </div>
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: portfolio.profile.name,
    jobTitle: portfolio.profile.heading || portfolio.profile.rotatingTitles?.[0] || "Research Analyst",
    description: portfolio.profile.professionalSummary,
    address:
      portfolio.profile.city || portfolio.profile.state || portfolio.profile.country
        ? {
            "@type": "PostalAddress",
            addressLocality: portfolio.profile.city,
            addressRegion: portfolio.profile.state,
            addressCountry: portfolio.profile.country
          }
        : undefined,
    image: portfolio.profile.profileImage?.id ? mediaStreamUrl(portfolio.profile.profileImage.id) : undefined
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <HeroSection profile={portfolio.profile} resume={portfolio.activeResume} />
      <WhatIDoSection skills={portfolio.topSkills} />
      <WorkTogetherSection />
    </>
  );
}
