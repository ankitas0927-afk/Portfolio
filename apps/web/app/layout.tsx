import type { Metadata } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import {
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_NAME,
  DEFAULT_SITE_TAGLINE,
} from '@/lib/default-site-copy';
import { AppProviders } from '@/providers/app-providers';
import {
  getNavigation,
  getPublicProfile,
  getPublicSocialLinks,
  getSiteContext,
} from '@/services/public';
import '@/app/globals.css';

const fontSans = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontDisplay = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
});

export async function generateMetadata(): Promise<Metadata> {
  const [siteContext, profile] = await Promise.all([getSiteContext(), getPublicProfile()]);

  const siteName = siteContext?.siteSettings?.siteName ?? profile?.fullName ?? DEFAULT_SITE_NAME;
  const title = siteContext?.seoSettings?.defaultTitle ?? `${siteName} Portfolio`;
  const description =
    siteContext?.seoSettings?.defaultDescription ?? profile?.professionalSummary ?? DEFAULT_SITE_DESCRIPTION;
  const iconUrl =
    siteContext?.siteSettings?.favicon?.publicUrl ?? siteContext?.siteSettings?.logo?.publicUrl;
  const openGraphImageUrl =
    siteContext?.seoSettings?.defaultOpenGraphImage?.publicUrl ??
    siteContext?.siteSettings?.openGraphImage?.publicUrl ??
    siteContext?.siteSettings?.logo?.publicUrl;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    applicationName: siteName,
    title,
    description,
    icons: iconUrl
      ? {
          icon: [{ url: iconUrl }],
          shortcut: [{ url: iconUrl }],
          apple: [{ url: iconUrl }],
        }
      : undefined,
    openGraph: {
      title,
      description,
      images: openGraphImageUrl ? [openGraphImageUrl] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: openGraphImageUrl ? [openGraphImageUrl] : [],
    },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [siteContext, navigation, profile, socialLinks] = await Promise.all([
    getSiteContext(),
    getNavigation(),
    getPublicProfile(),
    getPublicSocialLinks(),
  ]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontDisplay.variable} font-sans antialiased`}>
        <AppProviders>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:text-sm"
          >
            Skip to content
          </a>
          <SiteHeader
            navigation={navigation}
            logo={siteContext?.siteSettings?.logo ?? null}
            siteName={siteContext?.siteSettings?.siteName ?? profile?.fullName ?? DEFAULT_SITE_NAME}
            siteTagline={
              siteContext?.siteSettings?.siteTagline ??
              profile?.professionalTitle ??
              DEFAULT_SITE_TAGLINE
            }
          />
          <main id="main-content">{children}</main>
          <SiteFooter
            profile={profile}
            navigation={navigation}
            socialLinks={socialLinks}
            footerText={siteContext?.siteSettings?.footerText}
          />
        </AppProviders>
      </body>
    </html>
  );
}
