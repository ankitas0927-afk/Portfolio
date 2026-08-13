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
import { unstable_cache } from 'next/cache';
import { cache } from 'react';

import { webEnv } from '../lib/env';
import { resolvePrimaryNavigation } from '../lib/public-navigation';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

const PUBLIC_CONTENT_REVALIDATE_SECONDS = 60;

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

const emptySkillsBundle: PublicSkillsBundle = {
  categories: [],
  skills: [],
  personalSkills: [],
};

function canUseEmbeddedApiRuntime() {
  return [
    'MONGODB_URI',
    'FRONTEND_URL',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'ADMIN_NAME',
    'ADMIN_EMAIL',
    'ADMIN_INITIAL_PASSWORD',
    'RESUME_PDF_PATH',
  ].every((key) => Boolean(process.env[key]?.trim()));
}

const readFromEmbeddedApi = unstable_cache(async (path: string): Promise<unknown | null> => {
  try {
    if (!canUseEmbeddedApiRuntime()) {
      return null;
    }

    const [{ connectToDatabase }, publicService] = await Promise.all([
      import('@ankita-portfolio/api/database/mongoose'),
      import('@ankita-portfolio/api/services/public.service'),
    ]);

    await connectToDatabase();

    const serverLoaders: Record<string, () => Promise<unknown>> = {
      '/site-context': () => publicService.getPublicSiteContext(),
      '/navigation': () => publicService.getPublicNavigation(),
      '/profile': () => publicService.getPublicProfile(),
      '/hero': () => publicService.getPublicHero(),
      '/about': () => publicService.getPublicAbout(),
      '/experience': () => publicService.getPublicExperience(),
      '/education': () => publicService.getPublicEducation(),
      '/training': () => publicService.getPublicTraining(),
      '/skills': () => publicService.getPublicSkills(),
      '/projects': () => publicService.getPublicProjects(),
      '/projects/featured': () => publicService.getPublicProjects(true),
      '/languages': () => publicService.getPublicLanguages(),
      '/interests': () => publicService.getPublicInterests(),
      '/certificates': () => publicService.getPublicCertificates(),
      '/social-links': () => publicService.getPublicSocialLinks(),
      '/resume': () => publicService.getPublicResume(),
    };

    const directLoader =
      path.startsWith('/projects/') && path !== '/projects/featured'
        ? () => publicService.getPublicProjectBySlug(path.replace('/projects/', ''))
        : serverLoaders[path];

    if (!directLoader) {
      return null;
    }

    return await directLoader();
  } catch {
    return null;
  }
}, ['public-embedded-content'], {
  revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS,
});

async function fetchPublic<T>(path: string): Promise<T | null> {
  if (typeof window === 'undefined') {
    const embeddedResult = await readFromEmbeddedApi(path);
    if (embeddedResult !== null) {
      return embeddedResult as T;
    }
  }

  try {
    const response = await fetch(`${webEnv.apiBaseUrl}/public${path}`, {
      next: { revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS },
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

export const getSiteContext = cache(async () => {
  return (
    (await fetchPublic<PublicSiteContext>('/site-context')) ?? {
      siteSettings: null,
      seoSettings: null,
    }
  );
});

export const getNavigation = cache(async () => {
  return resolvePrimaryNavigation((await fetchPublic<NavigationItem[]>('/navigation')) ?? []);
});

export const getPublicProfile = cache(async () => {
  return await fetchPublic<PublicProfile>('/profile');
});

export const getPublicHero = cache(async () => {
  return await fetchPublic<HeroSection>('/hero');
});

export const getPublicAbout = cache(async () => {
  return await fetchPublic<AboutSection>('/about');
});

export const getPublicExperience = cache(async () => {
  return (await fetchPublic<ExperienceRecord[]>('/experience')) ?? [];
});

export const getPublicEducation = cache(async () => {
  return (await fetchPublic<EducationRecord[]>('/education')) ?? [];
});

export const getPublicTraining = cache(async () => {
  return (await fetchPublic<TrainingRecord[]>('/training')) ?? [];
});

export const getPublicSkills = cache(async () => {
  return (await fetchPublic<PublicSkillsBundle>('/skills')) ?? emptySkillsBundle;
});

export const getPublicProjects = cache(async (featured = false) => {
  const endpoint = featured ? '/projects/featured' : '/projects';
  return (await fetchPublic<ProjectRecord[]>(endpoint)) ?? [];
});

export const getPublicProject = cache(async (slug: string) => {
  return await fetchPublic<
    ProjectRecord & {
      galleryImages?: Array<{ publicUrl: string }>;
      supportingDocuments?: Array<{ publicUrl: string }>;
    }
  >(`/projects/${slug}`);
});

export const getPublicLanguages = cache(async () => {
  return (await fetchPublic<LanguageRecord[]>('/languages')) ?? [];
});

export const getPublicInterests = cache(async () => {
  return (await fetchPublic<InterestRecord[]>('/interests')) ?? [];
});

export const getPublicCertificates = cache(async () => {
  return (await fetchPublic<CertificateRecord[]>('/certificates')) ?? [];
});

export const getPublicSocialLinks = cache(async () => {
  return (await fetchPublic<SocialLink[]>('/social-links')) ?? [];
});

export const getPublicResume = cache(async () => {
  return await fetchPublic<PublicResumeBundle>('/resume');
});

export const getHomeBundle = cache(async () => {
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
});
