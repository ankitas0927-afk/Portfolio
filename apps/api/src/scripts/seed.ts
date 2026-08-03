import bcrypt from 'bcrypt';
import { promises as fs } from 'fs';
import path from 'path';

import type { Express } from 'express';

import { DEFAULT_ACCENT, DEFAULT_SECONDARY_ACCENT } from '@ankita-portfolio/config';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { connectToDatabase, disconnectFromDatabase } from '../database/mongoose.js';
import {
  AdminModel,
  AboutModel,
  EducationModel,
  ExperienceModel,
  HeroModel,
  InterestModel,
  LanguageModel,
  NavigationItemModel,
  PersonalProfileModel,
  PersonalSkillModel,
  PrivatePersonalDetailsModel,
  ProjectModel,
  ResumeModel,
  SeoSettingsModel,
  SiteSettingsModel,
  SkillCategoryModel,
  SkillModel,
  SocialLinkModel,
  ProfessionalTrainingModel,
} from '../models/index.js';
import { updateMediaMetadata, uploadMedia } from '../services/media.service.js';
import { ankitaSeedData } from './seed-data.js';

function resolveSeedPath(filePath: string) {
  return path.resolve(process.cwd(), filePath);
}

async function readFileAsMulterUpload(filePath: string, mimetype: string): Promise<Express.Multer.File> {
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

async function seedAdmin() {
  const existingAdmin = await AdminModel.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });
  if (existingAdmin) {
    return existingAdmin;
  }

  const admin = await AdminModel.create({
    name: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL.toLowerCase(),
    passwordHash: await bcrypt.hash(env.ADMIN_INITIAL_PASSWORD, 12),
    role: 'owner',
  });

  return admin;
}

async function seedPortfolio(adminId: string) {
  const existingProfile = await PersonalProfileModel.findOne({});
  if (existingProfile) {
    logger.info('Portfolio content already exists. Skipping portfolio seed.');
    return;
  }

  const profileImagePath = env.PROFILE_IMAGE_PATH
    ? resolveSeedPath(env.PROFILE_IMAGE_PATH)
    : path.resolve(process.cwd(), 'seed-assets/ankita-profile.png');
  const resumePath = resolveSeedPath(env.RESUME_PDF_PATH);

  const resumeUpload = await uploadMedia({
    file: await readFileAsMulterUpload(resumePath, 'application/pdf'),
    category: 'resume',
    isPublic: true,
    associatedModel: 'Resume',
    adminId,
    requestId: 'seed-script',
  });

  const resume = await ResumeModel.create({
    title: 'Ankita Singh Resume',
    versionLabel: 'Initial Resume',
    mediaAssetId: resumeUpload.asset.id,
    isActive: true,
    publicationStatus: 'published',
  });

  await updateMediaMetadata(
    resumeUpload.asset.id as string,
    { associatedModel: 'Resume', associatedDocumentId: resume._id.toString(), isPublic: true },
    adminId,
    'seed-script',
  );

  const profileImageUpload = await uploadMedia({
    file: await readFileAsMulterUpload(profileImagePath, 'image/png'),
    category: 'profile-image',
    isPublic: true,
    altText: 'Ankita Singh portrait',
    associatedModel: 'PersonalProfile',
    adminId,
    requestId: 'seed-script',
  });

  const location = [env.OWNER_CITY, env.OWNER_STATE, env.OWNER_COUNTRY].filter(Boolean).join(', ');

  const profile = await PersonalProfileModel.create({
    fullName: 'Ankita Singh',
    professionalTitle: ankitaSeedData.professionalHeading,
    rotatingTitles: ankitaSeedData.rotatingTitles,
    shortIntroduction: ankitaSeedData.shortIntroduction,
    professionalSummary: ankitaSeedData.professionalSummary,
    careerObjective: ankitaSeedData.careerObjective,
    generalLocation: location || 'Lucknow, India',
    availability: 'open_to_work',
    profileImageId: profileImageUpload.asset.id,
    publicEmail: env.OWNER_PUBLIC_EMAIL || undefined,
    publicPhone: env.OWNER_PUBLIC_PHONE || undefined,
    activeResumeId: resume._id,
    publicationStatus: 'published',
  });

  await updateMediaMetadata(
    profileImageUpload.asset.id as string,
    { associatedModel: 'PersonalProfile', associatedDocumentId: profile._id.toString(), isPublic: true },
    adminId,
    'seed-script',
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
    publicationStatus: 'published',
  });

  await AboutModel.create({
    fullBiography: ankitaSeedData.fullBiography,
    preferredEmploymentArea: ankitaSeedData.preferredEmploymentArea,
    currentLocation: location || 'Lucknow, India',
    availabilityLabel: 'Open to suitable opportunities',
    keyStrengths: ankitaSeedData.keyStrengths,
    publicationStatus: 'published',
  });

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

  await Promise.all([
    SocialLinkModel.deleteMany({}),
    SiteSettingsModel.create({
      siteName: 'Ankita Singh Portfolio',
      siteTagline: 'Research, pharmacy, and quality-focused professional portfolio',
      accentColor: DEFAULT_ACCENT,
      secondaryAccentColor: DEFAULT_SECONDARY_ACCENT,
      enableDarkTheme: true,
      maintenanceMode: false,
      footerText: 'A professional portfolio focused on clarity, credibility, and thoughtful presentation.',
    }),
    SeoSettingsModel.create({
      defaultTitle: 'Ankita Singh | Research Analyst and Pharmacy Graduate',
      defaultDescription:
        'Professional portfolio of Ankita Singh, a research analyst and pharmacy graduate with pharmaceutical training and analysis software experience.',
      defaultKeywords: ['Ankita Singh', 'Research Analyst', 'Pharmacy Graduate', 'Pharmaceutical'],
      siteUrl: env.FRONTEND_URL,
    }),
  ]);

  logger.info('Initial portfolio content seeded successfully.');
}

async function main() {
  await connectToDatabase();
  const admin = await seedAdmin();
  await seedPortfolio(admin._id.toString());
}

main()
  .then(async () => {
    await disconnectFromDatabase();
    process.exit(0);
  })
  .catch(async (error) => {
    logger.error({ error }, 'Seed script failed');
    await disconnectFromDatabase();
    process.exit(1);
  });
