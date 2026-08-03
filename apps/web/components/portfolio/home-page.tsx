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
  return (
    <div className="space-y-24 pb-20">
      <section className="mx-auto grid max-w-7xl gap-12 px-4 pt-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:pt-24">
        <motion.div
          className="space-y-8"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.p variants={reveal} className="text-sm font-semibold uppercase tracking-[0.32em] text-accent/80">
            {hero?.eyebrow ?? 'Professional Profile'}
          </motion.p>
          <motion.h1
            variants={reveal}
            className="max-w-4xl font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            {hero?.heading ?? profile?.professionalTitle ?? 'Professional portfolio'}
          </motion.h1>
          <motion.p variants={reveal} className="max-w-2xl text-lg leading-9 text-foreground/72">
            {hero?.subheading ??
              profile?.professionalSummary ??
              'A refined portfolio of experience, skills, and professional highlights.'}
          </motion.p>
          <motion.div variants={reveal} className="flex flex-wrap gap-3">
            {(hero?.highlights ?? []).map((item) => (
              <span
                key={item}
                className="rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm text-foreground/72 shadow-soft"
              >
                {item}
              </span>
            ))}
          </motion.div>
          <motion.div variants={reveal} className="flex flex-wrap gap-4">
            <Link
              href={hero?.ctaPrimaryHref ?? '/resume'}
              className="rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:opacity-95"
            >
              {hero?.ctaPrimaryLabel ?? 'View Resume'}
            </Link>
            <Link
              href={hero?.ctaSecondaryHref ?? '/contact'}
              className="rounded-full border border-border/70 bg-card/80 px-6 py-3 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent"
            >
              {hero?.ctaSecondaryLabel ?? 'Contact'}
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="relative min-h-[420px] rounded-[2rem] border border-border/60 bg-[radial-gradient(circle_at_top,_rgba(13,148,136,0.18),_transparent_52%),linear-gradient(145deg,_rgba(255,255,255,0.92),_rgba(240,249,255,0.85))] p-5 shadow-soft dark:bg-[radial-gradient(circle_at_top,_rgba(13,148,136,0.25),_transparent_52%),linear-gradient(145deg,_rgba(12,18,31,0.95),_rgba(14,25,40,0.9))]">
          <div className="absolute inset-x-7 top-6 flex items-center justify-between rounded-full border border-border/60 bg-background/90 px-4 py-3 text-xs uppercase tracking-[0.24em] text-foreground/55">
            <span>{profile?.fullName ?? 'Published Profile'}</span>
            <span>{profile?.generalLocation ?? 'Location available on request'}</span>
          </div>
          <div className="pt-16">
            <PortfolioImage
              src={hero?.heroImage?.publicUrl ?? profile?.profileImage?.publicUrl}
              alt={hero?.heroImage?.altText ?? profile?.fullName ?? 'Portfolio portrait'}
              width={hero?.heroImage?.width ?? profile?.profileImage?.width ?? 720}
              height={hero?.heroImage?.height ?? profile?.profileImage?.height ?? 720}
              priority
              className="mx-auto h-[360px] w-full max-w-sm rounded-[1.75rem] object-cover object-top shadow-soft"
              sizes="(max-width: 1024px) 100vw, 28rem"
            />
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="About"
          title="Professional background, strengths, and direction."
          description={about?.fullBiography}
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-border/60 bg-card/75 p-6 shadow-soft">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.24em] text-foreground/45">Employment focus</dt>
                <dd className="mt-2 text-base text-foreground/78">
                  {about?.preferredEmploymentArea ?? 'Research, quality, and analytical work'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.24em] text-foreground/45">Availability</dt>
                <dd className="mt-2 text-base text-foreground/78">
                  {about?.availabilityLabel ?? 'Open to suitable opportunities'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.24em] text-foreground/45">Location</dt>
                <dd className="mt-2 text-base text-foreground/78">
                  {about?.currentLocation ?? profile?.generalLocation ?? 'Location available on request'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.24em] text-foreground/45">Current role</dt>
                <dd className="mt-2 text-base text-foreground/78">
                  {profile?.professionalTitle ?? 'Professional Portfolio'}
                </dd>
              </div>
            </dl>
          </div>
          <div className="grid gap-3 rounded-[2rem] border border-border/60 bg-background/80 p-6 shadow-soft">
            {(about?.keyStrengths ?? []).map((strength) => (
              <div
                key={strength}
                className="rounded-2xl border border-border/60 bg-card/80 px-4 py-3 text-sm text-foreground/74"
              >
                {strength}
              </div>
            ))}
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
          <SummaryColumn title="Experience" items={experience.map((item) => ({
            title: item.jobTitle,
            subtitle: item.organisation,
            meta: item.approximateDuration || item.location || '',
            body: item.professionalSummary || '',
          }))} />
          <SummaryColumn title="Education" items={education.map((item) => ({
            title: item.qualification,
            subtitle: item.institution,
            meta: [item.startDate, item.completionDate].filter(Boolean).join(' - '),
            body: item.fieldOfStudy || '',
          }))} />
          <SummaryColumn title="Training" items={training.map((item) => ({
            title: item.trainingTitle || item.trainingType || 'Professional training',
            subtitle: item.organisation,
            meta: item.duration || [item.startDate, item.endDate].filter(Boolean).join(' - '),
            body: item.description || '',
          }))} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Skills"
          title="Capabilities and core strengths"
          description="Technical ability and personal strengths presented with clarity and balance."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4 rounded-[2rem] border border-border/60 bg-card/70 p-6 shadow-soft">
            {skills.categories.map((category) => {
              const categorySkills = skills.skills.filter((skill) => skill.categoryId === category.id);
              return (
                <div key={category.id} className="rounded-[1.5rem] border border-border/50 bg-background/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/70">
                    {category.name}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <span
                        key={skill.id}
                        className="rounded-full border border-border/70 px-3 py-2 text-sm text-foreground/75"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="rounded-[2rem] border border-border/60 bg-background/70 p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/70">Personal strengths</p>
            <div className="mt-4 grid gap-3">
              {skills.personalSkills.map((skill) => (
                <div key={skill.id} className="rounded-2xl border border-border/60 bg-card/80 px-4 py-3">
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
            <article
              key={project.id}
              className="rounded-[2rem] border border-border/60 bg-card/75 p-6 shadow-soft"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-accent/72">
                {project.category || 'Project'}
              </p>
              <h3 className="mt-4 font-display text-2xl font-semibold text-foreground">{project.title}</h3>
              <p className="mt-3 text-sm leading-7 text-foreground/72">{project.shortDescription}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {(project.toolsAndTechnologies ?? []).map((tool: string) => (
                  <span key={tool} className="rounded-full border border-border/70 px-3 py-1.5 text-xs text-foreground/68">
                    {tool}
                  </span>
                ))}
              </div>
              <Link
                href={`/projects/${project.slug}`}
                className="mt-6 inline-flex text-sm font-semibold text-accent transition hover:text-accentSecondary"
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
          <div className="rounded-[2rem] border border-border/60 bg-card/70 p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/70">Languages</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {languages.map((language) => (
                <span key={language.id} className="rounded-full border border-border/70 px-3 py-2 text-sm">
                  {language.name}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-border/60 bg-card/70 p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/70">Interests</p>
            <div className="mt-4 grid gap-2">
              {interests.map((interest) => (
                <div key={interest.id} className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm">
                  {interest.title}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-border/60 bg-[linear-gradient(145deg,rgba(15,118,110,0.12),rgba(29,78,216,0.08))] p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/72">Resume</p>
            <h3 className="mt-4 font-display text-2xl font-semibold text-foreground">
              {resume?.title ?? 'Current resume'}
            </h3>
            <p className="mt-3 text-sm leading-7 text-foreground/72">
              View the latest resume online or download a copy for reference.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/resume"
                className="rounded-full bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-soft"
              >
                Open resume page
              </Link>
              {resume?.downloadUrl ? (
                <a
                  href={resume.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border/70 px-5 py-3 text-sm font-semibold text-foreground/78"
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
    <div className="rounded-[2rem] border border-border/60 bg-card/70 p-6 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/70">{title}</p>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <article key={`${item.title}-${item.subtitle}`} className="rounded-[1.5rem] border border-border/60 bg-background/75 p-5">
            <p className="font-semibold text-foreground">{item.title}</p>
            <p className="mt-1 text-sm text-foreground/68">{item.subtitle}</p>
            {item.meta ? <p className="mt-2 text-xs uppercase tracking-[0.22em] text-foreground/42">{item.meta}</p> : null}
            {item.body ? <p className="mt-3 text-sm leading-7 text-foreground/72">{item.body}</p> : null}
          </article>
        ))}
      </div>
    </div>
  );
}
