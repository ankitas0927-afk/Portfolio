'use client';

import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/providers/auth-provider';
import { formatBytes, formatLabel } from '@/lib/utils';

type OverviewResponse = {
  publishedProjects: number;
  draftProjects: number;
  experienceRecords: number;
  educationRecords: number;
  trainingRecords: number;
  skills: number;
  resumeVersions: number;
  gridFsFileCount: number;
  mediaStorageUsage: number;
  contactMessages: number;
  unreadContactMessages: number;
  recentlyUpdatedContent: {
    profile?: { updatedAt?: string } | null;
    hero?: { updatedAt?: string } | null;
    about?: { updatedAt?: string } | null;
  };
  recentAdministratorActivity: Array<{
    id: string;
    action?: string;
    resourceType?: string;
    createdAt?: string;
    requestId?: string;
  }>;
};

const overviewCards: Array<{
  key: keyof OverviewResponse;
  label: string;
  formatValue?: (value: number) => string;
}> = [
  { key: 'publishedProjects', label: 'Published projects' },
  { key: 'draftProjects', label: 'Draft projects' },
  { key: 'experienceRecords', label: 'Experience records' },
  { key: 'educationRecords', label: 'Education records' },
  { key: 'trainingRecords', label: 'Training records' },
  { key: 'skills', label: 'Skills' },
  { key: 'resumeVersions', label: 'Resume versions' },
  { key: 'gridFsFileCount', label: 'Stored media files' },
  { key: 'mediaStorageUsage', label: 'Media storage used', formatValue: formatBytes },
  { key: 'contactMessages', label: 'Contact messages' },
  { key: 'unreadContactMessages', label: 'Unread messages' },
];

function formatDateTime(value?: string) {
  if (!value) {
    return 'Not updated yet';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Not updated yet';
  }

  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function DashboardOverview() {
  const { apiRequest } = useAuth();

  const query = useQuery({
    queryKey: ['admin-dashboard-overview'],
    queryFn: () => apiRequest<OverviewResponse>({ url: '/admin/dashboard/overview' }),
  });

  const data = query.data;

  return (
    <section className="space-y-8">
      <div className="premium-panel p-6">
        <h1 className="font-display text-3xl font-semibold">Dashboard Overview</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-foreground/70">
          This dashboard now reads live counts and recent activity from MongoDB for the admin
          panel, media library, resumes, contact messages, and published portfolio content.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => {
          const rawValue = typeof data?.[card.key] === 'number' ? (data[card.key] as number) : 0;
          const displayValue = card.formatValue ? card.formatValue(rawValue) : String(rawValue);

          return (
            <article
              key={card.key}
              className="metric-card"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-foreground/45">
                {card.label}
              </p>
              <p className="mt-3 font-display text-3xl font-semibold">{displayValue}</p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="section-card px-6 py-6">
          <h2 className="font-display text-2xl font-semibold">Recently Updated Content</h2>
          <div className="mt-6 space-y-4">
            <article className="metric-card">
              <p className="text-sm font-semibold">Profile</p>
              <p className="mt-2 text-sm text-foreground/68">
                {formatDateTime(data?.recentlyUpdatedContent.profile?.updatedAt)}
              </p>
            </article>
            <article className="metric-card">
              <p className="text-sm font-semibold">Hero</p>
              <p className="mt-2 text-sm text-foreground/68">
                {formatDateTime(data?.recentlyUpdatedContent.hero?.updatedAt)}
              </p>
            </article>
            <article className="metric-card">
              <p className="text-sm font-semibold">About</p>
              <p className="mt-2 text-sm text-foreground/68">
                {formatDateTime(data?.recentlyUpdatedContent.about?.updatedAt)}
              </p>
            </article>
          </div>
        </section>

        <section className="section-card px-6 py-6">
          <h2 className="font-display text-2xl font-semibold">Recent Administrator Activity</h2>
          <div className="mt-6 space-y-4">
            {(data?.recentAdministratorActivity ?? []).map((entry) => (
              <article
                key={entry.id}
                className="metric-card"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold">
                    {formatLabel(String(entry.action ?? 'unknown_action'))}
                  </p>
                  <p className="text-xs uppercase tracking-[0.22em] text-foreground/45">
                    {String(entry.resourceType ?? 'unknown')}
                  </p>
                </div>
                <p className="mt-2 text-sm text-foreground/68">
                  {formatDateTime(entry.createdAt)}
                </p>
                <p className="mt-1 text-xs text-foreground/50">{String(entry.requestId ?? '')}</p>
              </article>
            ))}

            {!query.isLoading && (data?.recentAdministratorActivity?.length ?? 0) === 0 ? (
              <article className="metric-card text-sm text-foreground/68">
                No administrator activity has been recorded yet.
              </article>
            ) : null}
          </div>
        </section>
      </div>
    </section>
  );
}
