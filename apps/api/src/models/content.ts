import { Schema, model, type Document, type Types } from "mongoose";
import type { DatePrecision, ProficiencyLevel, PublicationStatus } from "@ankita-portfolio/shared-types";

export interface ContentDocument extends Document {
  _id: Types.ObjectId;
  status?: PublicationStatus;
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

const mediaRef = { type: Schema.Types.ObjectId, ref: "MediaAsset" };
const stringList = { type: [String], default: [] };
const publication = { type: String, enum: ["draft", "published", "archived"], default: "published", index: true };
const datePrecision = { type: String, enum: ["exact", "month", "year", "duration"], default: "year" };

const visibilitySchema = new Schema(
  {
    publicProfessionalEmail: { type: Boolean, default: false },
    publicTelephoneNumber: { type: Boolean, default: false },
    city: { type: Boolean, default: true },
    state: { type: Boolean, default: true },
    country: { type: Boolean, default: true },
    privateAccountEmail: { type: Boolean, default: false },
    privateTelephoneNumber: { type: Boolean, default: false },
    fullPrivateAddress: { type: Boolean, default: false },
    dateOfBirth: { type: Boolean, default: false },
    parentOrGuardian: { type: Boolean, default: false },
    gender: { type: Boolean, default: false },
    nationality: { type: Boolean, default: false }
  },
  { _id: false },
);

const profileSchema = new Schema<ContentDocument>(
  {
    name: { type: String, required: true, trim: true },
    heading: { type: String, required: true, trim: true },
    rotatingTitles: stringList,
    heroIntroduction: { type: String, required: true, trim: true },
    professionalBiography: { type: String, required: true, trim: true },
    careerObjective: { type: String, required: true, trim: true },
    professionalSummary: { type: String, required: true, trim: true },
    availabilityStatus: { type: String, trim: true },
    preferredEmploymentArea: { type: String, trim: true },
    currentLocation: { type: String, trim: true },
    keyStrengths: stringList,
    profileImage: mediaRef,
    heroImage: mediaRef,
    aboutImage: mediaRef,
    logo: mediaRef,
    favicon: mediaRef,
    openGraphImage: mediaRef,
    publicProfessionalEmail: { type: String, trim: true },
    privateAccountEmail: { type: String, trim: true },
    publicTelephoneNumber: { type: String, trim: true },
    privateTelephoneNumber: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    fullPrivateAddress: { type: String, trim: true },
    dateOfBirth: { type: String, trim: true },
    parentOrGuardian: { type: String, trim: true },
    gender: { type: String, trim: true },
    nationality: { type: String, trim: true },
    visibility: { type: visibilitySchema, default: {} },
    status: publication
  },
  { timestamps: true },
);

const experienceSchema = new Schema<ContentDocument>(
  {
    jobTitle: { type: String, required: true, trim: true, index: true },
    organisation: { type: String, required: true, trim: true, index: true },
    employmentType: { type: String, trim: true },
    location: { type: String, trim: true },
    startDate: { type: String, trim: true },
    endDate: { type: String, trim: true },
    isCurrent: { type: Boolean, default: false },
    approximateDuration: { type: String, trim: true },
    datePrecision: { ...datePrecision, default: "duration" as DatePrecision },
    professionalSummary: { type: String, trim: true },
    responsibilities: stringList,
    keyAchievements: stringList,
    researchAreas: stringList,
    toolsUsed: stringList,
    organisationLogo: mediaRef,
    isFeatured: { type: Boolean, default: false, index: true },
    status: publication,
    displayOrder: { type: Number, default: 0, index: true }
  },
  { timestamps: true },
);

const educationSchema = new Schema<ContentDocument>(
  {
    institution: { type: String, required: true, trim: true, index: true },
    qualification: { type: String, required: true, trim: true },
    fieldOfStudy: { type: String, trim: true },
    startDate: { type: String, trim: true },
    completionDate: { type: String, trim: true },
    datePrecision,
    grade: { type: String, trim: true },
    percentage: { type: String, trim: true },
    location: { type: String, trim: true },
    description: { type: String, trim: true },
    subjects: stringList,
    academicAchievements: stringList,
    institutionLogo: mediaRef,
    supportingDocument: mediaRef,
    status: publication,
    displayOrder: { type: Number, default: 0, index: true }
  },
  { timestamps: true },
);

const trainingSchema = new Schema<ContentDocument>(
  {
    organisation: { type: String, required: true, trim: true, index: true },
    trainingTitle: { type: String, required: true, trim: true },
    department: { type: String, trim: true },
    trainingType: { type: String, trim: true },
    location: { type: String, trim: true },
    startDate: { type: String, trim: true },
    endDate: { type: String, trim: true },
    duration: { type: String, trim: true },
    description: { type: String, trim: true },
    responsibilities: stringList,
    learningOutcomes: stringList,
    skillsDeveloped: stringList,
    certificateImage: mediaRef,
    certificatePdf: mediaRef,
    organisationLogo: mediaRef,
    status: publication,
    displayOrder: { type: Number, default: 0, index: true }
  },
  { timestamps: true },
);

const skillCategorySchema = new Schema<ContentDocument>(
  {
    name: { type: String, required: true, trim: true, unique: true, index: true },
    description: { type: String, trim: true },
    displayOrder: { type: Number, default: 0, index: true }
  },
  { timestamps: true },
);

const skillSchema = new Schema<ContentDocument>(
  {
    name: { type: String, required: true, trim: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: "SkillCategory", required: true, index: true },
    description: { type: String, trim: true },
    proficiencyLevel: {
      type: String,
      enum: ["beginner", "familiar", "intermediate", "advanced", "expert"] satisfies ProficiencyLevel[]
    },
    proficiencyPercentage: { type: Number, min: 0, max: 100 },
    yearsOfExperience: { type: Number, min: 0 },
    icon: { type: String, trim: true },
    logoImage: mediaRef,
    isFeatured: { type: Boolean, default: false, index: true },
    status: publication,
    displayOrder: { type: Number, default: 0, index: true }
  },
  { timestamps: true },
);

const personalSkillSchema = new Schema<ContentDocument>(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    status: publication,
    displayOrder: { type: Number, default: 0, index: true }
  },
  { timestamps: true },
);

const languageSchema = new Schema<ContentDocument>(
  {
    name: { type: String, required: true, trim: true, index: true },
    readingProficiency: {
      type: String,
      enum: ["beginner", "familiar", "intermediate", "advanced", "expert"] satisfies ProficiencyLevel[]
    },
    writingProficiency: {
      type: String,
      enum: ["beginner", "familiar", "intermediate", "advanced", "expert"] satisfies ProficiencyLevel[]
    },
    speakingProficiency: {
      type: String,
      enum: ["beginner", "familiar", "intermediate", "advanced", "expert"] satisfies ProficiencyLevel[]
    },
    isNative: { type: Boolean, default: false },
    status: publication,
    displayOrder: { type: Number, default: 0, index: true }
  },
  { timestamps: true },
);

const interestSchema = new Schema<ContentDocument>(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    icon: { type: String, trim: true },
    image: mediaRef,
    status: publication,
    displayOrder: { type: Number, default: 0, index: true }
  },
  { timestamps: true },
);

const projectSchema = new Schema<ContentDocument>(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, trim: true, unique: true, index: true },
    shortDescription: { type: String, required: true, trim: true },
    fullDescription: { type: String, trim: true },
    category: { type: String, trim: true, index: true },
    duration: { type: String, trim: true },
    startDate: { type: String, trim: true },
    completionDate: { type: String, trim: true },
    datePrecision: { ...datePrecision, default: "duration" as DatePrecision },
    projectStatus: { type: String, trim: true },
    objectives: stringList,
    problemStatement: { type: String, trim: true },
    methodology: { type: String, trim: true },
    toolsAndTechnologies: stringList,
    responsibilities: stringList,
    mainFeatures: stringList,
    challenges: stringList,
    solutions: stringList,
    outcomes: stringList,
    learningOutcomes: stringList,
    thumbnail: mediaRef,
    galleryImages: [{ type: Schema.Types.ObjectId, ref: "MediaAsset" }],
    supportingDocuments: [{ type: Schema.Types.ObjectId, ref: "MediaAsset" }],
    githubUrl: { type: String, trim: true },
    liveUrl: { type: String, trim: true },
    externalCaseStudyUrl: { type: String, trim: true },
    isFeatured: { type: Boolean, default: false, index: true },
    status: publication,
    displayOrder: { type: Number, default: 0, index: true },
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    seoKeywords: stringList,
    openGraphImage: mediaRef
  },
  { timestamps: true },
);

const resumeSchema = new Schema<ContentDocument>(
  {
    title: { type: String, required: true, trim: true },
    mediaAsset: { type: Schema.Types.ObjectId, ref: "MediaAsset", required: true },
    isActive: { type: Boolean, default: false, index: true },
    status: publication,
    uploadedAt: { type: Date, default: Date.now }
  },
  { timestamps: true },
);

const contactMessageSchema = new Schema<ContentDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 180 },
    subject: { type: String, required: true, trim: true, maxlength: 180 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    status: { type: String, enum: ["unread", "read", "replied", "archived"], default: "unread", index: true },
    ipHash: { type: String, trim: true },
    userAgent: { type: String, trim: true, maxlength: 400 }
  },
  { timestamps: true },
);

contactMessageSchema.index({ createdAt: -1 });

const siteSettingSchema = new Schema<ContentDocument>(
  {
    key: { type: String, required: true, trim: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
    isPublic: { type: Boolean, default: false, index: true }
  },
  { timestamps: true },
);

export const Profile = model<ContentDocument>("Profile", profileSchema);
export const Experience = model<ContentDocument>("Experience", experienceSchema);
export const Education = model<ContentDocument>("Education", educationSchema);
export const Training = model<ContentDocument>("Training", trainingSchema);
export const SkillCategory = model<ContentDocument>("SkillCategory", skillCategorySchema);
export const Skill = model<ContentDocument>("Skill", skillSchema);
export const PersonalSkill = model<ContentDocument>("PersonalSkill", personalSkillSchema);
export const Language = model<ContentDocument>("Language", languageSchema);
export const Interest = model<ContentDocument>("Interest", interestSchema);
export const Project = model<ContentDocument>("Project", projectSchema);
export const Resume = model<ContentDocument>("Resume", resumeSchema);
export const ContactMessage = model<ContentDocument>("ContactMessage", contactMessageSchema);
export const SiteSetting = model<ContentDocument>("SiteSetting", siteSettingSchema);
