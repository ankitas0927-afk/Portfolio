import Link from 'next/link';

import type { NavigationItem, PublicProfile, SocialLink } from '@ankita-portfolio/shared-types';

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
  return (
    <footer className="border-t border-border/50 bg-card/55">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div className="space-y-4">
          <p className="font-display text-2xl font-semibold text-foreground">
            {profile?.fullName ?? 'Ankita Singh'}
          </p>
          <p className="max-w-xl text-sm leading-7 text-foreground/70">
            {footerText ??
              'A database-driven portfolio with public content, private data controls, and MongoDB GridFS media streaming.'}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-foreground/48">Navigation</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-foreground/72">
            {navigation.map((item) => (
              <Link key={item.id} href={item.href} className="transition hover:text-accent">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-foreground/48">Connect</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-foreground/72">
            {profile?.publicEmail ? <a href={`mailto:${profile.publicEmail}`}>{profile.publicEmail}</a> : null}
            {profile?.publicPhone ? <a href={`tel:${profile.publicPhone}`}>{profile.publicPhone}</a> : null}
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-accent"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
