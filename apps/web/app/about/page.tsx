import { BarChart3, BriefcaseBusiness, GraduationCap, MapPinned } from 'lucide-react';

import { SectionHeading } from '@/components/common/section-heading';
import { PortfolioImage } from '@/components/common/portfolio-image';
import { DEFAULT_SITE_DESCRIPTION, DEFAULT_SITE_NAME } from '@/lib/default-site-copy';
import { getTotalExperienceLabel } from '@/lib/experience';
import {
  getPublicAbout,
  getPublicEducation,
  getPublicExperience,
  getPublicProfile,
  getPublicProjects,
} from '@/services/public';

export const revalidate = 60;

export default async function AboutPage() {
  const [about, profile, experience, education, projects] = await Promise.all([
    getPublicAbout(),
    getPublicProfile(),
    getPublicExperience(),
    getPublicEducation(),
    getPublicProjects(),
  ]);

  const overallExperienceLabel = getTotalExperienceLabel(experience);
  const availabilityLabel = about?.availabilityLabel ?? getAvailabilityLabel(profile?.availability);
  const locationLabel = about?.currentLocation ?? profile?.generalLocation ?? 'Location available';

  const quickStats = [
    {
      title: 'Projects',
      value: String(projects.length).padStart(2, '0'),
      description: 'Published portfolio projects',
      icon: BarChart3,
    },
    {
      title: 'Experience',
      value: overallExperienceLabel ?? 'Early career',
      description: 'Professional experience so far',
      icon: BriefcaseBusiness,
    },
    {
      title: 'Availability',
      value: availabilityLabel,
      description: 'Current work opportunity status',
      icon: MapPinned,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="page-shell px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <SectionHeading
          eyebrow="About"
          title={profile?.professionalTitle ?? DEFAULT_SITE_NAME}
          description={
            about?.fullBiography ?? profile?.professionalSummary ?? DEFAULT_SITE_DESCRIPTION
          }
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            <PortfolioImage
              src={about?.aboutImage?.publicUrl ?? profile?.profileImage?.publicUrl}
              alt={profile?.fullName ?? `${DEFAULT_SITE_NAME} profile image`}
              width={about?.aboutImage?.width ?? profile?.profileImage?.width ?? 680}
              height={about?.aboutImage?.height ?? profile?.profileImage?.height ?? 800}
              className="section-card min-h-[420px] rounded-[2rem] object-cover object-top"
            />

            <div className="section-card px-5 py-5 sm:px-6">
              <div className="flex flex-wrap gap-3">
                {overallExperienceLabel ? (
                  <span className="info-chip">{overallExperienceLabel}</span>
                ) : null}
                <span className="info-chip">{locationLabel}</span>
                <span className="info-chip">{availabilityLabel}</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;

                return (
                  <article
                    key={stat.title}
                    className="metric-card hover-lift reveal-up min-h-[10.5rem] px-4 py-4"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(12,123,119,0.16),rgba(37,99,235,0.16))] text-accent dark:bg-[linear-gradient(135deg,rgba(56,189,248,0.16),rgba(45,212,191,0.16))]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-foreground/48">
                      {stat.title}
                    </p>
                    <p className="mt-2 text-lg font-semibold leading-7 text-foreground">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground/68">
                      {stat.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="section-card space-y-6 px-6 py-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/74">
                Key strengths
              </p>
              <p className="text-sm leading-7 text-foreground/68">
                Highlights below continue to load from the published database content.
              </p>
            </div>

            {about?.keyStrengths?.length ? (
              about.keyStrengths.map((strength: string, index: number) => (
                <div
                  key={strength}
                  className="metric-card hover-lift reveal-up text-sm"
                  style={{ animationDelay: `${120 + index * 80}ms` }}
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

        <div className="mt-14 border-t border-border/60 pt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="premium-pill inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-accent/82">
                <GraduationCap className="h-4 w-4" />
                Education
              </div>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-[2.4rem]">
                Academic background presented as a stronger professional timeline.
              </h2>
              <p className="text-sm leading-7 text-foreground/72 sm:text-base">
                Every education item below is fetched from the published database and displayed in
                sequence for a clearer, more polished profile story.
              </p>
            </div>

            <div className="premium-outline rounded-[1.35rem] px-4 py-3 text-sm leading-6 text-foreground/70">
              {education.length} education record{education.length === 1 ? '' : 's'} published
            </div>
          </div>

          <div className="mt-10 space-y-5">
            {education.length > 0 ? (
              education.map((item, index) => (
                <article
                  key={item.id}
                  className="section-card hover-lift reveal-up overflow-hidden px-6 py-6"
                  style={{ animationDelay: `${180 + index * 90}ms` }}
                >
                  <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-start">
                    <div className="flex items-center gap-4 lg:block">
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-[linear-gradient(135deg,rgba(12,123,119,0.18),rgba(37,99,235,0.16))] font-display text-lg font-semibold text-accent shadow-[0_18px_36px_-24px_rgba(37,99,235,0.55)] dark:bg-[linear-gradient(135deg,rgba(56,189,248,0.16),rgba(45,212,191,0.16))]">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/70">
                            {[item.startDate, item.completionDate].filter(Boolean).join(' - ') ||
                              'Academic record'}
                          </p>
                          <h3 className="font-display text-2xl font-semibold text-foreground">
                            {item.qualification}
                          </h3>
                          <p className="text-sm font-medium text-foreground/72">
                            {item.institution}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 lg:max-w-[18rem] lg:justify-end">
                          {item.fieldOfStudy ? (
                            <span className="info-chip">{item.fieldOfStudy}</span>
                          ) : null}
                          {item.grade ? <span className="info-chip">Grade: {item.grade}</span> : null}
                          {item.percentage ? (
                            <span className="info-chip">Score: {item.percentage}</span>
                          ) : null}
                          {item.location ? <span className="info-chip">{item.location}</span> : null}
                        </div>
                      </div>

                      {item.description ? (
                        <p className="text-sm leading-7 text-foreground/72">{item.description}</p>
                      ) : null}

                      {item.subjects.length > 0 ? (
                        <div className="space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/48">
                            Key subjects
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.subjects.map((subject) => (
                              <span key={subject} className="info-chip text-xs">
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {item.academicAchievements.length > 0 ? (
                        <div className="space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground/48">
                            Academic highlights
                          </p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {item.academicAchievements.map((achievement) => (
                              <div key={achievement} className="metric-card text-sm">
                                {achievement}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="section-card px-6 py-6 text-sm leading-7 text-foreground/70">
                Published education details will appear here once they are available in the
                database.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getAvailabilityLabel(availability?: string) {
  switch (availability) {
    case 'open_to_work':
      return 'Available for work';
    case 'selective':
      return 'Open to selective roles';
    case 'not_available':
      return 'Currently not available';
    default:
      return 'Open to opportunities';
  }
}
