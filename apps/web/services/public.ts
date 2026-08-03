import type {
  AboutSection,
  CertificateRecord,
  EducationRecord,
  ExperienceRecord,
  HeroSection,
  InterestRecord,
  LanguageRecord,
  NavigationItem,
  ProjectRecord,
  PublicProfile,
  ResumeRecord,
  SkillCategoryRecord,
  SkillRecord,
  SocialLink,
  TrainingRecord,
} from '@ankita-portfolio/shared-types';

import { webEnv } from '../lib/env';

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
    logo?: { publicUrl: string; altText?: string; width?: number; height?: number } | null;
    favicon?: { publicUrl: string } | null;
    openGraphImage?: { publicUrl: string } | null;
  } | null;
  seoSettings: {
    defaultTitle?: string;
    defaultDescription?: string;
    defaultKeywords?: string[];
    defaultOpenGraphImage?: { publicUrl: string } | null;
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
  media?: { publicUrl: string } | null;
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
  return fetchPublic<PublicSiteContext>('/site-context');
}

export async function getNavigation() {
  return (await fetchPublic<NavigationItem[]>('/navigation')) ?? [];
}

export async function getPublicProfile() {
  return fetchPublic<PublicProfile>('/profile');
}

export async function getPublicHero() {
  return fetchPublic<HeroSection>('/hero');
}

export async function getPublicAbout() {
  return fetchPublic<AboutSection>('/about');
}

export async function getPublicExperience() {
  return (await fetchPublic<ExperienceRecord[]>('/experience')) ?? [];
}

export async function getPublicEducation() {
  return (await fetchPublic<EducationRecord[]>('/education')) ?? [];
}

export async function getPublicTraining() {
  return (await fetchPublic<TrainingRecord[]>('/training')) ?? [];
}

export async function getPublicSkills() {
  return (
    (await fetchPublic<PublicSkillsBundle>('/skills')) ?? {
      categories: [],
      skills: [],
      personalSkills: [],
    }
  );
}

export async function getPublicProjects(featured = false) {
  const endpoint = featured ? '/projects/featured' : '/projects';
  return (await fetchPublic<ProjectRecord[]>(endpoint)) ?? [];
}

export async function getPublicProject(slug: string) {
  return fetchPublic<ProjectRecord & { galleryImages?: Array<{ publicUrl: string }>; supportingDocuments?: Array<{ publicUrl: string }> }>(
    `/projects/${slug}`,
  );
}

export async function getPublicLanguages() {
  return (await fetchPublic<LanguageRecord[]>('/languages')) ?? [];
}

export async function getPublicInterests() {
  return (await fetchPublic<InterestRecord[]>('/interests')) ?? [];
}

export async function getPublicCertificates() {
  return (await fetchPublic<CertificateRecord[]>('/certificates')) ?? [];
}

export async function getPublicSocialLinks() {
  return (await fetchPublic<SocialLink[]>('/social-links')) ?? [];
}

export async function getPublicResume() {
  return fetchPublic<PublicResumeBundle>('/resume');
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
