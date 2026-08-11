import Link from 'next/link';
import { ArrowUpRight, FileText, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

import type { NavigationItem, PublicProfile, SocialLink } from '@ankita-portfolio/shared-types';
import {
  DEFAULT_LOCATION,
  DEFAULT_SITE_NAME,
  DEFAULT_SITE_TAGLINE,
} from '@/lib/default-site-copy';

export function SiteFooter({
  profile,
  navigation,
  socialLinks,
  footerText,
}: {
  profile: PublicProfile | null;
  navigation: NavigationItem[];
  socialLinks: SocialLink[];
  footerText?: string | null;
}) {
  const displayName = profile?.fullName ?? DEFAULT_SITE_NAME;
  const title = profile?.professionalTitle ?? DEFAULT_SITE_TAGLINE;
  const email = profile?.publicEmail ?? null;
  const phone = profile?.publicPhone ?? null;
  const location = profile?.generalLocation ?? DEFAULT_LOCATION;
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border/50">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--accent),transparent)]" />
      <div className="pointer-events-none absolute left-10 top-12 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.18),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.18),transparent_70%)] blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="premium-panel px-6 py-8 sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="space-y-6">
              <div className="premium-pill inline-flex items-center gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-accent/85">
                <span className="ambient-dot h-2.5 w-2.5 rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))]" />
                Professional Contact
              </div>

              <div className="space-y-4">
                <p className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {displayName}
                </p>
                <p className="max-w-2xl text-base leading-8 text-foreground/72">
                  {footerText ??
                    `${title} with a portfolio designed for clarity, trust, and meaningful professional conversations.`}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <ContactStat
                  label="Email"
                  value={email ?? 'Available on request'}
                  href={email ? `mailto:${email}` : undefined}
                  icon={<Mail className="h-4 w-4" />}
                />
                <ContactStat
                  label="Phone"
                  value={phone ?? 'Shared when relevant'}
                  href={phone ? `tel:${phone}` : undefined}
                  icon={<Phone className="h-4 w-4" />}
                />
                <ContactStat
                  label="Location"
                  value={location ?? 'Location available on request'}
                  icon={<MapPin className="h-4 w-4" />}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="hover-lift inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] px-6 py-3 text-sm font-semibold text-white shadow-soft"
                >
                  Contact
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/resume"
                  className="hover-lift premium-pill inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-foreground/82"
                >
                  View Resume
                  <FileText className="h-4 w-4" />
                </Link>
                <Link
                  href="/admin/login"
                  className="hover-lift premium-pill inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-foreground/82"
                >
                  Admin Login
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="premium-outline rounded-[1.75rem] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-foreground/52">
                  Navigation
                </p>
                <div className="mt-5 grid gap-3 text-sm text-foreground/74">
                  {navigation.length > 0 ? (
                    navigation.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="hover-lift inline-flex items-center justify-between rounded-2xl border border-border/50 bg-background/45 px-4 py-3 transition hover:border-accent/40 hover:text-accent"
                      >
                        <span>{item.label}</span>
                        <ArrowUpRight className="h-4 w-4 opacity-60" />
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-border/60 bg-background/40 px-4 py-4 text-sm leading-7 text-foreground/62">
                      Published navigation links will appear here once they are available in the database.
                    </div>
                  )}
                </div>
              </div>

              <div className="premium-outline rounded-[1.75rem] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-foreground/52">
                  Connect
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {socialLinks.length > 0 ? (
                    socialLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover-lift premium-pill inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground/78 transition hover:text-accent"
                      >
                        <Sparkles className="h-4 w-4 text-accent/80" />
                        {link.label}
                      </a>
                    ))
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-border/60 bg-background/40 px-4 py-4 text-sm leading-7 text-foreground/62">
                      Professional links will appear here soon.
                    </div>
                  )}
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-border/50 bg-background/45 p-4 text-sm leading-7 text-foreground/68">
                  Clear presentation, thoughtful detail, and approachable contact options shape
                  every page of this portfolio.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 text-sm text-foreground/58 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {displayName}. Built as a modern, media-driven professional portfolio.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 transition hover:text-accent"
            >
              Admin Login
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <a
              href="#main-content"
              className="inline-flex items-center gap-2 transition hover:text-accent"
            >
              Back to top
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ContactStat({
  label,
  value,
  href,
  icon,
}: {
  label: string;
  value: string;
  href?: string;
  icon: ReactNode;
}) {
  const content = (
    <div className="premium-outline hover-lift h-full rounded-[1.5rem] px-4 py-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-foreground/48">
        <span className="text-accent/85">{icon}</span>
        {label}
      </div>
      <p className="mt-3 text-sm leading-7 text-foreground/78">{value}</p>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <a href={href} className="block">
      {content}
    </a>
  );
}
