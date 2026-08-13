import Link from 'next/link';
import { ArrowUpRight, Clock3, FileText, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

import { PortfolioImage } from '@/components/common/portfolio-image';
import { SectionHeading } from '@/components/common/section-heading';
import { ContactForm } from '@/components/forms/contact-form';
import {
  DEFAULT_LOCATION,
  DEFAULT_SITE_NAME,
  DEFAULT_SITE_TAGLINE,
} from '@/lib/default-site-copy';
import { getTotalExperienceLabel } from '@/lib/experience';
import { getResumeDownloadLabel } from '@/lib/media';
import {
  getPublicExperience,
  getPublicProfile,
  getPublicResume,
  getPublicSocialLinks,
} from '@/services/public';

export const revalidate = 60;

export default async function ContactPage() {
  const [profile, resume, socialLinks, experience] = await Promise.all([
    getPublicProfile(),
    getPublicResume(),
    getPublicSocialLinks(),
    getPublicExperience(),
  ]);

  const displayName = profile?.fullName ?? DEFAULT_SITE_NAME;
  const title = profile?.professionalTitle ?? DEFAULT_SITE_TAGLINE;
  const email = profile?.publicEmail ?? null;
  const phone = profile?.publicPhone ?? null;
  const location = profile?.generalLocation ?? DEFAULT_LOCATION;
  const profileTags = (profile?.rotatingTitles ?? []).slice(0, 4);
  const overallExperienceLabel = getTotalExperienceLabel(experience);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <section className="page-shell relative px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
        <div className="pointer-events-none absolute -left-16 top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.2),transparent_72%)] blur-3xl" />
        <div className="pointer-events-none absolute -right-12 bottom-8 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.22),transparent_72%)] blur-3xl" />

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
          <div className="space-y-6">
            <SectionHeading eyebrow="Contact" title="Get in touch for professional opportunities." />

            <div className="flex flex-wrap gap-3">
              {overallExperienceLabel ? (
                <span className="premium-pill px-4 py-2 text-sm font-medium text-foreground/76">
                  {overallExperienceLabel}
                </span>
              ) : null}
              {profileTags.length > 0 ? (
                profileTags.map((tag) => (
                  <span
                    key={tag}
                    className="premium-pill px-4 py-2 text-sm font-medium text-foreground/76"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <>
                  <span className="premium-pill px-4 py-2 text-sm font-medium text-foreground/76">
                    {title}
                  </span>
                  <span className="premium-pill px-4 py-2 text-sm font-medium text-foreground/76">
                    Open to meaningful opportunities
                  </span>
                </>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ContactMethod
                icon={<Mail className="h-5 w-5" />}
                label="Email"
                value={email ?? 'Available on request'}
                href={email ? `mailto:${email}` : undefined}
                description="Best for detailed opportunities, role context, and formal communication."
              />
              <ContactMethod
                icon={<Phone className="h-5 w-5" />}
                label="Phone"
                value={phone ?? 'Shared when relevant'}
                href={phone ? `tel:${phone}` : undefined}
                description="Useful for urgent calls, quick clarifications, or interview coordination."
              />
              <ContactMethod
                icon={<MapPin className="h-5 w-5" />}
                label="Location"
                value={location ?? 'Location available on request'}
                description="Open to discussions around local, regional, or remote opportunities."
              />
              <ContactMethod
                icon={<Clock3 className="h-5 w-5" />}
                label="Response Rhythm"
                value="Usually within 24 to 48 hours"
                description="Well-structured messages are easier to review and respond to promptly."
              />
            </div>
          </div>

          <div className="premium-panel p-5 sm:p-6">
            <div className="grid gap-5 sm:grid-cols-[170px_1fr] sm:items-start">
              <PortfolioImage
                src={profile?.profileImage?.publicUrl}
                alt={displayName}
                width={profile?.profileImage?.width ?? 520}
                height={profile?.profileImage?.height ?? 620}
                className="h-[220px] w-full rounded-[1.75rem] object-cover object-top sm:h-[240px]"
                sizes="(max-width: 640px) 100vw, 170px"
              />

              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">
                  Professional Contact
                </p>
                <p className="font-display text-2xl font-semibold text-foreground">
                  Connect directly for roles, projects, or professional conversations.
                </p>
                <div className="grid gap-3">
                  <div className="premium-outline rounded-[1.35rem] px-4 py-4 text-sm leading-6 text-foreground/72">
                    Resume links and direct contact options are available here for quick follow-up.
                  </div>
                  <div className="premium-outline rounded-[1.35rem] px-4 py-4 text-sm leading-6 text-foreground/72">
                    Reach out by email, phone, or the contact form depending on what is most convenient.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.92fr_1.08fr] xl:items-start">
          <div className="premium-panel px-5 py-5 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">
                  Highlights
                </p>
                <p className="max-w-2xl text-sm leading-7 text-foreground/72">
                  Resume access and professional links remain available here for quick reference.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/resume" className="gradient-button w-full sm:w-auto">
                  Open Resume
                  <FileText className="h-4 w-4" />
                </Link>
                {resume?.downloadUrl ? (
                  <a
                    href={resume.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ghost-button w-full sm:w-auto"
                  >
                    {getResumeDownloadLabel(resume.media)}
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </div>

            {socialLinks.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover-lift premium-pill inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground/78 transition hover:text-accent"
                  >
                    <Sparkles className="h-4 w-4 text-accent/82" />
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div className="premium-panel p-6">
            <div className="mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">
                  Contact Form
                </p>
                <h3 className="mt-3 font-display text-2xl font-semibold text-foreground">
                  Send a professional enquiry
                </h3>
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactMethod({
  icon,
  label,
  value,
  description,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
  href?: string;
}) {
  const body = (
    <div className="premium-panel hover-lift h-full px-5 py-5">
      <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.24em] text-foreground/55">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(37,99,235,0.16),rgba(45,212,191,0.18))] text-accent">
          {icon}
        </span>
        {label}
      </div>
      <p className="mt-4 font-medium text-foreground">{value}</p>
      <p className="mt-3 text-sm leading-7 text-foreground/68">{description}</p>
    </div>
  );

  if (!href) {
    return body;
  }

  return (
    <a href={href} className="block">
      {body}
    </a>
  );
}
