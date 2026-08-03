import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Types } from "mongoose";
import slugify from "slugify";
import { footerSettingsSchema } from "@ankita-portfolio/validation";
import { getEnv } from "../config/env.js";
import { logger } from "../config/logger.js";
import { connectDatabase, disconnectDatabase } from "../database/connection.js";
import {
  Education,
  Experience,
  Interest,
  Language,
  PersonalSkill,
  Profile,
  Project,
  Resume,
  SiteSetting,
  Skill,
  SkillCategory,
  Training
} from "../models/content.js";
import { createInitialAdmin } from "../services/auth.service.js";
import { storeBufferInGridFs } from "../services/media.service.js";

type SkillSeed = {
  category: string;
  skills: string[];
};

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveInputPath(input: string | undefined, fallback: string): Promise<string> {
  const requested = (input && input.trim().length > 0 ? input : fallback).replace(/[\\/]+/g, path.sep);
  const basename = path.basename(requested);
  const candidates = new Set<string>();

  if (path.isAbsolute(requested)) {
    candidates.add(path.normalize(requested));
  } else {
    candidates.add(path.resolve(process.cwd(), requested));
  }

  let current = process.cwd();
  for (let depth = 0; depth < 6; depth += 1) {
    candidates.add(path.resolve(current, basename));
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  for (const candidate of candidates) {
    if (await pathExists(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Could not find ${basename} for seed import. Set a valid RESUME_PDF_PATH or place the resume document in a parent directory.`);
}

async function readOptionalFile(filePath: string | undefined): Promise<{ buffer: Buffer; name: string } | null> {
  if (!filePath) {
    return null;
  }
  try {
    const resolved = await resolveInputPath(filePath, "");
    const buffer = await fs.readFile(resolved);
    return { buffer, name: path.basename(resolved) };
  } catch (error) {
    logger.warn({ err: error, filePath }, "Optional seed file was not found; skipping");
    return null;
  }
}

async function seedProfile(profileImageId?: Types.ObjectId): Promise<void> {
  const env = getEnv();
  const existing = await Profile.findOne();
  if (existing) {
    logger.info("Profile already exists; skipping profile seed");
    return;
  }

  await Profile.create({
    name: "Ankita Singh",
    heading: "Research Analyst | Pharmacy Graduate | Pharmaceutical and Data Analysis Professional",
    rotatingTitles: [
      "Research Analyst",
      "Pharmacy Graduate",
      "Pharmaceutical Research Professional",
      "Quality Control Trainee",
      "Data Analysis Software User"
    ],
    heroIntroduction:
      "A pharmacy graduate and Research Analyst focused on reliable, quality-driven pharmaceutical and research work.",
    professionalBiography:
      "Ankita Singh is a highly organised, hardworking and punctual professional seeking responsible opportunities within a reputable pharmaceutical organisation. She is focused on producing quality work, works effectively under pressure and brings disciplined time management to research and pharmaceutical environments.",
    careerObjective:
      "To contribute to a reputable pharmaceutical organisation through responsible, quality-focused work while continuing to learn and grow as a research and pharmaceutical professional.",
    professionalSummary:
      "Research Analyst with a Bachelor of Pharmacy background, industrial training exposure in Quality Control and working familiarity with pharmaceutical, scientific and data-analysis software.",
    availabilityStatus: "Available for responsible pharmaceutical and research opportunities",
    preferredEmploymentArea: "Pharmaceutical research, quality control and data-supported analysis",
    currentLocation: `${env.OWNER_CITY || "Lucknow"}, ${env.OWNER_COUNTRY || "India"}`,
    keyStrengths: [
      "Quality-focused work",
      "Time management",
      "Organisation and punctuality",
      "Ability to work under pressure",
      "Team-oriented approach",
      "Positive attitude"
    ],
    profileImage: profileImageId,
    publicProfessionalEmail: env.OWNER_PUBLIC_EMAIL || undefined,
    privateAccountEmail: env.OWNER_PRIVATE_EMAIL || undefined,
    publicTelephoneNumber: env.OWNER_PUBLIC_PHONE || undefined,
    privateTelephoneNumber: env.OWNER_PRIVATE_PHONE || undefined,
    city: env.OWNER_CITY || "Lucknow",
    state: env.OWNER_STATE || undefined,
    country: env.OWNER_COUNTRY || "India",
    fullPrivateAddress: env.OWNER_PRIVATE_ADDRESS || undefined,
    dateOfBirth: env.OWNER_DATE_OF_BIRTH || undefined,
    parentOrGuardian: env.OWNER_PARENT_GUARDIAN || undefined,
    gender: env.OWNER_GENDER || undefined,
    nationality: env.OWNER_NATIONALITY || undefined,
    visibility: {
      publicProfessionalEmail: false,
      publicTelephoneNumber: false,
      city: true,
      state: true,
      country: true,
      privateAccountEmail: false,
      privateTelephoneNumber: false,
      fullPrivateAddress: false,
      dateOfBirth: false,
      parentOrGuardian: false,
      gender: false,
      nationality: false
    },
    status: "published"
  });
}

async function seedFooterSettings(): Promise<void> {
  const env = getEnv();
  const existing = await SiteSetting.findOne({ key: "footer" });
  if (existing) {
    logger.info("Footer settings already exist; skipping footer seed");
    return;
  }

  const contactLocation = [env.OWNER_CITY, env.OWNER_STATE, env.OWNER_COUNTRY]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join(", ");

  await SiteSetting.create({
    key: "footer",
    value: footerSettingsSchema.parse({
      contactEmail: env.OWNER_PUBLIC_EMAIL || undefined,
      contactPhone: env.OWNER_PUBLIC_PHONE || undefined,
      contactLocation: contactLocation || undefined,
      socialLinks: {}
    }),
    isPublic: true
  });
}

async function seedResume(adminId: Types.ObjectId): Promise<void> {
  const existingActiveResume = await Resume.findOne({ isActive: true });
  if (existingActiveResume) {
    logger.info("Active resume already exists; skipping resume import");
    return;
  }

  const pdfPath = await resolveInputPath(getEnv().RESUME_PDF_PATH, "../../../Ankita CV edit.pdf");
  const pdfBuffer = await fs.readFile(pdfPath);
  const assets = await storeBufferInGridFs({
    buffer: pdfBuffer,
    originalName: path.basename(pdfPath),
    declaredMimeType: "application/pdf",
    bucketName: "resumes",
    category: "resume",
    isPublic: true,
    altText: "Ankita Singh resume document",
    uploadedBy: adminId
  });
  const resumeAsset = assets[0];
  if (!resumeAsset) {
    throw new Error("Resume import did not create a GridFS media asset");
  }

  await Resume.create({
    title: "Ankita Singh Resume",
    mediaAsset: resumeAsset._id,
    isActive: true,
    status: "published",
    uploadedAt: new Date()
  });
}

async function seedOptionalProfileImage(adminId: Types.ObjectId): Promise<Types.ObjectId | undefined> {
  const file = await readOptionalFile(getEnv().PROFILE_IMAGE_PATH);
  if (!file) {
    logger.info("PROFILE_IMAGE_PATH was not provided; profile image can be uploaded from the admin media library");
    return undefined;
  }

  const assets = await storeBufferInGridFs({
    buffer: file.buffer,
    originalName: file.name,
    bucketName: "profileImages",
    category: "profile",
    isPublic: true,
    altText: "Ankita Singh profile photograph",
    uploadedBy: adminId
  });
  const imageAsset = assets[0];
  if (!imageAsset) {
    throw new Error("Profile image import did not create a GridFS media asset");
  }
  return imageAsset._id;
}

async function seedExperience(): Promise<void> {
  if (await Experience.exists({ organisation: "Royal Research", jobTitle: "Research Analyst" })) {
    return;
  }
  await Experience.create({
    jobTitle: "Research Analyst",
    organisation: "Royal Research",
    isCurrent: false,
    approximateDuration: "2 years and 3 months",
    datePrecision: "duration",
    professionalSummary:
      "Research Analyst experience recorded from the resume. Exact dates and detailed responsibilities can be added by the administrator.",
    responsibilities: [],
    keyAchievements: [],
    researchAreas: [],
    toolsUsed: [],
    isFeatured: true,
    status: "published",
    displayOrder: 1
  });
}

async function seedEducation(): Promise<void> {
  const records = [
    {
      institution: "Hygia Institute of Pharmaceutical Education and Research",
      qualification: "Bachelor of Pharmacy",
      startDate: "2019",
      completionDate: "2023",
      datePrecision: "year",
      displayOrder: 1
    },
    {
      institution: "Veer Bahadur Singh Purvanchal University",
      qualification: "Bachelor of Science",
      startDate: "2017",
      completionDate: "2020",
      datePrecision: "year",
      displayOrder: 2
    },
    {
      institution: "MMD Public School",
      qualification: "Intermediate, Class XII",
      completionDate: "2017",
      datePrecision: "year",
      displayOrder: 3
    },
    {
      institution: "MMD Public School",
      qualification: "High School, Class X",
      completionDate: "2015",
      datePrecision: "year",
      displayOrder: 4
    }
  ];

  for (const record of records) {
    if (!(await Education.exists({ institution: record.institution, qualification: record.qualification }))) {
      await Education.create({
        ...record,
        grade: "",
        percentage: "",
        subjects: [],
        academicAchievements: [],
        status: "published"
      });
    }
  }
}

async function seedTraining(): Promise<void> {
  if (await Training.exists({ organisation: "Glenmark Pharmaceuticals" })) {
    return;
  }
  await Training.create({
    organisation: "Glenmark Pharmaceuticals",
    trainingTitle: "Industrial Training in Quality Control",
    department: "Quality Control Department",
    trainingType: "Industrial Training",
    location: "Himachal Pradesh, India",
    startDate: "2022-02",
    endDate: "2022-03",
    duration: "45 days",
    description:
      "Completed a 45-day industrial training placement within the Quality Control Department at Glenmark Pharmaceuticals.",
    responsibilities: [],
    learningOutcomes: [],
    skillsDeveloped: [],
    status: "published",
    displayOrder: 1
  });
}

async function seedSkills(): Promise<void> {
  const categories: SkillSeed[] = [
    { category: "Office and productivity", skills: ["Microsoft Office"] },
    { category: "Database", skills: ["MySQL"] },
    { category: "Data analysis and qualitative research", skills: ["SPSS", "NVivo", "Orange"] },
    { category: "Bioinformatics and scientific research", skills: ["BLAST"] },
    { category: "Pharmaceutical and scientific software", skills: ["Marg Software", "ChemDraw"] }
  ];

  let categoryOrder = 1;
  for (const group of categories) {
    const category =
      (await SkillCategory.findOne({ name: group.category })) ??
      (await SkillCategory.create({ name: group.category, displayOrder: categoryOrder }));
    let skillOrder = 1;
    for (const name of group.skills) {
      if (!(await Skill.exists({ name }))) {
        await Skill.create({
          name,
          category: category._id,
          description: "",
          isFeatured: true,
          status: "published",
          displayOrder: skillOrder
        });
      }
      skillOrder += 1;
    }
    categoryOrder += 1;
  }
}

async function seedPersonalSkills(): Promise<void> {
  const skills = [
    "Hard-working",
    "Teamwork",
    "Smart working approach",
    "Flexibility",
    "Positive attitude",
    "Time management",
    "Organisation",
    "Punctuality",
    "Ability to work under pressure",
    "Commitment to quality"
  ];
  let order = 1;
  for (const title of skills) {
    if (!(await PersonalSkill.exists({ title }))) {
      await PersonalSkill.create({ title, status: "published", displayOrder: order });
    }
    order += 1;
  }
}

async function seedLanguages(): Promise<void> {
  const languages = ["Hindi", "English"];
  let order = 1;
  for (const name of languages) {
    if (!(await Language.exists({ name }))) {
      await Language.create({ name, isNative: false, status: "published", displayOrder: order });
    }
    order += 1;
  }
}

async function seedInterests(): Promise<void> {
  const interests = ["Interacting with people", "Watching films", "Listening to music", "Exercise"];
  let order = 1;
  for (const title of interests) {
    if (!(await Interest.exists({ title }))) {
      await Interest.create({ title, status: "published", displayOrder: order });
    }
    order += 1;
  }
}

async function seedProject(): Promise<void> {
  const title = "Pharmaceutical Software Project";
  if (await Project.exists({ title })) {
    return;
  }
  await Project.create({
    title,
    slug: slugify(title, { lower: true, strict: true }),
    shortDescription: "A learning project focused on the use of Marg software and ChemDraw.",
    fullDescription: "",
    category: "Pharmaceutical software",
    duration: "3 months",
    datePrecision: "duration",
    projectStatus: "Completed learning project",
    objectives: [],
    toolsAndTechnologies: ["Marg Software", "ChemDraw"],
    responsibilities: [],
    mainFeatures: [],
    challenges: [],
    solutions: [],
    outcomes: [],
    learningOutcomes: [],
    isFeatured: true,
    status: "published",
    displayOrder: 1,
    seoTitle: "Pharmaceutical Software Project | Ankita Singh",
    seoDescription: "A pharmacy learning project focused on Marg software and ChemDraw.",
    seoKeywords: ["pharmaceutical software", "Marg Software", "ChemDraw"]
  });
}

export async function seed(): Promise<void> {
  await connectDatabase();
  const admin = await createInitialAdmin();
  await seedResume(admin._id);
  const profileImageId = await seedOptionalProfileImage(admin._id);
  await seedProfile(profileImageId);
  await seedFooterSettings();
  await seedExperience();
  await seedEducation();
  await seedTraining();
  await seedSkills();
  await seedPersonalSkills();
  await seedLanguages();
  await seedInterests();
  await seedProject();
  logger.info("Seed/import completed");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void seed()
    .catch((error) => {
      logger.error({ err: error }, "Seed/import failed");
      process.exitCode = 1;
    })
    .finally(async () => {
      await disconnectDatabase();
    });
}
