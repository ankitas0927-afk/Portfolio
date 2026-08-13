'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, FileText, Languages as LanguagesIcon, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type {
  EducationRecord,
  ExperienceRecord,
  InterestRecord,
  LanguageRecord,
  ProjectRecord,
  PublicProfile,
  TrainingRecord,
} from '@ankita-portfolio/shared-types';

import type { PublicResumeBundle, PublicSkillsBundle } from '@/services/public';
import { PortfolioImage } from '@/components/common/portfolio-image';
import {
  DEFAULT_LOCATION,
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_NAME,
} from '@/lib/default-site-copy';
import { getTotalExperienceLabel } from '@/lib/experience';
import { getResumeDownloadLabel } from '@/lib/media';

type HomePageProps = {
  profile: PublicProfile | null;
  hero: {
    eyebrow?: string;
    heading: string;
    subheading: string;
    highlights: string[];
    ctaPrimaryLabel: string;
    ctaPrimaryHref: string;
    ctaSecondaryLabel?: string;
    ctaSecondaryHref?: string;
    heroImage?: { publicUrl: string; altText?: string; width?: number; height?: number } | null;
  } | null;
  about: {
    fullBiography: string;
    preferredEmploymentArea?: string;
    currentLocation?: string;
    availabilityLabel?: string;
    keyStrengths: string[];
    aboutImage?: { publicUrl: string; altText?: string; width?: number; height?: number } | null;
  } | null;
  experience: ExperienceRecord[];
  education: EducationRecord[];
  training: TrainingRecord[];
  skills: PublicSkillsBundle;
  featuredProjects: ProjectRecord[];
  languages: LanguageRecord[];
  interests: InterestRecord[];
  resume: PublicResumeBundle | null;
};

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function HomePage({
  profile,
  hero,
  experience,
  languages,
  interests,
  resume,
}: HomePageProps) {
  const heroHighlights = hero?.highlights ?? [];
  const overallExperienceLabel = getTotalExperienceLabel(experience);
  const displayHighlights = overallExperienceLabel
    ? Array.from(new Set([overallExperienceLabel, ...heroHighlights]))
    : heroHighlights;

  return (
    <div className="space-y-20 pb-16 sm:space-y-24 sm:pb-20">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 pt-14 sm:px-6 lg:grid-cols-[1.16fr_0.84fr] lg:items-center lg:px-8 lg:pt-20">
        <motion.div
          className="space-y-6 sm:space-y-8"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.p
            variants={reveal}
            className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-accent/85 sm:text-sm"
          >
            {hero?.eyebrow ?? 'Professional Profile'}
          </motion.p>
          <motion.h1
            variants={reveal}
            className="max-w-4xl text-balance font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl xl:text-[4.35rem]"
          >
            {hero?.heading ?? profile?.fullName ?? DEFAULT_SITE_NAME}
          </motion.h1>
          <motion.p
            variants={reveal}
            className="max-w-2xl text-base leading-8 text-foreground/78 sm:text-lg sm:leading-9"
          >
            {hero?.subheading ?? profile?.professionalSummary ?? DEFAULT_SITE_DESCRIPTION}
          </motion.p>
          {displayHighlights.length > 0 ? (
            <motion.div variants={reveal} className="flex flex-wrap gap-3">
              {displayHighlights.map((item) => (
                <span key={item} className="info-chip">
                  {item}
                </span>
              ))}
            </motion.div>
          ) : null}
          <motion.div variants={reveal} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <Link href={hero?.ctaPrimaryHref ?? '/resume'} className="gradient-button w-full sm:w-auto">
              {hero?.ctaPrimaryLabel ?? 'View Resume'}
            </Link>
            <Link href={hero?.ctaSecondaryHref ?? '/contact'} className="ghost-button w-full sm:w-auto">
              {hero?.ctaSecondaryLabel ?? 'Contact'}
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="section-card-strong relative min-h-[340px] p-4 sm:min-h-[420px] sm:p-5 lg:p-6"
        >
          <div className="absolute inset-x-4 top-4 flex flex-col gap-2 rounded-[1.25rem] border border-white/20 bg-background/88 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-foreground/62 sm:inset-x-6 sm:top-6 sm:flex-row sm:items-center sm:justify-between sm:rounded-full">
            <span>{profile?.fullName ?? DEFAULT_SITE_NAME}</span>
            <span>{profile?.generalLocation ?? DEFAULT_LOCATION}</span>
          </div>
          <div className="pt-20 sm:pt-16">
            <PortfolioImage
              src={hero?.heroImage?.publicUrl ?? profile?.profileImage?.publicUrl}
              alt={
                hero?.heroImage?.altText ?? profile?.fullName ?? `${DEFAULT_SITE_NAME} portrait`
              }
              width={hero?.heroImage?.width ?? profile?.profileImage?.width ?? 720}
              height={hero?.heroImage?.height ?? profile?.profileImage?.height ?? 720}
              priority
              className="mx-auto h-[260px] w-full max-w-md rounded-[1.55rem] object-cover object-top shadow-[0_26px_56px_-28px_rgba(11,27,48,0.68)] sm:h-[340px] lg:h-[420px]"
              sizes="(max-width: 1024px) 100vw, 28rem"
            />
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 max-w-2xl space-y-4">
          <div className="premium-pill inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-accent/84">
            <Sparkles className="h-4 w-4" />
            Professional Snapshot
          </div>
          <div className="space-y-3">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-[2.35rem]">
              Essential details presented in a cleaner, more professional format.
            </h2>
            <p className="max-w-xl text-sm leading-7 text-foreground/74 sm:text-base">
              Language comfort, professional interests, and resume access are grouped here as a
              compact overview for quick review.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_0.95fr_1.15fr] lg:items-start">
          <div className="section-card self-start p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/70">
                  Languages
                </p>
                <p className="mt-3 text-sm leading-6 text-foreground/68">
                  Clear communication support across everyday professional conversations.
                </p>
              </div>
              <span className="premium-pill px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/68">
                {languages.length} listed
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {languages.length > 0 ? (
                languages.map((language) => (
                  <span
                    key={language.id}
                    className="inline-flex items-center gap-2 rounded-[1.1rem] border border-border/80 bg-card/96 px-4 py-3 text-sm font-semibold text-foreground shadow-[0_14px_30px_-24px_rgba(11,27,48,0.45)]"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(12,123,119,0.18),rgba(37,99,235,0.16))] text-accent dark:bg-[linear-gradient(135deg,rgba(56,189,248,0.16),rgba(45,212,191,0.16))]">
                      <LanguagesIcon className="h-4 w-4" />
                    </span>
                    {language.name}
                  </span>
                ))
              ) : (
                <div className="metric-card text-sm text-foreground/70">
                  Published languages will appear here once they are available.
                </div>
              )}
            </div>
          </div>

          <div className="section-card self-start p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/70">
                  Interests
                </p>
                <p className="mt-3 text-sm leading-6 text-foreground/68">
                  Focus areas that reflect long-term curiosity and continued professional growth.
                </p>
              </div>
              <span className="premium-pill px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/68">
                {interests.length} themes
              </span>
            </div>
            <div className="mt-5 grid gap-3">
              {interests.length > 0 ? (
                interests.map((interest, index) => (
                  <div key={interest.id} className="metric-card flex items-start gap-3 px-4 py-4">
                    <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(12,123,119,0.16),rgba(37,99,235,0.16))] text-sm font-semibold text-accent dark:bg-[linear-gradient(135deg,rgba(56,189,248,0.18),rgba(45,212,191,0.16))]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-6 text-foreground">
                        {interest.title}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-foreground/46">
                        Professional interest area
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="metric-card text-sm text-foreground/70">
                  Professional interests will appear here once they are published.
                </div>
              )}
            </div>
          </div>

          <div className="section-card-strong self-start p-6 sm:p-7">
            <div className="premium-pill inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-foreground/86">
              <FileText className="h-4 w-4" />
              Resume
            </div>
            <h3 className="mt-5 font-display text-2xl font-semibold text-foreground sm:text-[2rem]">
              {resume?.title ?? 'Current resume'}
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-foreground/78">
              Open the live resume page for a polished browser view or download the latest PDF copy
              for sharing and review.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="premium-outline rounded-[1.35rem] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/56">
                  Access
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground/74">
                  Quick viewing for recruiters, collaborators, and hiring teams.
                </p>
              </div>
              <div className="premium-outline rounded-[1.35rem] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/56">
                  Format
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground/74">
                  Resume content stays easy to open, download, and share when needed.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/resume" className="ghost-button w-full sm:w-auto">
                Open resume page
              </Link>
              {resume?.downloadUrl ? (
                <a
                  href={resume.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="gradient-button w-full sm:w-auto"
                >
                  {getResumeDownloadLabel(resume.media)}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
