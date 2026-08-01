import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { fetchPortfolio } from "@/services/portfolio";
import { env } from "@/lib/env";
import { mediaStreamUrl } from "@/lib/media";

export async function generateMetadata(): Promise<Metadata> {
  const portfolio = await fetchPortfolio();
  const profile = portfolio?.profile;
  const siteTitle = profile ? `${profile.name} | ${profile.rotatingTitles?.[0] || "Research Analyst"}` : "Ankita Singh";
  const description =
    profile?.professionalSummary ||
    "Professional portfolio for Ankita Singh, a pharmacy graduate and Research Analyst focused on pharmaceutical research and quality work.";
  const iconAsset = profile?.favicon || profile?.logo || profile?.profileImage;
  const iconUrl = iconAsset?.id ? mediaStreamUrl(iconAsset.id) : undefined;
  const imageUrl = profile?.openGraphImage?.id
    ? mediaStreamUrl(profile.openGraphImage.id)
    : profile?.profileImage?.id
      ? mediaStreamUrl(profile.profileImage.id)
      : undefined;
  const openGraph: NonNullable<Metadata["openGraph"]> = {
    title: siteTitle,
    description,
    url: env.NEXT_PUBLIC_SITE_URL,
    type: "website"
  };
  if (imageUrl) {
    openGraph.images = [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: profile?.name || "Ankita Singh"
      }
    ];
  }
  const twitter: NonNullable<Metadata["twitter"]> = {
    card: "summary_large_image",
    title: siteTitle,
    description
  };
  if (imageUrl) {
    twitter.images = [imageUrl];
  }

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    title: {
      default: siteTitle,
      template: `%s | ${profile?.name || "Ankita Singh"}`
    },
    description,
    alternates: {
      canonical: env.NEXT_PUBLIC_SITE_URL
    },
    openGraph,
    twitter,
    icons: iconUrl
      ? {
          icon: [{ url: iconUrl }],
          apple: [{ url: iconUrl }]
        }
      : {
          icon: "/icon.svg",
          apple: "/apple-icon.svg"
        }
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const portfolio = await fetchPortfolio();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-mist text-ink antialiased dark:bg-slate-950 dark:text-white">
        <AppProviders>
          <Header profile={portfolio?.profile ?? null} />
          <main id="main">{children}</main>
          <Footer brandName={portfolio?.profile?.name || "Ankita Singh"} profile={portfolio?.profile ?? null} footer={portfolio?.footer ?? null} />
        </AppProviders>
      </body>
    </html>
  );
}
