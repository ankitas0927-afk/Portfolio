import { SectionHeading } from '@/components/common/section-heading';
import { PortfolioImage } from '@/components/common/portfolio-image';
import { cvFallback } from '@/lib/cv-fallback';
import { getPublicAbout, getPublicProfile } from '@/services/public';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const [about, profile] = await Promise.all([getPublicAbout(), getPublicProfile()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading
        eyebrow="About"
        title={profile?.professionalTitle ?? cvFallback.professionalTitle}
        description={about?.fullBiography ?? profile?.professionalSummary ?? cvFallback.biography}
      />
      <div className="mt-12 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <PortfolioImage
          src={about?.aboutImage?.publicUrl ?? profile?.profileImage?.publicUrl}
          alt={profile?.fullName ?? `${cvFallback.fullName} profile image`}
          width={about?.aboutImage?.width ?? profile?.profileImage?.width ?? 680}
          height={about?.aboutImage?.height ?? profile?.profileImage?.height ?? 800}
          className="min-h-[420px] rounded-[2rem]"
        />
        <div className="space-y-6 rounded-[2rem] border border-border/60 bg-card/75 p-6 shadow-soft">
          {(about?.keyStrengths?.length ? about.keyStrengths : cvFallback.strengths).map(
            (strength: string) => (
              <div
                key={strength}
                className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm"
              >
                {strength}
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
