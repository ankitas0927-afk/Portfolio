import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';
import {
  AboutModel,
  CertificateModel,
  EducationModel,
  ExperienceModel,
  HeroModel,
  InterestModel,
  LanguageModel,
  MediaAssetModel,
  NavigationItemModel,
  PersonalProfileModel,
  PersonalSkillModel,
  ProfessionalTrainingModel,
  ProjectModel,
  ResumeModel,
  SeoSettingsModel,
  SiteSettingsModel,
  SkillCategoryModel,
  SkillModel,
  SocialLinkModel,
} from '../models/index.js';

type WithId = { _id: { toString(): string } };
type SiteSettingsDoc = WithId & {
  logoId?: { toString(): string } | null;
  faviconId?: { toString(): string } | null;
  openGraphImageId?: { toString(): string } | null;
};
type SeoSettingsDoc = WithId & {
  defaultOpenGraphImageId?: { toString(): string } | null;
};
type ProfileDoc = WithId & {
  fullName: string;
  preferredName?: string;
  professionalTitle: string;
  rotatingTitles: string[];
  shortIntroduction: string;
  professionalSummary: string;
  careerObjective: string;
  generalLocation: string;
  availability: string;
  profileImageId?: { toString(): string } | null;
  publicEmail?: string;
  publicPhone?: string;
  activeResumeId?: { toString(): string } | null;
  seo?: Record<string, unknown>;
};
type SocialLinkDoc = WithId & {
  label: string;
  url: string;
  icon?: string;
  publicationStatus: string;
  displayOrder: number;
};
type HeroDoc = WithId & {
  eyebrow?: string;
  heading: string;
  subheading: string;
  highlights: string[];
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
  heroImageId?: { toString(): string } | null;
  publicationStatus: string;
};
type AboutDoc = WithId & {
  fullBiography: string;
  preferredEmploymentArea?: string;
  currentLocation?: string;
  availabilityLabel?: string;
  keyStrengths: string[];
  aboutImageId?: { toString(): string } | null;
  publicationStatus: string;
};
type OrderedDoc = WithId & { publicationStatus: string; displayOrder: number };
type ExperienceDoc = OrderedDoc & { organisationLogoId?: { toString(): string } | null };
type EducationDoc = OrderedDoc & {
  institutionLogoId?: { toString(): string } | null;
  supportingDocumentId?: { toString(): string } | null;
};
type TrainingDoc = OrderedDoc & {
  organisationLogoId?: { toString(): string } | null;
  certificateImageId?: { toString(): string } | null;
  certificatePdfId?: { toString(): string } | null;
};
type SkillDoc = OrderedDoc & {
  categoryId: { toString(): string };
  logoId?: { toString(): string } | null;
};
type ProjectDoc = OrderedDoc & {
  thumbnailId?: { toString(): string } | null;
  galleryImageIds: Array<{ toString(): string }>;
  supportingDocumentIds: Array<{ toString(): string }>;
};
type InterestDoc = OrderedDoc & {
  imageId?: { toString(): string } | null;
};
type CertificateDoc = OrderedDoc & {
  certificateImageId?: { toString(): string } | null;
  certificatePdfId?: { toString(): string } | null;
};
type ResumeDoc = WithId & {
  title: string;
  versionLabel: string;
  mediaAssetId: { toString(): string };
  createdAt: Date;
  updatedAt: Date;
};

function createPublicUrl(mediaId: string) {
  return `${env.API_PUBLIC_URL}/api/v1/public/media/${mediaId}`;
}

async function loadMediaMap(ids: Array<string | null | undefined>) {
  const validIds = ids.filter(Boolean).map((id) => String(id));
  if (validIds.length === 0) {
    return new Map<string, Record<string, unknown>>();
  }

  const mediaItems = await MediaAssetModel.find({
    _id: { $in: validIds },
    deletedAt: null,
    isPublic: true,
    variant: 'original',
  }).lean();

  return new Map(
    mediaItems.map((item) => [
      String(item._id),
      {
        id: String(item._id),
        publicUrl: createPublicUrl(String(item._id)),
        altText: item.altText,
        width: item.width,
        height: item.height,
      },
    ]),
  );
}

export async function getPublicSiteContext() {
  const [siteSettings, seoSettings] = await Promise.all([
    SiteSettingsModel.findOne({}).lean<SiteSettingsDoc | null>(),
    SeoSettingsModel.findOne({}).lean<SeoSettingsDoc | null>(),
  ]);

  const mediaMap = await loadMediaMap([
    siteSettings?.logoId?.toString(),
    siteSettings?.faviconId?.toString(),
    siteSettings?.openGraphImageId?.toString(),
    seoSettings?.defaultOpenGraphImageId?.toString(),
  ]);

  return {
    siteSettings: siteSettings
      ? {
          ...siteSettings,
          id: String(siteSettings._id),
          logo: siteSettings.logoId ? mediaMap.get(String(siteSettings.logoId)) ?? null : null,
          favicon: siteSettings.faviconId ? mediaMap.get(String(siteSettings.faviconId)) ?? null : null,
          openGraphImage: siteSettings.openGraphImageId
            ? mediaMap.get(String(siteSettings.openGraphImageId)) ?? null
            : null,
        }
      : null,
    seoSettings: seoSettings
      ? {
          ...seoSettings,
          id: String(seoSettings._id),
          defaultOpenGraphImage: seoSettings.defaultOpenGraphImageId
            ? mediaMap.get(String(seoSettings.defaultOpenGraphImageId)) ?? null
            : null,
        }
      : null,
  };
}

export async function getPublicProfile() {
  const [profile, socialLinks] = await Promise.all([
    PersonalProfileModel.findOne({ publicationStatus: 'published' }).lean<ProfileDoc | null>(),
    SocialLinkModel.find({ publicationStatus: 'published' })
      .sort({ displayOrder: 1 })
      .lean<SocialLinkDoc[]>(),
  ]);

  if (!profile) {
    throw new AppError(404, 'Public profile is not available yet', 'PROFILE_NOT_FOUND');
  }

  const mediaMap = await loadMediaMap([profile.profileImageId?.toString()]);

  return {
    id: String(profile._id),
    fullName: profile.fullName,
    preferredName: profile.preferredName,
    professionalTitle: profile.professionalTitle,
    rotatingTitles: profile.rotatingTitles,
    shortIntroduction: profile.shortIntroduction,
    professionalSummary: profile.professionalSummary,
    careerObjective: profile.careerObjective,
    generalLocation: profile.generalLocation,
    availability: profile.availability,
    profileImage: profile.profileImageId ? mediaMap.get(String(profile.profileImageId)) ?? null : null,
    publicEmail: profile.publicEmail ?? null,
    publicPhone: profile.publicPhone ?? null,
    activeResumeId: profile.activeResumeId ? String(profile.activeResumeId) : null,
    socialLinks: socialLinks.map((link) => ({
      id: String(link._id),
      label: link.label,
      url: link.url,
      icon: link.icon,
      publicationStatus: link.publicationStatus,
      displayOrder: link.displayOrder,
    })),
    seo: profile.seo,
  };
}

export async function getPublicHero() {
  const hero = await HeroModel.findOne({ publicationStatus: 'published' }).lean<HeroDoc | null>();
  if (!hero) {
    throw new AppError(404, 'Hero content is not available yet', 'HERO_NOT_FOUND');
  }

  const mediaMap = await loadMediaMap([hero.heroImageId?.toString()]);

  return {
    id: String(hero._id),
    eyebrow: hero.eyebrow,
    heading: hero.heading,
    subheading: hero.subheading,
    highlights: hero.highlights,
    ctaPrimaryLabel: hero.ctaPrimaryLabel,
    ctaPrimaryHref: hero.ctaPrimaryHref,
    ctaSecondaryLabel: hero.ctaSecondaryLabel,
    ctaSecondaryHref: hero.ctaSecondaryHref,
    heroImage: hero.heroImageId ? mediaMap.get(String(hero.heroImageId)) ?? null : null,
    publicationStatus: hero.publicationStatus,
  };
}

export async function getPublicAbout() {
  const about = await AboutModel.findOne({ publicationStatus: 'published' }).lean<AboutDoc | null>();
  if (!about) {
    throw new AppError(404, 'About content is not available yet', 'ABOUT_NOT_FOUND');
  }

  const mediaMap = await loadMediaMap([about.aboutImageId?.toString()]);

  return {
    id: String(about._id),
    fullBiography: about.fullBiography,
    preferredEmploymentArea: about.preferredEmploymentArea,
    currentLocation: about.currentLocation,
    availabilityLabel: about.availabilityLabel,
    keyStrengths: about.keyStrengths,
    aboutImage: about.aboutImageId ? mediaMap.get(String(about.aboutImageId)) ?? null : null,
    publicationStatus: about.publicationStatus,
  };
}

async function attachSingleMedia<T extends Record<string, unknown>>(
  docs: T[],
  field: string,
  outputField: string,
) {
  const mediaMap = await loadMediaMap(docs.map((doc) => doc[field]?.toString() ?? null));
  return docs.map((doc) => ({
    ...doc,
    id: String(doc._id),
    [outputField]: doc[field] ? mediaMap.get(String(doc[field])) ?? null : null,
  }));
}

export async function getPublicExperience() {
  const experience = await ExperienceModel.find({ publicationStatus: 'published' })
    .sort({ displayOrder: 1 })
    .lean<ExperienceDoc[]>();
  return attachSingleMedia(experience, 'organisationLogoId', 'organisationLogo');
}

export async function getPublicEducation() {
  const education = await EducationModel.find({ publicationStatus: 'published' })
    .sort({ displayOrder: 1 })
    .lean<EducationDoc[]>();
  const mediaMap = await loadMediaMap(
    education.flatMap((record) => [
      record.institutionLogoId?.toString(),
      record.supportingDocumentId?.toString(),
    ]),
  );
  return education.map((record) => ({
    ...record,
    id: String(record._id),
    institutionLogo: record.institutionLogoId
      ? mediaMap.get(String(record.institutionLogoId)) ?? null
      : null,
    supportingDocument: record.supportingDocumentId
      ? mediaMap.get(String(record.supportingDocumentId)) ?? null
      : null,
  }));
}

export async function getPublicTraining() {
  const training = await ProfessionalTrainingModel.find({ publicationStatus: 'published' })
    .sort({ displayOrder: 1 })
    .lean<TrainingDoc[]>();
  const mediaMap = await loadMediaMap(
    training.flatMap((record) => [
      record.organisationLogoId?.toString(),
      record.certificateImageId?.toString(),
      record.certificatePdfId?.toString(),
    ]),
  );
  return training.map((record) => ({
    ...record,
    id: String(record._id),
    organisationLogo: record.organisationLogoId
      ? mediaMap.get(String(record.organisationLogoId)) ?? null
      : null,
    certificateImage: record.certificateImageId
      ? mediaMap.get(String(record.certificateImageId)) ?? null
      : null,
    certificatePdf: record.certificatePdfId ? mediaMap.get(String(record.certificatePdfId)) ?? null : null,
  }));
}

export async function getPublicSkills() {
  const [categories, skills, personalSkills] = await Promise.all([
    SkillCategoryModel.find({ publicationStatus: 'published' })
      .sort({ displayOrder: 1 })
      .lean<OrderedDoc[]>(),
    SkillModel.find({ publicationStatus: 'published' }).sort({ displayOrder: 1 }).lean<SkillDoc[]>(),
    PersonalSkillModel.find({ publicationStatus: 'published' })
      .sort({ displayOrder: 1 })
      .lean<OrderedDoc[]>(),
  ]);

  const mediaMap = await loadMediaMap(skills.map((skill) => skill.logoId?.toString()));

  return {
    categories: categories.map((category) => ({
      ...category,
      id: String(category._id),
    })),
    skills: skills.map((skill) => ({
      ...skill,
      id: String(skill._id),
      categoryId: String(skill.categoryId),
      logo: skill.logoId ? mediaMap.get(String(skill.logoId)) ?? null : null,
    })),
    personalSkills: personalSkills.map((skill) => ({
      ...skill,
      id: String(skill._id),
    })),
  };
}

export async function getPublicProjects(featured?: boolean) {
  const filter: Record<string, unknown> = { publicationStatus: 'published' };
  if (typeof featured === 'boolean') {
    filter.featured = featured;
  }

  const projects = await ProjectModel.find(filter).sort({ displayOrder: 1 }).lean<ProjectDoc[]>();
  const mediaMap = await loadMediaMap(
    projects.flatMap((project) => [project.thumbnailId?.toString(), ...project.galleryImageIds.map(String)]),
  );
  return projects.map((project) => ({
    ...project,
    id: String(project._id),
    thumbnail: project.thumbnailId ? mediaMap.get(String(project.thumbnailId)) ?? null : null,
    galleryImages: project.galleryImageIds
      .map((imageId) => mediaMap.get(String(imageId)) ?? null)
      .filter((image): image is Record<string, unknown> => Boolean(image)),
  }));
}

export async function getPublicProjectBySlug(slug: string) {
  const project = await ProjectModel.findOne({ slug, publicationStatus: 'published' }).lean<ProjectDoc | null>();
  if (!project) {
    throw new AppError(404, 'Project not found', 'PROJECT_NOT_FOUND');
  }

  const mediaMap = await loadMediaMap([
    project.thumbnailId?.toString(),
    ...project.galleryImageIds.map(String),
    ...project.supportingDocumentIds.map(String),
  ]);

  return {
    ...project,
    id: String(project._id),
    thumbnail: project.thumbnailId ? mediaMap.get(String(project.thumbnailId)) ?? null : null,
    galleryImages: project.galleryImageIds
      .map((imageId) => mediaMap.get(String(imageId)) ?? null)
      .filter((image): image is Record<string, unknown> => Boolean(image)),
    supportingDocuments: project.supportingDocumentIds
      .map((assetId) => mediaMap.get(String(assetId)) ?? null)
      .filter((asset): asset is Record<string, unknown> => Boolean(asset)),
  };
}

export async function getPublicLanguages() {
  const languages = await LanguageModel.find({ publicationStatus: 'published' })
    .sort({ displayOrder: 1 })
    .lean<OrderedDoc[]>();
  return languages.map((language) => ({
    ...language,
    id: String(language._id),
  }));
}

export async function getPublicInterests() {
  const interests = await InterestModel.find({ publicationStatus: 'published' })
    .sort({ displayOrder: 1 })
    .lean<InterestDoc[]>();
  const mediaMap = await loadMediaMap(interests.map((interest) => interest.imageId?.toString()));
  return interests.map((interest) => ({
    ...interest,
    id: String(interest._id),
    image: interest.imageId ? mediaMap.get(String(interest.imageId)) ?? null : null,
  }));
}

export async function getPublicCertificates() {
  const certificates = await CertificateModel.find({ publicationStatus: 'published' })
    .sort({ displayOrder: 1 })
    .lean<CertificateDoc[]>();
  const mediaMap = await loadMediaMap(
    certificates.flatMap((record) => [
      record.certificateImageId?.toString(),
      record.certificatePdfId?.toString(),
    ]),
  );
  return certificates.map((certificate) => ({
    ...certificate,
    id: String(certificate._id),
    certificateImage: certificate.certificateImageId
      ? mediaMap.get(String(certificate.certificateImageId)) ?? null
      : null,
    certificatePdf: certificate.certificatePdfId
      ? mediaMap.get(String(certificate.certificatePdfId)) ?? null
      : null,
  }));
}

export async function getPublicSocialLinks() {
  const socialLinks = await SocialLinkModel.find({ publicationStatus: 'published' })
    .sort({ displayOrder: 1 })
    .lean<SocialLinkDoc[]>();
  return socialLinks.map((item) => ({ ...item, id: String(item._id) }));
}

export async function getPublicNavigation() {
  const items = await NavigationItemModel.find({ publicationStatus: 'published' })
    .sort({ displayOrder: 1 })
    .lean<OrderedDoc[]>();
  return items.map((item) => ({ ...item, id: String(item._id) }));
}

export async function getPublicResume() {
  const resume = await ResumeModel.findOne({ isActive: true, publicationStatus: 'published' }).lean<ResumeDoc | null>();
  if (!resume) {
    throw new AppError(404, 'A public resume is not available yet', 'RESUME_NOT_FOUND');
  }

  const mediaMap = await loadMediaMap([resume.mediaAssetId.toString()]);
  const media = mediaMap.get(String(resume.mediaAssetId));

  return {
    id: String(resume._id),
    title: resume.title,
    versionLabel: resume.versionLabel,
    createdAt: resume.createdAt,
    updatedAt: resume.updatedAt,
    media,
    previewUrl: createPublicUrl(String(resume.mediaAssetId)),
    downloadUrl: `${createPublicUrl(String(resume.mediaAssetId))}?download=1`,
  };
}
