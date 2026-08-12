import { SectionHeading } from '@/components/common/section-heading';
import { PortfolioImage } from '@/components/common/portfolio-image';
import { DEFAULT_SITE_DESCRIPTION, DEFAULT_SITE_NAME } from '@/lib/default-site-copy';
import { getPublicAbout, getPublicProfile } from '@/services/public';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const [about, profile] = await Promise.all([getPublicAbout(), getPublicProfile()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="page-shell px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
      <SectionHeading
        eyebrow="About"
        title={profile?.professionalTitle ?? DEFAULT_SITE_NAME}
        description={about?.fullBiography ?? profile?.professionalSummary ?? DEFAULT_SITE_DESCRIPTION}
      />
      <div className="mt-12 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <PortfolioImage
          src={about?.aboutImage?.publicUrl ?? profile?.profileImage?.publicUrl}
          alt={profile?.fullName ?? `${DEFAULT_SITE_NAME} profile image`}
          width={about?.aboutImage?.width ?? profile?.profileImage?.width ?? 680}
          height={about?.aboutImage?.height ?? profile?.profileImage?.height ?? 800}
          className="section-card min-h-[420px] rounded-[2rem] object-cover object-top"
        />
        <div className="section-card space-y-6 px-6 py-6">
          <div className="flex flex-wrap gap-3">
            <span className="info-chip">{about?.currentLocation ?? profile?.generalLocation ?? 'Location available'}</span>
            <span className="info-chip">{about?.availabilityLabel ?? 'Open to opportunities'}</span>
          </div>
          {about?.keyStrengths?.length ? (
            about.keyStrengths.map((strength: string) => (
              <div
                key={strength}
                className="metric-card text-sm"
              >
                {strength}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border/60 bg-background/70 px-4 py-4 text-sm text-foreground/68">
              About details will appear here once the public profile is available in the database.
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
