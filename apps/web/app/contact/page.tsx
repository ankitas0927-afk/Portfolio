import Link from 'next/link';
import {
  ArrowUpRight,
  Clock3,
  FileText,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Sparkles,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { PortfolioImage } from '@/components/common/portfolio-image';
import { SectionHeading } from '@/components/common/section-heading';
import { ContactForm } from '@/components/forms/contact-form';
import {
  DEFAULT_LOCATION,
  DEFAULT_SITE_DESCRIPTION,
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
  const introduction = profile?.professionalSummary ?? DEFAULT_SITE_DESCRIPTION;
  const profileTags = (profile?.rotatingTitles ?? []).slice(0, 4);
  const overallExperienceLabel = getTotalExperienceLabel(experience);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <section className="relative overflow-hidden rounded-[2.4rem] border border-border/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.82),rgba(236,245,255,0.66))] px-6 py-10 shadow-soft dark:bg-[linear-gradient(135deg,rgba(11,21,36,0.88),rgba(9,19,33,0.78))] sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute -left-16 top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.2),transparent_72%)] blur-3xl" />
        <div className="pointer-events-none absolute -right-12 bottom-8 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.22),transparent_72%)] blur-3xl" />

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-8">
            <SectionHeading
              eyebrow="Contact"
              title="Get in touch for professional opportunities."
              description={introduction}
            />

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

            <div className="premium-panel px-5 py-5">
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
                  <Link
                    href="/resume"
                    className="hover-lift inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] px-5 py-3 text-sm font-semibold text-white shadow-soft"
                  >
                    Open Resume
                    <FileText className="h-4 w-4" />
                  </Link>
                  {resume?.downloadUrl ? (
                    <a
                      href={resume.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover-lift premium-pill inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-foreground/82"
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
          </div>

          <div className="grid gap-6">
            <div className="premium-panel p-5">
              <div className="grid gap-5 sm:grid-cols-[0.9fr_1.1fr] sm:items-center">
                <PortfolioImage
                  src={profile?.profileImage?.publicUrl}
                  alt={displayName}
                  width={profile?.profileImage?.width ?? 520}
                  height={profile?.profileImage?.height ?? 620}
                  className="h-[260px] w-full rounded-[1.75rem] object-cover object-top"
                  sizes="(max-width: 640px) 100vw, 18rem"
                />

                <div className="space-y-4">
                  <div className="premium-pill inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-accent/82">
                    <MessageSquareText className="h-4 w-4" />
                    Professional Outreach
                  </div>
                  <p className="font-display text-2xl font-semibold text-foreground">
                    A clear message leads to a stronger conversation.
                  </p>
                  <ul className="space-y-3 text-sm leading-7 text-foreground/72">
                    <li>Share the role, organization, or project you would like to discuss.</li>
                    <li>Include timing, expectations, or relevant context where helpful.</li>
                    <li>
                      Mention the most useful next step, such as a reply, call, or document review.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="premium-panel p-6">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent/80">
                    Contact Form
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-foreground">
                    Send a professional enquiry
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-7 text-foreground/72">
                    Use the form below to introduce yourself, share context, and outline the purpose
                    of your message.
                  </p>
                </div>

                <div className="premium-outline rounded-[1.35rem] px-4 py-3 text-sm leading-6 text-foreground/70">
                  A clear subject line and concise summary help keep communication efficient.
                </div>
              </div>

              <ContactForm />
            </div>
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
