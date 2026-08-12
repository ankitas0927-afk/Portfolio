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
import { unstable_noStore as noStore } from 'next/cache';

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

async function readFromEmbeddedApi<T>(path: string) {
  noStore();

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

    return (await directLoader()) as T;
  } catch {
    return null;
  }
}

async function fetchPublic<T>(path: string): Promise<T | null> {
  if (typeof window === 'undefined') {
    const embeddedResult = await readFromEmbeddedApi<T>(path);
    if (embeddedResult !== null) {
      return embeddedResult;
    }
  }

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
  return (
    (await fetchPublic<PublicSiteContext>('/site-context')) ?? {
      siteSettings: null,
      seoSettings: null,
    }
  );
}

export async function getNavigation() {
  return resolvePrimaryNavigation((await fetchPublic<NavigationItem[]>('/navigation')) ?? []);
}

export async function getPublicProfile() {
  return await fetchPublic<PublicProfile>('/profile');
}

export async function getPublicHero() {
  return await fetchPublic<HeroSection>('/hero');
}

export async function getPublicAbout() {
  return await fetchPublic<AboutSection>('/about');
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
  return (await fetchPublic<PublicSkillsBundle>('/skills')) ?? emptySkillsBundle;
}

export async function getPublicProjects(featured = false) {
  const endpoint = featured ? '/projects/featured' : '/projects';
  return (await fetchPublic<ProjectRecord[]>(endpoint)) ?? [];
}

export async function getPublicProject(slug: string) {
  return await fetchPublic<
    ProjectRecord & {
      galleryImages?: Array<{ publicUrl: string }>;
      supportingDocuments?: Array<{ publicUrl: string }>;
    }
  >(`/projects/${slug}`);
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
  return await fetchPublic<PublicResumeBundle>('/resume');
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
