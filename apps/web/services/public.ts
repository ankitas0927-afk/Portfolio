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

import { webEnv } from '../lib/env';
import {
  fallbackAbout,
  fallbackEducation,
  fallbackExperience,
  fallbackHero,
  fallbackLanguages,
  fallbackProfile,
  fallbackProjects,
  fallbackTraining,
} from '../lib/cv-fallback';
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

const fallbackSkills: PublicSkillsBundle = {
  categories: [
    {
      id: 'fallback-skill-office',
      name: 'Office and productivity',
      displayOrder: 0,
      publicationStatus: 'published',
    },
    {
      id: 'fallback-skill-database',
      name: 'Database',
      displayOrder: 1,
      publicationStatus: 'published',
    },
    {
      id: 'fallback-skill-analysis',
      name: 'Data analysis',
      displayOrder: 2,
      publicationStatus: 'published',
    },
    {
      id: 'fallback-skill-science',
      name: 'Bioinformatics and scientific research',
      displayOrder: 3,
      publicationStatus: 'published',
    },
    {
      id: 'fallback-skill-pharma',
      name: 'Pharmaceutical and scientific software',
      displayOrder: 4,
      publicationStatus: 'published',
    },
  ],
  skills: [
    {
      id: 'fallback-ms-office',
      name: 'Microsoft Office',
      categoryId: 'fallback-skill-office',
      featured: true,
      publicationStatus: 'published',
      displayOrder: 0,
    },
    {
      id: 'fallback-mysql',
      name: 'MySQL',
      categoryId: 'fallback-skill-database',
      featured: true,
      publicationStatus: 'published',
      displayOrder: 1,
    },
    {
      id: 'fallback-spss',
      name: 'SPSS',
      categoryId: 'fallback-skill-analysis',
      featured: true,
      publicationStatus: 'published',
      displayOrder: 2,
    },
    {
      id: 'fallback-nvivo',
      name: 'NVivo',
      categoryId: 'fallback-skill-analysis',
      featured: false,
      publicationStatus: 'published',
      displayOrder: 3,
    },
    {
      id: 'fallback-orange',
      name: 'Orange Data Mining',
      categoryId: 'fallback-skill-analysis',
      featured: false,
      publicationStatus: 'published',
      displayOrder: 4,
    },
    {
      id: 'fallback-blast',
      name: 'BLAST',
      categoryId: 'fallback-skill-science',
      featured: false,
      publicationStatus: 'published',
      displayOrder: 5,
    },
    {
      id: 'fallback-marg',
      name: 'Marg ERP',
      categoryId: 'fallback-skill-pharma',
      featured: true,
      publicationStatus: 'published',
      displayOrder: 6,
    },
    {
      id: 'fallback-chemdraw',
      name: 'ChemDraw',
      categoryId: 'fallback-skill-pharma',
      featured: true,
      publicationStatus: 'published',
      displayOrder: 7,
    },
  ],
  personalSkills: [
    {
      id: 'fallback-strength-adaptability',
      title: 'Strong adaptability',
      publicationStatus: 'published',
      displayOrder: 0,
    },
    {
      id: 'fallback-strength-attitude',
      title: 'Positive attitude',
      publicationStatus: 'published',
      displayOrder: 1,
    },
    {
      id: 'fallback-strength-time',
      title: 'Effective time management',
      publicationStatus: 'published',
      displayOrder: 2,
    },
    {
      id: 'fallback-strength-team',
      title: 'Collaborative teamwork',
      publicationStatus: 'published',
      displayOrder: 3,
    },
    {
      id: 'fallback-strength-pressure',
      title: 'Accuracy under pressure',
      publicationStatus: 'published',
      displayOrder: 4,
    },
  ],
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
  return resolvePrimaryNavigation((await fetchPublic<NavigationItem[]>('/navigation')) ?? []);
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
  return (await fetchPublic<PublicSkillsBundle>('/skills')) ?? fallbackSkills;
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
