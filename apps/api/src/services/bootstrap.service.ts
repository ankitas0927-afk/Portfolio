import bcrypt from 'bcrypt';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import type { Express } from 'express';

import { DEFAULT_ACCENT, DEFAULT_SECONDARY_ACCENT } from '@ankita-portfolio/config';
import { env } from '../config/env';
import { logger } from '../config/logger';
import {
  AboutModel,
  AdminModel,
  CertificateModel,
  EducationModel,
  ExperienceModel,
  HeroModel,
  InterestModel,
  LanguageModel,
  NavigationItemModel,
  PersonalProfileModel,
  PersonalSkillModel,
  PrivatePersonalDetailsModel,
  ProfessionalTrainingModel,
  ProjectModel,
  ResumeModel,
  SeoSettingsModel,
  SiteSettingsModel,
  SkillCategoryModel,
  SkillModel,
  SocialLinkModel,
} from '../models/index';
import { updateMediaMetadata, uploadMedia } from './media.service';
import { ankitaSeedData } from '../scripts/seed-data';

type BootstrapProfileSnapshot = {
  _id?: { toString(): string };
  fullName?: string;
  professionalTitle?: string;
  shortIntroduction?: string;
  professionalSummary?: string;
  careerObjective?: string;
  generalLocation?: string;
  profileImageId?: { toString(): string } | null;
  activeResumeId?: { toString(): string } | null;
};

const BOOTSTRAP_REQUEST_ID = 'bootstrap-seed';
const legacyInterestTitles = [
  'Interacting with people',
  'Watching films',
  'Listening to music',
  'Exercise',
];
const apiPackageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function resolveAssetCandidates(filePath: string) {
  if (path.isAbsolute(filePath)) {
    return [filePath];
  }

  const normalizedPath = filePath.replace(/^[./\\]+/, '');

  return Array.from(
    new Set([
      path.resolve(process.cwd(), filePath),
      path.resolve(apiPackageRoot, normalizedPath),
    ]),
  );
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveSeedAssetPath(configuredPath: string | undefined, fallbackPath: string) {
  if (configuredPath?.trim()) {
    const configuredCandidates = resolveAssetCandidates(configuredPath);
    for (const candidate of configuredCandidates) {
      if (await fileExists(candidate)) {
        return candidate;
      }
    }

    logger.warn(
      { configuredPath, configuredCandidates, fallbackPath },
      'Configured seed asset was not found. Falling back to bundled asset.',
    );
  }

  for (const candidate of resolveAssetCandidates(fallbackPath)) {
    if (await fileExists(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Bundled seed asset not found: ${fallbackPath}`);
}

async function readFileAsMulterUpload(
  filePath: string,
  mimetype: string,
): Promise<Express.Multer.File> {
  const buffer = await fs.readFile(filePath);
  return {
    fieldname: 'file',
    originalname: path.basename(filePath),
    encoding: '7bit',
    mimetype,
    size: buffer.length,
    buffer,
    destination: '',
    filename: path.basename(filePath),
    path: filePath,
    stream: undefined as never,
  };
}

export async function ensureAdminAccount() {
  const configuredEmail = env.ADMIN_EMAIL.toLowerCase();
  const existingAdmin = await AdminModel.findOne({ email: configuredEmail });
  if (existingAdmin) {
    return { admin: existingAdmin, created: false };
  }

  const createdAdmin = await AdminModel.create({
    name: env.ADMIN_NAME,
    email: configuredEmail,
    passwordHash: await bcrypt.hash(env.ADMIN_INITIAL_PASSWORD, 12),
    role: 'owner',
  });

  logger.info({ email: configuredEmail }, 'Initial administrator account created');

  return { admin: createdAdmin, created: true };
}

function getOwnerLocation() {
  return (
    [env.OWNER_CITY, env.OWNER_STATE, env.OWNER_COUNTRY].filter(Boolean).join(', ') ||
    ankitaSeedData.currentLocation
  );
}

function getResumeMimeType(filePath: string) {
  const resumeExtension = path.extname(filePath).toLowerCase();
  if (resumeExtension === '.doc') {
    return 'application/msword';
  }

  if (resumeExtension === '.docx') {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }

  return 'application/pdf';
}

function isGenericPortfolioProfile(profile: BootstrapProfileSnapshot) {
  const combinedText = [
    profile.fullName,
    profile.professionalTitle,
    profile.shortIntroduction,
    profile.professionalSummary,
    profile.careerObjective,
    profile.generalLocation,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return (
    !combinedText.includes('ankita') ||
    combinedText.includes('professional portfolio') ||
    combinedText.includes('published profile') ||
    combinedText.includes('location available on request')
  );
}

async function uploadSeedProfileImage(adminId: string) {
  const profileImagePath = await resolveSeedAssetPath(
    env.PROFILE_IMAGE_PATH,
    'seed-assets/ankita-profile.png',
  );
  return uploadMedia({
    file: await readFileAsMulterUpload(profileImagePath, 'image/png'),
    category: 'profile-image',
    isPublic: true,
    altText: 'Ankita Singh portrait',
    associatedModel: 'PersonalProfile',
    adminId,
    requestId: BOOTSTRAP_REQUEST_ID,
  });
}

async function createSeedResume(adminId: string) {
  const resumePath = await resolveSeedAssetPath(
    env.RESUME_PDF_PATH,
    'seed-assets/ankita-resume.pdf',
  );
  const resumeUpload = await uploadMedia({
    file: await readFileAsMulterUpload(resumePath, getResumeMimeType(resumePath)),
    category: 'resume',
    isPublic: true,
    associatedModel: 'Resume',
    adminId,
    requestId: BOOTSTRAP_REQUEST_ID,
  });

  await ResumeModel.updateMany({}, { $set: { isActive: false } });

  const resume = await ResumeModel.create({
    title: 'Ankita Singh Resume',
    versionLabel: 'Current CV',
    mediaAssetId: resumeUpload.asset.id,
    isActive: true,
    publicationStatus: 'published',
  });

  await updateMediaMetadata(
    resumeUpload.asset.id as string,
    { associatedModel: 'Resume', associatedDocumentId: resume._id.toString(), isPublic: true },
    adminId,
    BOOTSTRAP_REQUEST_ID,
  );

  return resume;
}

async function clearSeedManagedPortfolioContent() {
  await Promise.all([
    PersonalProfileModel.deleteMany({}),
    PrivatePersonalDetailsModel.deleteMany({}),
    SiteSettingsModel.deleteMany({}),
    HeroModel.deleteMany({}),
    AboutModel.deleteMany({}),
    ExperienceModel.deleteMany({}),
    EducationModel.deleteMany({}),
    ProfessionalTrainingModel.deleteMany({}),
    SkillCategoryModel.deleteMany({}),
    SkillModel.deleteMany({}),
    PersonalSkillModel.deleteMany({}),
    ProjectModel.deleteMany({}),
    LanguageModel.deleteMany({}),
    InterestModel.deleteMany({}),
    CertificateModel.deleteMany({}),
    ResumeModel.deleteMany({}),
    SocialLinkModel.deleteMany({}),
    NavigationItemModel.deleteMany({}),
    SeoSettingsModel.deleteMany({}),
  ]);
}

async function insertOrderedPortfolioRecords() {
  const skillCategories = await SkillCategoryModel.insertMany(
    ankitaSeedData.skillCategories.map((category) => ({
      ...category,
      publicationStatus: 'published',
    })),
  );

  const categoryMap = new Map(skillCategories.map((category) => [category.name, category._id]));

  await SkillModel.insertMany(
    ankitaSeedData.skills.map((skill) => ({
      name: skill.name,
      categoryId: categoryMap.get(skill.categoryName),
      displayOrder: skill.displayOrder,
      publicationStatus: 'published',
    })),
  );

  await Promise.all([
    ExperienceModel.insertMany(ankitaSeedData.experience),
    EducationModel.insertMany(ankitaSeedData.education),
    ProfessionalTrainingModel.insertMany(ankitaSeedData.training),
    PersonalSkillModel.insertMany(
      ankitaSeedData.personalSkills.map((title, index) => ({
        title,
        displayOrder: index,
        publicationStatus: 'published',
      })),
    ),
    LanguageModel.insertMany(
      ankitaSeedData.languages.map((language) => ({
        ...language,
        publicationStatus: 'published',
      })),
    ),
    InterestModel.insertMany(
      ankitaSeedData.interests.map((interest) => ({
        ...interest,
        publicationStatus: 'published',
      })),
    ),
    ProjectModel.create(ankitaSeedData.project),
    NavigationItemModel.insertMany(
      ankitaSeedData.navigation.map((item) => ({
        ...item,
        opensInNewTab: false,
        publicationStatus: 'published',
      })),
    ),
  ]);
}

async function createPortfolioSeed(adminId: string) {
  const profileImageUpload = await uploadSeedProfileImage(adminId);
  const resume = await createSeedResume(adminId);
  const location = getOwnerLocation();

  const profile = await PersonalProfileModel.create({
    fullName: 'Ankita Singh',
    professionalTitle: ankitaSeedData.professionalHeading,
    rotatingTitles: ankitaSeedData.rotatingTitles,
    shortIntroduction: ankitaSeedData.shortIntroduction,
    professionalSummary: ankitaSeedData.professionalSummary,
    careerObjective: ankitaSeedData.careerObjective,
    generalLocation: location,
    availability: 'open_to_work',
    profileImageId: profileImageUpload.asset.id,
    heroImageId: profileImageUpload.asset.id,
    publicEmail: env.OWNER_PUBLIC_EMAIL || undefined,
    publicPhone: env.OWNER_PUBLIC_PHONE || undefined,
    activeResumeId: resume._id,
    publicationStatus: 'published',
  });

  await updateMediaMetadata(
    profileImageUpload.asset.id as string,
    {
      associatedModel: 'PersonalProfile',
      associatedDocumentId: profile._id.toString(),
      isPublic: true,
    },
    adminId,
    BOOTSTRAP_REQUEST_ID,
  );

  await PrivatePersonalDetailsModel.create({
    profileId: profile._id,
    privateEmail: env.OWNER_PRIVATE_EMAIL || undefined,
    privatePhone: env.OWNER_PRIVATE_PHONE || undefined,
    fullAddress: env.OWNER_PRIVATE_ADDRESS || undefined,
    dateOfBirth: env.OWNER_DATE_OF_BIRTH || undefined,
    parentOrGuardian: env.OWNER_PARENT_GUARDIAN || undefined,
    gender: env.OWNER_GENDER || undefined,
    nationality: env.OWNER_NATIONALITY || undefined,
    city: env.OWNER_CITY || undefined,
    state: env.OWNER_STATE || undefined,
    country: env.OWNER_COUNTRY || undefined,
    publicProfessionalEmail: env.OWNER_PUBLIC_EMAIL || undefined,
    publicProfessionalPhone: env.OWNER_PUBLIC_PHONE || undefined,
    emailIsPublic: Boolean(env.OWNER_PUBLIC_EMAIL),
    phoneIsPublic: Boolean(env.OWNER_PUBLIC_PHONE),
  });

  await HeroModel.create({
    eyebrow: 'Professional Profile',
    heading: ankitaSeedData.heroHeading,
    subheading: ankitaSeedData.heroSubheading,
    highlights: ankitaSeedData.heroHighlights,
    ctaPrimaryLabel: 'View Resume',
    ctaPrimaryHref: '/resume',
    ctaSecondaryLabel: 'Contact',
    ctaSecondaryHref: '/contact',
    heroImageId: profileImageUpload.asset.id,
    publicationStatus: 'published',
  });

  await AboutModel.create({
    fullBiography: ankitaSeedData.fullBiography,
    preferredEmploymentArea: ankitaSeedData.preferredEmploymentArea,
    currentLocation: location,
    availabilityLabel: 'Open to suitable opportunities',
    keyStrengths: ankitaSeedData.keyStrengths,
    aboutImageId: profileImageUpload.asset.id,
    publicationStatus: 'published',
  });

  await insertOrderedPortfolioRecords();

  await Promise.all([
    SocialLinkModel.deleteMany({}),
    SiteSettingsModel.create({
      siteName: 'Ankita Singh',
      siteTagline: 'Research Analyst | Pharmacy Graduate',
      logoId: profileImageUpload.asset.id,
      faviconId: profileImageUpload.asset.id,
      openGraphImageId: profileImageUpload.asset.id,
      accentColor: DEFAULT_ACCENT,
      secondaryAccentColor: DEFAULT_SECONDARY_ACCENT,
      enableDarkTheme: true,
      maintenanceMode: false,
      footerText:
        'Research analyst and pharmacy graduate focused on accurate analysis, quality control exposure, and dependable professional communication.',
    }),
    SeoSettingsModel.create({
      defaultTitle: 'Ankita Singh | Research Analyst and Pharmacy Graduate',
      defaultDescription:
        'Portfolio of Ankita Singh, a current Research Analyst and B.Pharm graduate with quality control training, pharmaceutical software exposure, and data analysis tool experience.',
      defaultKeywords: [
        'Ankita Singh',
        'Research Analyst',
        'Pharmacy Graduate',
        'Quality Control',
        'Glenmark Pharmaceuticals',
        'Royal Research',
      ],
      defaultOpenGraphImageId: profileImageUpload.asset.id,
      siteUrl: env.FRONTEND_URL,
    }),
  ]);

  logger.info('Initial portfolio content seeded successfully.');

  return { seeded: true };
}

async function hasLegacyResumeSeedContent() {
  const [legacyEducation, legacyInterestCount] = await Promise.all([
    EducationModel.exists({ qualification: /Bachelor of Science/i }),
    InterestModel.countDocuments({ title: { $in: legacyInterestTitles } }),
  ]);

  return Boolean(legacyEducation) || legacyInterestCount > 0;
}

async function ensureMissingPublicShell(adminId: string, profile: BootstrapProfileSnapshot) {
  let changed = false;
  const location = getOwnerLocation();

  if (!profile.profileImageId) {
    const profileImageUpload = await uploadSeedProfileImage(adminId);
    await PersonalProfileModel.updateOne(
      { _id: profile._id },
      {
        $set: {
          profileImageId: profileImageUpload.asset.id,
          heroImageId: profileImageUpload.asset.id,
        },
      },
    );
    await updateMediaMetadata(
      profileImageUpload.asset.id as string,
      {
        associatedModel: 'PersonalProfile',
        associatedDocumentId: profile._id?.toString(),
        isPublic: true,
      },
      adminId,
      BOOTSTRAP_REQUEST_ID,
    );
    profile.profileImageId = { toString: () => String(profileImageUpload.asset.id) };
    changed = true;
  }

  if (
    !profile.activeResumeId &&
    (await ResumeModel.countDocuments({ isActive: true, publicationStatus: 'published' })) === 0
  ) {
    const resume = await createSeedResume(adminId);
    await PersonalProfileModel.updateOne(
      { _id: profile._id },
      { $set: { activeResumeId: resume._id } },
    );
    changed = true;
  }

  if ((await NavigationItemModel.countDocuments({ publicationStatus: 'published' })) === 0) {
    await NavigationItemModel.insertMany(
      ankitaSeedData.navigation.map((item) => ({
        ...item,
        opensInNewTab: false,
        publicationStatus: 'published',
      })),
    );
    changed = true;
  }

  if ((await HeroModel.countDocuments({ publicationStatus: 'published' })) === 0) {
    await HeroModel.create({
      eyebrow: 'Professional Profile',
      heading: ankitaSeedData.heroHeading,
      subheading: ankitaSeedData.heroSubheading,
      highlights: ankitaSeedData.heroHighlights,
      ctaPrimaryLabel: 'View Resume',
      ctaPrimaryHref: '/resume',
      ctaSecondaryLabel: 'Contact',
      ctaSecondaryHref: '/contact',
      heroImageId: profile.profileImageId,
      publicationStatus: 'published',
    });
    changed = true;
  }

  if ((await AboutModel.countDocuments({ publicationStatus: 'published' })) === 0) {
    await AboutModel.create({
      fullBiography: ankitaSeedData.fullBiography,
      preferredEmploymentArea: ankitaSeedData.preferredEmploymentArea,
      currentLocation: location,
      availabilityLabel: 'Open to suitable opportunities',
      keyStrengths: ankitaSeedData.keyStrengths,
      aboutImageId: profile.profileImageId,
      publicationStatus: 'published',
    });
    changed = true;
  }

  if ((await SiteSettingsModel.countDocuments({})) === 0) {
    await SiteSettingsModel.create({
      siteName: 'Ankita Singh',
      siteTagline: 'Research Analyst | Pharmacy Graduate',
      logoId: profile.profileImageId,
      faviconId: profile.profileImageId,
      openGraphImageId: profile.profileImageId,
      accentColor: DEFAULT_ACCENT,
      secondaryAccentColor: DEFAULT_SECONDARY_ACCENT,
      enableDarkTheme: true,
      maintenanceMode: false,
      footerText:
        'Research analyst and pharmacy graduate focused on accurate analysis, quality control exposure, and dependable professional communication.',
    });
    changed = true;
  }

  if ((await SeoSettingsModel.countDocuments({})) === 0) {
    await SeoSettingsModel.create({
      defaultTitle: 'Ankita Singh | Research Analyst and Pharmacy Graduate',
      defaultDescription:
        'Portfolio of Ankita Singh, a current Research Analyst and B.Pharm graduate with quality control training, pharmaceutical software exposure, and data analysis tool experience.',
      defaultKeywords: ['Ankita Singh', 'Research Analyst', 'Pharmacy Graduate', 'Quality Control'],
      defaultOpenGraphImageId: profile.profileImageId,
      siteUrl: env.FRONTEND_URL,
    });
    changed = true;
  }

  return changed;
}

export async function ensurePortfolioSeed(adminId: string) {
  const existingProfile = await PersonalProfileModel.findOne(
    {},
  ).lean<BootstrapProfileSnapshot | null>();
  if (!existingProfile) {
    return createPortfolioSeed(adminId);
  }

  if (isGenericPortfolioProfile(existingProfile)) {
    logger.warn(
      {
        existingName: existingProfile.fullName,
        existingTitle: existingProfile.professionalTitle,
      },
      'Generic portfolio content detected. Replacing it with Ankita CV seed data.',
    );
    await clearSeedManagedPortfolioContent();
    const result = await createPortfolioSeed(adminId);
    return { ...result, repairedPlaceholders: true };
  }

  if (await hasLegacyResumeSeedContent()) {
    logger.warn(
      'Outdated resume seed content detected. Refreshing seed-managed portfolio data to match the current resume.',
    );
    await clearSeedManagedPortfolioContent();
    const result = await createPortfolioSeed(adminId);
    return { ...result, refreshedLegacySeed: true };
  }

  const changed = await ensureMissingPublicShell(adminId, existingProfile);
  return { seeded: false, repairedPlaceholders: false, ensuredMissingContent: changed };
}

export async function ensureInitialPortfolioData() {
  const { admin, created } = await ensureAdminAccount();
  const portfolioResult = await ensurePortfolioSeed(admin._id.toString());

  return {
    createdAdmin: created,
    seededPortfolio: portfolioResult.seeded,
    repairedPlaceholders:
      'repairedPlaceholders' in portfolioResult ? portfolioResult.repairedPlaceholders : false,
    ensuredMissingContent:
      'ensuredMissingContent' in portfolioResult ? portfolioResult.ensuredMissingContent : false,
  };
}
