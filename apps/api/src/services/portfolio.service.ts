import type {
  EducationDto,
  ExperienceDto,
  InterestDto,
  LanguageDto,
  PersonalSkillDto,
  ProfileDto,
  ProjectDto,
  PublicPortfolioDto,
  ResumeDto,
  SkillCategoryDto,
  SkillDto,
  TrainingDto
} from "@ankita-portfolio/shared-types";
import { Types } from "mongoose";
import { contactMessageSchema } from "@ankita-portfolio/validation";
import { AppError } from "../errors/appError.js";
import {
  ContactMessage,
  Education,
  Experience,
  Interest,
  Language,
  PersonalSkill,
  Profile,
  Project,
  Resume,
  Skill,
  SkillCategory,
  Training
} from "../models/content.js";
import { sha256 } from "../utils/crypto.js";
import { sanitizeRecord } from "../utils/sanitize.js";
import { getFooterSettings } from "./footerSettings.service.js";
import { toMediaDto } from "./media.service.js";

type LeanRecord = Record<string, unknown> & { _id: Types.ObjectId | string };

function idOf(record: LeanRecord): string {
  return record._id instanceof Types.ObjectId ? record._id.toString() : String(record._id);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.length > 0) : [];
}

function asBoolean(value: unknown): boolean {
  return Boolean(value);
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasVisible(visibility: unknown, key: string): boolean {
  return isRecord(visibility) && visibility[key] === true;
}

function media(value: unknown) {
  if (!isRecord(value) || !value._id || value.isPublic !== true) {
    return undefined;
  }
  return toMediaDto(value);
}

function mediaArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => media(item)).filter((item): item is NonNullable<ReturnType<typeof media>> => Boolean(item));
}

function toSkillCategoryDto(record: LeanRecord): SkillCategoryDto {
  return {
    id: idOf(record),
    name: asString(record.name),
    description: asOptionalString(record.description),
    displayOrder: asNumber(record.displayOrder)
  };
}

function toProfileDto(record: LeanRecord): ProfileDto {
  const visibility = record.visibility;
  const city = hasVisible(visibility, "city") ? asOptionalString(record.city) : undefined;
  const state = hasVisible(visibility, "state") ? asOptionalString(record.state) : undefined;
  const country = hasVisible(visibility, "country") ? asOptionalString(record.country) : undefined;
  return {
    id: idOf(record),
    name: asString(record.name),
    heading: asString(record.heading),
    rotatingTitles: asStringArray(record.rotatingTitles),
    heroIntroduction: asString(record.heroIntroduction),
    professionalBiography: asString(record.professionalBiography),
    careerObjective: asString(record.careerObjective),
    professionalSummary: asString(record.professionalSummary),
    availabilityStatus: asString(record.availabilityStatus),
    preferredEmploymentArea: asString(record.preferredEmploymentArea),
    currentLocation: asString(record.currentLocation),
    keyStrengths: asStringArray(record.keyStrengths),
    profileImage: media(record.profileImage),
    heroImage: media(record.heroImage),
    aboutImage: media(record.aboutImage),
    logo: media(record.logo),
    favicon: media(record.favicon),
    openGraphImage: media(record.openGraphImage),
    publicProfessionalEmail: hasVisible(visibility, "publicProfessionalEmail")
      ? asOptionalString(record.publicProfessionalEmail)
      : undefined,
    publicTelephoneNumber: hasVisible(visibility, "publicTelephoneNumber")
      ? asOptionalString(record.publicTelephoneNumber)
      : undefined,
    city,
    state,
    country,
    status: "published"
  };
}

function toExperienceDto(record: LeanRecord): ExperienceDto {
  return {
    id: idOf(record),
    jobTitle: asString(record.jobTitle),
    organisation: asString(record.organisation),
    employmentType: asOptionalString(record.employmentType),
    location: asOptionalString(record.location),
    startDate: asOptionalString(record.startDate),
    endDate: asOptionalString(record.endDate),
    isCurrent: asBoolean(record.isCurrent),
    approximateDuration: asOptionalString(record.approximateDuration),
    datePrecision: asString(record.datePrecision, "duration") as ExperienceDto["datePrecision"],
    professionalSummary: asOptionalString(record.professionalSummary),
    responsibilities: asStringArray(record.responsibilities),
    keyAchievements: asStringArray(record.keyAchievements),
    researchAreas: asStringArray(record.researchAreas),
    toolsUsed: asStringArray(record.toolsUsed),
    organisationLogo: media(record.organisationLogo),
    isFeatured: asBoolean(record.isFeatured),
    status: "published",
    displayOrder: asNumber(record.displayOrder)
  };
}

function toEducationDto(record: LeanRecord): EducationDto {
  return {
    id: idOf(record),
    institution: asString(record.institution),
    qualification: asString(record.qualification),
    fieldOfStudy: asOptionalString(record.fieldOfStudy),
    startDate: asOptionalString(record.startDate),
    completionDate: asOptionalString(record.completionDate),
    datePrecision: asString(record.datePrecision, "year") as EducationDto["datePrecision"],
    grade: asOptionalString(record.grade),
    percentage: asOptionalString(record.percentage),
    location: asOptionalString(record.location),
    description: asOptionalString(record.description),
    subjects: asStringArray(record.subjects),
    academicAchievements: asStringArray(record.academicAchievements),
    institutionLogo: media(record.institutionLogo),
    supportingDocument: media(record.supportingDocument),
    status: "published",
    displayOrder: asNumber(record.displayOrder)
  };
}

function toTrainingDto(record: LeanRecord): TrainingDto {
  return {
    id: idOf(record),
    organisation: asString(record.organisation),
    trainingTitle: asString(record.trainingTitle),
    department: asOptionalString(record.department),
    trainingType: asOptionalString(record.trainingType),
    location: asOptionalString(record.location),
    startDate: asOptionalString(record.startDate),
    endDate: asOptionalString(record.endDate),
    duration: asOptionalString(record.duration),
    description: asOptionalString(record.description),
    responsibilities: asStringArray(record.responsibilities),
    learningOutcomes: asStringArray(record.learningOutcomes),
    skillsDeveloped: asStringArray(record.skillsDeveloped),
    certificateImage: media(record.certificateImage),
    certificatePdf: media(record.certificatePdf),
    organisationLogo: media(record.organisationLogo),
    status: "published",
    displayOrder: asNumber(record.displayOrder)
  };
}

function toSkillDto(record: LeanRecord): SkillDto {
  const category = isRecord(record.category) && record.category._id ? toSkillCategoryDto(record.category as LeanRecord) : {
    id: String(record.category ?? ""),
    name: "Uncategorised",
    displayOrder: 0
  };
  return {
    id: idOf(record),
    name: asString(record.name),
    category,
    description: asOptionalString(record.description),
    proficiencyLevel: asOptionalString(record.proficiencyLevel) as SkillDto["proficiencyLevel"],
    proficiencyPercentage: typeof record.proficiencyPercentage === "number" ? record.proficiencyPercentage : undefined,
    yearsOfExperience: typeof record.yearsOfExperience === "number" ? record.yearsOfExperience : undefined,
    icon: asOptionalString(record.icon),
    logoImage: media(record.logoImage),
    isFeatured: asBoolean(record.isFeatured),
    status: "published",
    displayOrder: asNumber(record.displayOrder)
  };
}

function toPersonalSkillDto(record: LeanRecord): PersonalSkillDto {
  return {
    id: idOf(record),
    title: asString(record.title),
    description: asOptionalString(record.description),
    status: "published",
    displayOrder: asNumber(record.displayOrder)
  };
}

function toLanguageDto(record: LeanRecord): LanguageDto {
  return {
    id: idOf(record),
    name: asString(record.name),
    readingProficiency: asOptionalString(record.readingProficiency) as LanguageDto["readingProficiency"],
    writingProficiency: asOptionalString(record.writingProficiency) as LanguageDto["writingProficiency"],
    speakingProficiency: asOptionalString(record.speakingProficiency) as LanguageDto["speakingProficiency"],
    isNative: asBoolean(record.isNative),
    displayOrder: asNumber(record.displayOrder),
    status: "published"
  };
}

function toInterestDto(record: LeanRecord): InterestDto {
  return {
    id: idOf(record),
    title: asString(record.title),
    description: asOptionalString(record.description),
    icon: asOptionalString(record.icon),
    image: media(record.image),
    displayOrder: asNumber(record.displayOrder),
    status: "published"
  };
}

function toProjectDto(record: LeanRecord): ProjectDto {
  return {
    id: idOf(record),
    title: asString(record.title),
    slug: asString(record.slug),
    shortDescription: asString(record.shortDescription),
    fullDescription: asOptionalString(record.fullDescription),
    category: asOptionalString(record.category),
    duration: asOptionalString(record.duration),
    startDate: asOptionalString(record.startDate),
    completionDate: asOptionalString(record.completionDate),
    datePrecision: asString(record.datePrecision, "duration") as ProjectDto["datePrecision"],
    projectStatus: asOptionalString(record.projectStatus),
    objectives: asStringArray(record.objectives),
    problemStatement: asOptionalString(record.problemStatement),
    methodology: asOptionalString(record.methodology),
    toolsAndTechnologies: asStringArray(record.toolsAndTechnologies),
    responsibilities: asStringArray(record.responsibilities),
    mainFeatures: asStringArray(record.mainFeatures),
    challenges: asStringArray(record.challenges),
    solutions: asStringArray(record.solutions),
    outcomes: asStringArray(record.outcomes),
    learningOutcomes: asStringArray(record.learningOutcomes),
    thumbnail: media(record.thumbnail),
    galleryImages: mediaArray(record.galleryImages),
    supportingDocuments: mediaArray(record.supportingDocuments),
    githubUrl: asOptionalString(record.githubUrl),
    liveUrl: asOptionalString(record.liveUrl),
    externalCaseStudyUrl: asOptionalString(record.externalCaseStudyUrl),
    isFeatured: asBoolean(record.isFeatured),
    status: "published",
    displayOrder: asNumber(record.displayOrder),
    seoTitle: asOptionalString(record.seoTitle),
    seoDescription: asOptionalString(record.seoDescription),
    seoKeywords: asStringArray(record.seoKeywords),
    openGraphImage: media(record.openGraphImage)
  };
}

function compareSkills(a: SkillDto, b: SkillDto): number {
  return (
    Number(b.isFeatured) - Number(a.isFeatured) ||
    a.displayOrder - b.displayOrder ||
    (b.proficiencyPercentage ?? 0) - (a.proficiencyPercentage ?? 0) ||
    a.name.localeCompare(b.name)
  );
}

function toResumeDto(record: LeanRecord): ResumeDto {
  const mediaAsset = isRecord(record.mediaAsset) ? record.mediaAsset : undefined;
  return {
    id: idOf(record),
    title: asString(record.title),
    mediaAssetId:
      mediaAsset && mediaAsset._id
        ? mediaAsset._id instanceof Types.ObjectId
          ? mediaAsset._id.toString()
          : String(mediaAsset._id)
        : String(record.mediaAsset ?? ""),
    mediaAsset: media(mediaAsset),
    isActive: asBoolean(record.isActive),
    status: "published",
    uploadedAt:
      record.uploadedAt instanceof Date
        ? record.uploadedAt.toISOString()
        : record.createdAt instanceof Date
          ? record.createdAt.toISOString()
          : ""
  };
}

export async function getPublicPortfolio(): Promise<PublicPortfolioDto> {
  const [
    profile,
    experiences,
    education,
    training,
    skillCategories,
    skills,
    personalSkills,
    languages,
    interests,
    projects,
    activeResume,
    footer
  ] = await Promise.all([
    Profile.findOne({ status: "published" })
      .populate(["profileImage", "heroImage", "aboutImage", "logo", "favicon", "openGraphImage"])
      .lean<LeanRecord>(),
    Experience.find({ status: "published" }).populate(["organisationLogo"]).sort({ displayOrder: 1 }).lean<LeanRecord[]>(),
    Education.find({ status: "published" })
      .populate(["institutionLogo", "supportingDocument"])
      .sort({ displayOrder: 1 })
      .lean<LeanRecord[]>(),
    Training.find({ status: "published" })
      .populate(["certificateImage", "certificatePdf", "organisationLogo"])
      .sort({ displayOrder: 1 })
      .lean<LeanRecord[]>(),
    SkillCategory.find().sort({ displayOrder: 1 }).lean<LeanRecord[]>(),
    Skill.find({ status: "published" }).populate(["category", "logoImage"]).sort({ displayOrder: 1 }).lean<LeanRecord[]>(),
    PersonalSkill.find({ status: "published" }).sort({ displayOrder: 1 }).lean<LeanRecord[]>(),
    Language.find({ status: "published" }).sort({ displayOrder: 1 }).lean<LeanRecord[]>(),
    Interest.find({ status: "published" }).populate(["image"]).sort({ displayOrder: 1 }).lean<LeanRecord[]>(),
    Project.find({ status: "published" })
      .populate(["thumbnail", "galleryImages", "supportingDocuments", "openGraphImage"])
      .sort({ displayOrder: 1 })
      .lean<LeanRecord[]>(),
    Resume.findOne({ status: "published", isActive: true }).populate(["mediaAsset"]).lean<LeanRecord>(),
    getFooterSettings()
  ]);

  const orderedSkills = skills.map(toSkillDto).sort(compareSkills);
  const topSkills = orderedSkills.slice(0, 6);

  return {
    profile: profile ? toProfileDto(profile) : null,
    experiences: experiences.map(toExperienceDto),
    education: education.map(toEducationDto),
    training: training.map(toTrainingDto),
    skillCategories: skillCategories.map(toSkillCategoryDto),
    skills: orderedSkills,
    topSkills,
    personalSkills: personalSkills.map(toPersonalSkillDto),
    languages: languages.map(toLanguageDto),
    interests: interests.map(toInterestDto),
    projects: projects.map(toProjectDto),
    activeResume: activeResume ? toResumeDto(activeResume) : null,
    footer
  };
}

export async function getPublicProject(slug: string): Promise<ProjectDto> {
  const project = await Project.findOne({ slug, status: "published" })
    .populate(["thumbnail", "galleryImages", "supportingDocuments", "openGraphImage"])
    .lean<LeanRecord>();
  if (!project) {
    throw new AppError(404, "PROJECT_NOT_FOUND", "Project was not found");
  }
  return toProjectDto(project);
}

export async function getActiveResume(): Promise<ResumeDto | null> {
  const resume = await Resume.findOne({ status: "published", isActive: true }).populate(["mediaAsset"]).lean<LeanRecord>();
  return resume ? toResumeDto(resume) : null;
}

export async function submitContactMessage(
  body: unknown,
  ip: string | undefined,
  userAgent: string | undefined,
): Promise<{ id: string; status: "unread" }> {
  const parsed = sanitizeRecord(contactMessageSchema.parse(body));
  const message = await ContactMessage.create({
    ...parsed,
    status: "unread",
    ipHash: ip ? sha256(ip) : undefined,
    userAgent
  });
  return { id: message._id.toString(), status: "unread" };
}

export async function listContactMessages(query: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}): Promise<{ items: Record<string, unknown>[]; total: number; page: number; limit: number }> {
  const filter: Record<string, unknown> = {};
  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }
  if (query.search) {
    filter.$or = [
      { name: new RegExp(query.search, "i") },
      { email: new RegExp(query.search, "i") },
      { subject: new RegExp(query.search, "i") }
    ];
  }
  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    ContactMessage.find(filter)
      .select("-ipHash -userAgent")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .lean<LeanRecord[]>(),
    ContactMessage.countDocuments(filter)
  ]);
  return {
    items: items.map((item) => ({
      id: idOf(item),
      name: item.name,
      email: item.email,
      subject: item.subject,
      message: item.message,
      status: item.status,
      createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : ""
    })),
    total,
    page: query.page,
    limit: query.limit
  };
}

export async function updateContactStatus(
  id: string,
  status: "unread" | "read" | "replied" | "archived",
): Promise<void> {
  const updated = await ContactMessage.findByIdAndUpdate(id, { status }, { new: true });
  if (!updated) {
    throw new AppError(404, "MESSAGE_NOT_FOUND", "Contact message was not found");
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  const deleted = await ContactMessage.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError(404, "MESSAGE_NOT_FOUND", "Contact message was not found");
  }
}

export async function exportContactMessagesCsv(ids: string[]): Promise<string> {
  const messages = await ContactMessage.find({ _id: { $in: ids } })
    .select("name email subject status createdAt")
    .sort({ createdAt: -1 })
    .lean<LeanRecord[]>();
  const header = "name,email,subject,status,createdAt";
  const rows = messages.map((message) =>
    [message.name, message.email, message.subject, message.status, message.createdAt]
      .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
      .join(","),
  );
  return [header, ...rows].join("\n");
}
