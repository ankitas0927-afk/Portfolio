import type {
  AboutSection,
  CertificateRecord,
  EducationRecord,
  ExperienceRecord,
  HeroSection,
  InterestRecord,
  LanguageRecord,
  MediaReference,
  NavigationItem,
  ProjectRecord,
  PublicProfile,
  ResumeRecord,
  SkillCategoryRecord,
  SkillRecord,
  SocialLink,
  TrainingRecord,
} from '@ankita-portfolio/shared-types';

import {
  fallbackAbout,
  fallbackEducation,
  fallbackExperience,
  fallbackHero,
  fallbackLanguages,
  fallbackNavigation,
  fallbackPersonalSkills,
  fallbackProfile,
  fallbackProjects,
  fallbackResumeMedia,
  fallbackSeoSettings,
  fallbackSiteSettings,
  fallbackSkillCategories,
  fallbackSkillRecords,
  fallbackSocialLinks,
  fallbackTraining,
} from '../lib/cv-fallback';
import { webEnv } from '../lib/env';
import { resolvePrimaryNavigation } from '../lib/public-navigation';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

export type PublicSiteContext = {
  siteSettings: {
    siteName?: string;
    siteTagline?: string;
    accentColor?: string;
    secondaryAccentColor?: string;
    footerText?: string;
    logo?: MediaReference | null;
    favicon?: MediaReference | null;
    openGraphImage?: MediaReference | null;
  } | null;
  seoSettings: {
    defaultTitle?: string;
    defaultDescription?: string;
    defaultKeywords?: string[];
    defaultOpenGraphImage?: MediaReference | null;
  } | null;
};

export type PublicSkillsBundle = {
  categories: SkillCategoryRecord[];
  skills: SkillRecord[];
  personalSkills: Array<{
    id: string;
    title: string;
    description?: string;
    publicationStatus: string;
    displayOrder: number;
  }>;
};

export type PublicResumeBundle = ResumeRecord & {
  previewUrl: string;
  downloadUrl: string;
  media?: MediaReference | null;
};

const fallbackSkillsBundle: PublicSkillsBundle = {
  categories: fallbackSkillCategories,
  skills: fallbackSkillRecords,
  personalSkills: fallbackPersonalSkills,
};

const fallbackSiteContext: PublicSiteContext = {
  siteSettings: fallbackSiteSettings,
  seoSettings: fallbackSeoSettings,
};

const fallbackResume: PublicResumeBundle = {
  id: 'fallback-resume',
  title: 'Ankita Singh Resume',
  versionLabel: 'Bundled resume',
  mediaAssetId: fallbackResumeMedia.id,
  isActive: true,
  publicationStatus: 'published',
  createdAt: '2026-08-11T00:00:00.000Z',
  updatedAt: '2026-08-11T00:00:00.000Z',
  previewUrl: '/api/fallback/resume',
  downloadUrl: '/api/fallback/resume?download=1',
  media: fallbackResumeMedia,
};

async function fetchPublic<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${webEnv.apiBaseUrl}/public${path}`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ApiEnvelope<T>;
    return payload.data;
  } catch {
    return null;
  }
}

export async function getSiteContext() {
  return (await fetchPublic<PublicSiteContext>('/site-context')) ?? fallbackSiteContext;
}

export async function getNavigation() {
  return resolvePrimaryNavigation(
    (await fetchPublic<NavigationItem[]>('/navigation')) ?? fallbackNavigation,
  );
}

export async function getPublicProfile() {
  return (await fetchPublic<PublicProfile>('/profile')) ?? fallbackProfile;
}

export async function getPublicHero() {
  return (await fetchPublic<HeroSection>('/hero')) ?? fallbackHero;
}

export async function getPublicAbout() {
  return (await fetchPublic<AboutSection>('/about')) ?? fallbackAbout;
}

export async function getPublicExperience() {
  return (await fetchPublic<ExperienceRecord[]>('/experience')) ?? fallbackExperience;
}

export async function getPublicEducation() {
  return (await fetchPublic<EducationRecord[]>('/education')) ?? fallbackEducation;
}

export async function getPublicTraining() {
  return (await fetchPublic<TrainingRecord[]>('/training')) ?? fallbackTraining;
}

export async function getPublicSkills() {
  return (await fetchPublic<PublicSkillsBundle>('/skills')) ?? fallbackSkillsBundle;
}

export async function getPublicProjects(featured = false) {
  const endpoint = featured ? '/projects/featured' : '/projects';
  const projects = await fetchPublic<ProjectRecord[]>(endpoint);
  if (projects) {
    return projects;
  }

  return featured ? fallbackProjects.filter((project) => project.featured) : fallbackProjects;
}

export async function getPublicProject(slug: string) {
  return (
    (await fetchPublic<
      ProjectRecord & {
        galleryImages?: Array<{ publicUrl: string }>;
        supportingDocuments?: Array<{ publicUrl: string }>;
      }
    >(`/projects/${slug}`)) ??
    fallbackProjects.find((project) => project.slug === slug) ??
    null
  );
}

export async function getPublicLanguages() {
  return (await fetchPublic<LanguageRecord[]>('/languages')) ?? fallbackLanguages;
}

export async function getPublicInterests() {
  return (await fetchPublic<InterestRecord[]>('/interests')) ?? [];
}

export async function getPublicCertificates() {
  return (await fetchPublic<CertificateRecord[]>('/certificates')) ?? [];
}

export async function getPublicSocialLinks() {
  return (await fetchPublic<SocialLink[]>('/social-links')) ?? fallbackSocialLinks;
}

export async function getPublicResume() {
  return (await fetchPublic<PublicResumeBundle>('/resume')) ?? fallbackResume;
}

export async function getHomeBundle() {
  const [
    profile,
    hero,
    about,
    experience,
    education,
    training,
    skills,
    featuredProjects,
    languages,
    interests,
    resume,
    socialLinks,
  ] = await Promise.all([
    getPublicProfile(),
    getPublicHero(),
    getPublicAbout(),
    getPublicExperience(),
    getPublicEducation(),
    getPublicTraining(),
    getPublicSkills(),
    getPublicProjects(true),
    getPublicLanguages(),
    getPublicInterests(),
    getPublicResume(),
    getPublicSocialLinks(),
  ]);

  return {
    profile,
    hero,
    about,
    experience,
    education,
    training,
    skills,
    featuredProjects,
    languages,
    interests,
    resume,
    socialLinks,
  };
}
