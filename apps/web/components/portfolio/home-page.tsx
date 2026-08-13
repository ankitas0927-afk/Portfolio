'use client';

import { motion } from 'framer-motion';
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
        <div className="grid gap-6 lg:grid-cols-[0.8fr_0.8fr_1.1fr]">
          <div className="section-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/70">
              Languages
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {languages.map((language) => (
                <span key={language.id} className="info-chip">
                  {language.name}
                </span>
              ))}
            </div>
          </div>
          <div className="section-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/70">
              Interests
            </p>
            <div className="mt-4 grid gap-2">
              {interests.map((interest) => (
                <div key={interest.id} className="metric-card text-sm">
                  {interest.title}
                </div>
              ))}
            </div>
          </div>
          <div className="section-card-strong p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/72">
              Resume
            </p>
            <h3 className="mt-4 font-display text-2xl font-semibold text-foreground">
              {resume?.title ?? 'Current resume'}
            </h3>
            <p className="mt-3 text-sm leading-7 text-foreground/72">
              View the latest resume online or download a copy for reference.
            </p>
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
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
