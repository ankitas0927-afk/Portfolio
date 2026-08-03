import type { Metadata } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { AppProviders } from '@/providers/app-providers';
import { getNavigation, getPublicProfile, getPublicSocialLinks, getSiteContext } from '@/services/public';
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

  const title = siteContext?.seoSettings?.defaultTitle ?? `${profile?.fullName ?? 'Ankita Singh'} Portfolio`;
  const description =
    siteContext?.seoSettings?.defaultDescription ??
    profile?.professionalSummary ??
    'Database-driven personal portfolio built with Next.js and MongoDB GridFS.';

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title,
    description,
    openGraph: {
      title,
      description,
      images: siteContext?.seoSettings?.defaultOpenGraphImage?.publicUrl
        ? [siteContext.seoSettings.defaultOpenGraphImage.publicUrl]
        : [],
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
            siteName={siteContext?.siteSettings?.siteName ?? 'Ankita Singh'}
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
