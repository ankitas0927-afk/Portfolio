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
import { SectionHeading } from '@/components/common/section-heading';
import {
  DEFAULT_LOCATION,
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_NAME,
  DEFAULT_SITE_TAGLINE,
} from '@/lib/default-site-copy';
import {
  getExperienceDateRangeLabel,
  getExperienceDurationLabel,
  getTotalExperienceLabel,
} from '@/lib/experience';
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
  about,
  experience,
  education,
  training,
  skills,
  featuredProjects,
  languages,
  interests,
  resume,
}: HomePageProps) {
  const heroHighlights = hero?.highlights ?? [];
  const keyStrengths = about?.keyStrengths ?? [];
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
        <SectionHeading
          eyebrow="About"
          title="Professional background, strengths, and direction."
          description={
            about?.fullBiography ?? profile?.professionalSummary ?? DEFAULT_SITE_DESCRIPTION
          }
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="section-card p-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.24em] text-foreground/45">
                  Employment focus
                </dt>
                <dd className="mt-2 text-base text-foreground/78">
                  {about?.preferredEmploymentArea ??
                    'Professional focus details will appear here once the public profile is available.'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.24em] text-foreground/45">
                  Availability
                </dt>
                <dd className="mt-2 text-base text-foreground/78">
                  {about?.availabilityLabel ?? 'Open to suitable opportunities'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.24em] text-foreground/45">Location</dt>
                <dd className="mt-2 text-base text-foreground/78">
                  {about?.currentLocation ?? profile?.generalLocation ?? DEFAULT_LOCATION}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.24em] text-foreground/45">
                  Current role
                </dt>
                <dd className="mt-2 text-base text-foreground/78">
                  {profile?.professionalTitle ?? DEFAULT_SITE_TAGLINE}
                </dd>
              </div>
            </dl>
          </div>
          <div className="section-card grid gap-3 p-6">
            {keyStrengths.length > 0 ? (
              keyStrengths.map((strength) => (
                <div key={strength} className="metric-card text-sm text-foreground/80">
                  {strength}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/60 bg-card/80 px-4 py-4 text-sm text-foreground/68">
                Core strengths will appear here once they are published from the database.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Experience"
          title="Experience, education, and training highlights"
          description="A concise view of professional responsibility, academic preparation, and practical exposure."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <SummaryColumn
            title="Experience"
            items={experience.map((item) => ({
              title: item.jobTitle,
              subtitle: item.organisation,
              meta:
                getExperienceDurationLabel(item) ||
                getExperienceDateRangeLabel(item) ||
                item.location ||
                '',
              body: item.professionalSummary || '',
            }))}
          />
          <SummaryColumn
            title="Education"
            items={education.map((item) => ({
              title: item.qualification,
              subtitle: item.institution,
              meta: [item.startDate, item.completionDate].filter(Boolean).join(' - '),
              body: item.fieldOfStudy || '',
            }))}
          />
          <SummaryColumn
            title="Training"
            items={training.map((item) => ({
              title: item.trainingTitle || item.trainingType || 'Professional training',
              subtitle: item.organisation,
              meta: item.duration || [item.startDate, item.endDate].filter(Boolean).join(' - '),
              body: item.description || '',
            }))}
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Skills"
          title="Capabilities and core strengths"
          description="Technical ability and personal strengths presented with clarity and balance."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="section-card space-y-4 p-6">
            {skills.categories.map((category) => {
              const categorySkills = skills.skills.filter(
                (skill) => skill.categoryId === category.id,
              );
              return (
                <div key={category.id} className="metric-card">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/70">
                    {category.name}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <span key={skill.id} className="info-chip">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="section-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/70">
              Personal strengths
            </p>
            <div className="mt-4 grid gap-3">
              {skills.personalSkills.map((skill) => (
                <div key={skill.id} className="metric-card">
                  {skill.title}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Projects"
          title="Selected projects and practical work"
          description="A focused collection of published work, case studies, and learning-led contributions."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {featuredProjects.map((project) => (
            <article key={project.id} className="section-card hover-lift p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-accent/72">
                {project.category || 'Project'}
              </p>
              <h3 className="mt-4 font-display text-2xl font-semibold text-foreground">
                {project.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-foreground/72">
                {project.shortDescription}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {(project.toolsAndTechnologies ?? []).map((tool: string) => (
                  <span key={tool} className="info-chip text-xs">
                    {tool}
                  </span>
                ))}
              </div>
              <Link
                href={`/projects/${project.slug}`}
                className="ghost-button mt-6 sm:w-auto"
              >
                Explore project details
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Additional"
          title="Languages, interests, and resume"
          description="A broader view of communication, interests, and supporting professional material."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_0.8fr_1.1fr]">
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

function SummaryColumn({
  title,
  items,
}: {
  title: string;
  items: Array<{ title: string; subtitle: string; meta: string; body: string }>;
}) {
  return (
    <div className="section-card p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/70">{title}</p>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <article key={`${item.title}-${item.subtitle}`} className="metric-card">
            <p className="font-semibold text-foreground">{item.title}</p>
            <p className="mt-1 text-sm text-foreground/68">{item.subtitle}</p>
            {item.meta ? (
              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-foreground/42">
                {item.meta}
              </p>
            ) : null}
            {item.body ? (
              <p className="mt-3 text-sm leading-7 text-foreground/72">{item.body}</p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
