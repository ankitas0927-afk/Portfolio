'use client';

import { collectionFields, singletonFields } from '@/lib/admin-config';
import { formatLabel } from '@/lib/utils';
import { CollectionManager } from '@/components/admin/collection-manager';
import { SingletonEditor } from '@/components/admin/singleton-editor';
import { SkillsManager } from '@/components/admin/skills-manager';
import { MediaLibrary } from '@/components/admin/media-library';
import { ResumeManager } from '@/components/admin/resume-manager';
import { ContactManager } from '@/components/admin/contact-manager';
import { AuditLogList } from '@/components/admin/audit-log-list';
import { AccountManager } from '@/components/admin/account-manager';
import { DashboardOverview } from '@/components/admin/dashboard-overview';
import { ExperienceManager } from '@/components/admin/experience-manager';

export function AdminSectionPage({ section = 'overview' }: { section?: string }) {
  if (section === 'overview') {
    return <DashboardOverview />;
  }

  if (section === 'profile') {
    return (
      <div className="space-y-8">
        <SingletonEditor title="Public Profile" endpoint="profile" fields={singletonFields.profile} />
        <SingletonEditor
          title="Private Personal Details"
          endpoint="private-details"
          fields={singletonFields.privateDetails}
        />
      </div>
    );
  }

  if (section === 'hero') {
    return <SingletonEditor title="Hero Section" endpoint="hero" fields={singletonFields.hero} />;
  }

  if (section === 'about') {
    return <SingletonEditor title="About Section" endpoint="about" fields={singletonFields.about} />;
  }

  if (section === 'experience') {
    return <ExperienceManager />;
  }

  if (section === 'education' || section === 'training') {
    return (
      <CollectionManager
        title={formatLabel(section)}
        endpoint={section}
        fields={collectionFields[section]}
      />
    );
  }

  if (section === 'skills') {
    return <SkillsManager />;
  }

  if (section === 'projects') {
    return <CollectionManager title="Projects" endpoint="projects" fields={collectionFields.projects} />;
  }

  if (section === 'languages') {
    return <CollectionManager title="Languages" endpoint="languages" fields={collectionFields.languages} />;
  }

  if (section === 'interests') {
    return <CollectionManager title="Interests" endpoint="interests" fields={collectionFields.interests} />;
  }

  if (section === 'resumes') {
    return <ResumeManager />;
  }

  if (section === 'media') {
    return <MediaLibrary />;
  }

  if (section === 'contact-messages') {
    return <ContactManager />;
  }

  if (section === 'social-links') {
    return (
      <CollectionManager title="Social Links" endpoint="socialLinks" fields={collectionFields.socialLinks} />
    );
  }

  if (section === 'navigation') {
    return <CollectionManager title="Navigation" endpoint="navigation" fields={collectionFields.navigation} />;
  }

  if (section === 'seo') {
    return <SingletonEditor title="SEO Defaults" endpoint="seo" fields={singletonFields.seo} />;
  }

  if (section === 'site-settings') {
    return (
      <SingletonEditor
        title="Site Settings"
        endpoint="siteSettings"
        fields={singletonFields.siteSettings}
      />
    );
  }

  if (section === 'audit-logs') {
    return <AuditLogList />;
  }

  if (section === 'account') {
    return <AccountManager />;
  }

  return (
    <section className="rounded-[2rem] border border-border/60 bg-card/75 p-6 shadow-soft">
      <h1 className="font-display text-3xl font-semibold">{formatLabel(section)}</h1>
      <p className="mt-3 text-sm text-foreground/70">
        This section is reserved for future enhancements in the dashboard.
      </p>
    </section>
  );
}
