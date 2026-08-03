import mongoose, { InferSchemaType, Schema } from 'mongoose';

const objectId = Schema.Types.ObjectId;

const publicationStatusField = {
  type: String,
  enum: ['draft', 'published', 'archived'],
  default: 'published',
} as const;

const seoSchema = new Schema(
  {
    title: String,
    description: String,
    keywords: { type: [String], default: [] },
    canonicalUrl: String,
    openGraphImageId: { type: objectId, ref: 'MediaAsset', default: null },
  },
  { _id: false },
);

function applyCommonJsonTransform(schema: Schema): void {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      if (ret._id) {
        ret.id = String(ret._id);
      }
      delete ret._id;
      return ret;
    },
  });
}

const adminSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['owner'], default: 'owner' },
    lastLoginAt: Date,
  },
  { timestamps: true },
);
applyCommonJsonTransform(adminSchema);

const adminSessionSchema = new Schema(
  {
    adminId: { type: objectId, ref: 'Admin', required: true, index: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    isActive: { type: Boolean, default: true, index: true },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
applyCommonJsonTransform(adminSessionSchema);

const refreshTokenSchema = new Schema(
  {
    adminId: { type: objectId, ref: 'Admin', required: true, index: true },
    sessionId: { type: objectId, ref: 'AdminSession', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: Date,
    lastUsedAt: Date,
    replacedByTokenId: { type: objectId, ref: 'RefreshToken', default: null },
    createdByIp: String,
  },
  { timestamps: true },
);
applyCommonJsonTransform(refreshTokenSchema);

const mediaAssetSchema = new Schema(
  {
    gridFsFileId: { type: objectId, required: true, index: true },
    bucketName: { type: String, required: true },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    extension: { type: String, required: true },
    mimeType: { type: String, required: true },
    detectedMimeType: { type: String, required: true },
    size: { type: Number, required: true },
    width: Number,
    height: Number,
    variant: {
      type: String,
      enum: ['thumbnail', 'small', 'medium', 'large', 'original'],
      default: 'original',
    },
    sourceAssetId: { type: objectId, ref: 'MediaAsset', default: null, index: true },
    altText: String,
    caption: String,
    category: {
      type: String,
      enum: [
        'profile-image',
        'hero-image',
        'about-image',
        'logo',
        'favicon',
        'og-image',
        'project-thumbnail',
        'project-gallery',
        'document',
        'resume',
        'certificate-image',
        'certificate-pdf',
        'organisation-logo',
        'institution-logo',
      ],
      required: true,
    },
    associatedModel: String,
    associatedDocumentId: { type: objectId, default: null },
    uploadedByAdminId: { type: objectId, ref: 'Admin', default: null },
    isPublic: { type: Boolean, default: false, index: true },
    checksum: { type: String, required: true, index: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);
mediaAssetSchema.index({ category: 1, createdAt: -1 });
mediaAssetSchema.index({ associatedModel: 1, associatedDocumentId: 1 });
applyCommonJsonTransform(mediaAssetSchema);

const personalProfileSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    preferredName: String,
    professionalTitle: { type: String, required: true },
    rotatingTitles: { type: [String], default: [] },
    shortIntroduction: { type: String, required: true },
    professionalSummary: { type: String, required: true },
    careerObjective: { type: String, required: true },
    generalLocation: { type: String, required: true },
    availability: {
      type: String,
      enum: ['open_to_work', 'selective', 'not_available'],
      default: 'open_to_work',
    },
    profileImageId: { type: objectId, ref: 'MediaAsset', default: null },
    heroImageId: { type: objectId, ref: 'MediaAsset', default: null },
    publicEmail: String,
    publicPhone: String,
    socialLinkIds: [{ type: objectId, ref: 'SocialLink' }],
    activeResumeId: { type: objectId, ref: 'Resume', default: null },
    seo: seoSchema,
    publicationStatus: publicationStatusField,
  },
  { timestamps: true },
);
applyCommonJsonTransform(personalProfileSchema);

const privatePersonalDetailsSchema = new Schema(
  {
    profileId: { type: objectId, ref: 'PersonalProfile', required: true, unique: true },
    privateEmail: String,
    privatePhone: String,
    fullAddress: String,
    dateOfBirth: String,
    parentOrGuardian: String,
    gender: String,
    nationality: String,
    city: String,
    state: String,
    country: String,
    publicProfessionalEmail: String,
    publicProfessionalPhone: String,
    emailIsPublic: { type: Boolean, default: true },
    phoneIsPublic: { type: Boolean, default: true },
    addressIsPublic: { type: Boolean, default: false },
    dateOfBirthIsPublic: { type: Boolean, default: false },
    guardianIsPublic: { type: Boolean, default: false },
    genderIsPublic: { type: Boolean, default: false },
    nationalityIsPublic: { type: Boolean, default: false },
  },
  { timestamps: true },
);
applyCommonJsonTransform(privatePersonalDetailsSchema);

const siteSettingsSchema = new Schema(
  {
    siteName: { type: String, required: true },
    siteTagline: String,
    logoId: { type: objectId, ref: 'MediaAsset', default: null },
    faviconId: { type: objectId, ref: 'MediaAsset', default: null },
    openGraphImageId: { type: objectId, ref: 'MediaAsset', default: null },
    accentColor: { type: String, required: true },
    secondaryAccentColor: { type: String, required: true },
    enableDarkTheme: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    footerText: String,
  },
  { timestamps: true },
);
applyCommonJsonTransform(siteSettingsSchema);

const heroSchema = new Schema(
  {
    eyebrow: String,
    heading: { type: String, required: true },
    subheading: { type: String, required: true },
    highlights: { type: [String], default: [] },
    ctaPrimaryLabel: { type: String, required: true },
    ctaPrimaryHref: { type: String, required: true },
    ctaSecondaryLabel: String,
    ctaSecondaryHref: String,
    heroImageId: { type: objectId, ref: 'MediaAsset', default: null },
    publicationStatus: publicationStatusField,
  },
  { timestamps: true },
);
applyCommonJsonTransform(heroSchema);

const aboutSchema = new Schema(
  {
    fullBiography: { type: String, required: true },
    preferredEmploymentArea: String,
    currentLocation: String,
    availabilityLabel: String,
    keyStrengths: { type: [String], default: [] },
    aboutImageId: { type: objectId, ref: 'MediaAsset', default: null },
    publicationStatus: publicationStatusField,
  },
  { timestamps: true },
);
applyCommonJsonTransform(aboutSchema);

function buildOrderedContentSchema(definition: Record<string, unknown>) {
  const schema = new Schema(
    {
      ...definition,
      publicationStatus: publicationStatusField,
      displayOrder: { type: Number, default: 0, index: true },
    },
    { timestamps: true },
  );

  applyCommonJsonTransform(schema);
  return schema;
}

const experienceSchema = buildOrderedContentSchema({
  jobTitle: { type: String, required: true },
  organisation: { type: String, required: true },
  employmentType: String,
  location: String,
  startDate: String,
  endDate: String,
  isCurrentPosition: { type: Boolean, default: false },
  approximateDuration: String,
  datePrecision: {
    type: String,
    enum: ['exact', 'month', 'year', 'duration'],
    default: 'duration',
  },
  professionalSummary: String,
  responsibilities: { type: [String], default: [] },
  keyAchievements: { type: [String], default: [] },
  researchAreas: { type: [String], default: [] },
  toolsUsed: { type: [String], default: [] },
  organisationLogoId: { type: objectId, ref: 'MediaAsset', default: null },
  featured: { type: Boolean, default: false },
});

const educationSchema = buildOrderedContentSchema({
  institution: { type: String, required: true },
  qualification: { type: String, required: true },
  fieldOfStudy: String,
  startDate: String,
  completionDate: String,
  datePrecision: {
    type: String,
    enum: ['exact', 'month', 'year', 'duration'],
    default: 'year',
  },
  grade: String,
  percentage: String,
  location: String,
  description: String,
  subjects: { type: [String], default: [] },
  academicAchievements: { type: [String], default: [] },
  institutionLogoId: { type: objectId, ref: 'MediaAsset', default: null },
  supportingDocumentId: { type: objectId, ref: 'MediaAsset', default: null },
});

const professionalTrainingSchema = buildOrderedContentSchema({
  organisation: { type: String, required: true },
  trainingTitle: String,
  department: String,
  trainingType: String,
  location: String,
  startDate: String,
  endDate: String,
  duration: String,
  description: String,
  responsibilities: { type: [String], default: [] },
  learningOutcomes: { type: [String], default: [] },
  skillsDeveloped: { type: [String], default: [] },
  certificateImageId: { type: objectId, ref: 'MediaAsset', default: null },
  certificatePdfId: { type: objectId, ref: 'MediaAsset', default: null },
  organisationLogoId: { type: objectId, ref: 'MediaAsset', default: null },
});

const skillCategorySchema = buildOrderedContentSchema({
  name: { type: String, required: true },
  description: String,
});

const skillSchema = buildOrderedContentSchema({
  name: { type: String, required: true },
  categoryId: { type: objectId, ref: 'SkillCategory', required: true, index: true },
  description: String,
  proficiencyLevel: {
    type: String,
    enum: ['beginner', 'familiar', 'intermediate', 'advanced', 'expert'],
    default: null,
  },
  proficiencyPercentage: Number,
  yearsOfExperience: Number,
  icon: String,
  logoId: { type: objectId, ref: 'MediaAsset', default: null },
  featured: { type: Boolean, default: false },
});

const personalSkillSchema = buildOrderedContentSchema({
  title: { type: String, required: true },
  description: String,
});

const projectSchema = buildOrderedContentSchema({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  fullDescription: String,
  category: String,
  duration: String,
  startDate: String,
  completionDate: String,
  datePrecision: {
    type: String,
    enum: ['exact', 'month', 'year', 'duration'],
    default: 'duration',
  },
  status: String,
  objectives: { type: [String], default: [] },
  problemStatement: String,
  methodology: String,
  toolsAndTechnologies: { type: [String], default: [] },
  responsibilities: { type: [String], default: [] },
  mainFeatures: { type: [String], default: [] },
  challenges: { type: [String], default: [] },
  solutions: { type: [String], default: [] },
  outcomes: { type: [String], default: [] },
  learningOutcomes: { type: [String], default: [] },
  thumbnailId: { type: objectId, ref: 'MediaAsset', default: null },
  galleryImageIds: [{ type: objectId, ref: 'MediaAsset' }],
  supportingDocumentIds: [{ type: objectId, ref: 'MediaAsset' }],
  githubUrl: String,
  liveUrl: String,
  caseStudyUrl: String,
  featured: { type: Boolean, default: false },
  seo: seoSchema,
});

const languageSchema = buildOrderedContentSchema({
  name: { type: String, required: true },
  readingProficiency: {
    type: String,
    enum: ['basic', 'conversational', 'professional', 'fluent', 'native'],
    default: null,
  },
  writingProficiency: {
    type: String,
    enum: ['basic', 'conversational', 'professional', 'fluent', 'native'],
    default: null,
  },
  speakingProficiency: {
    type: String,
    enum: ['basic', 'conversational', 'professional', 'fluent', 'native'],
    default: null,
  },
  isNative: { type: Boolean, default: false },
});

const interestSchema = buildOrderedContentSchema({
  title: { type: String, required: true },
  description: String,
  icon: String,
  imageId: { type: objectId, ref: 'MediaAsset', default: null },
});

const certificateSchema = buildOrderedContentSchema({
  title: { type: String, required: true },
  issuingOrganisation: String,
  issueDate: String,
  description: String,
  certificateImageId: { type: objectId, ref: 'MediaAsset', default: null },
  certificatePdfId: { type: objectId, ref: 'MediaAsset', default: null },
});

const resumeSchema = new Schema(
  {
    title: { type: String, required: true },
    versionLabel: { type: String, required: true },
    mediaAssetId: { type: objectId, ref: 'MediaAsset', required: true },
    isActive: { type: Boolean, default: false, index: true },
    archivedAt: { type: Date, default: null },
    publicationStatus: publicationStatusField,
  },
  { timestamps: true },
);
applyCommonJsonTransform(resumeSchema);

const socialLinkSchema = buildOrderedContentSchema({
  label: { type: String, required: true },
  url: { type: String, required: true },
  icon: String,
});

const navigationItemSchema = buildOrderedContentSchema({
  label: { type: String, required: true },
  href: { type: String, required: true },
  opensInNewTab: { type: Boolean, default: false },
});

const contactMessageSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    company: String,
    phone: String,
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['unread', 'read', 'replied', 'archived'],
      default: 'unread',
      index: true,
    },
    ipHash: String,
    userAgent: String,
  },
  { timestamps: true },
);
contactMessageSchema.index({ createdAt: -1, status: 1 });
applyCommonJsonTransform(contactMessageSchema);

const seoSettingsSchema = new Schema(
  {
    defaultTitle: { type: String, required: true },
    defaultDescription: { type: String, required: true },
    defaultKeywords: { type: [String], default: [] },
    defaultOpenGraphImageId: { type: objectId, ref: 'MediaAsset', default: null },
    siteUrl: { type: String, required: true },
  },
  { timestamps: true },
);
applyCommonJsonTransform(seoSettingsSchema);

const auditLogSchema = new Schema(
  {
    adminId: { type: objectId, ref: 'Admin', default: null, index: true },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, required: true, index: true },
    resourceId: { type: objectId, default: null },
    requestId: { type: String, required: true, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);
auditLogSchema.index({ createdAt: -1 });
applyCommonJsonTransform(auditLogSchema);

function getModel<TSchema extends Schema>(name: string, schema: TSchema) {
  return (mongoose.models[name] as mongoose.Model<InferSchemaType<TSchema>>) ||
    mongoose.model<InferSchemaType<TSchema>>(name, schema);
}

export const AdminModel = getModel('Admin', adminSchema);
export const AdminSessionModel = getModel('AdminSession', adminSessionSchema);
export const RefreshTokenModel = getModel('RefreshToken', refreshTokenSchema);
export const MediaAssetModel = getModel('MediaAsset', mediaAssetSchema);
export const PersonalProfileModel = getModel('PersonalProfile', personalProfileSchema);
export const PrivatePersonalDetailsModel = getModel(
  'PrivatePersonalDetails',
  privatePersonalDetailsSchema,
);
export const SiteSettingsModel = getModel('SiteSettings', siteSettingsSchema);
export const HeroModel = getModel('Hero', heroSchema);
export const AboutModel = getModel('About', aboutSchema);
export const ExperienceModel = getModel('Experience', experienceSchema);
export const EducationModel = getModel('Education', educationSchema);
export const ProfessionalTrainingModel = getModel(
  'ProfessionalTraining',
  professionalTrainingSchema,
);
export const SkillCategoryModel = getModel('SkillCategory', skillCategorySchema);
export const SkillModel = getModel('Skill', skillSchema);
export const PersonalSkillModel = getModel('PersonalSkill', personalSkillSchema);
export const ProjectModel = getModel('Project', projectSchema);
export const LanguageModel = getModel('Language', languageSchema);
export const InterestModel = getModel('Interest', interestSchema);
export const CertificateModel = getModel('Certificate', certificateSchema);
export const ResumeModel = getModel('Resume', resumeSchema);
export const SocialLinkModel = getModel('SocialLink', socialLinkSchema);
export const NavigationItemModel = getModel('NavigationItem', navigationItemSchema);
export const ContactMessageModel = getModel('ContactMessage', contactMessageSchema);
export const SeoSettingsModel = getModel('SeoSettings', seoSettingsSchema);
export const AuditLogModel = getModel('AuditLog', auditLogSchema);

export const orderedModels = {
  experience: ExperienceModel,
  education: EducationModel,
  training: ProfessionalTrainingModel,
  skillCategories: SkillCategoryModel,
  skills: SkillModel,
  personalSkills: PersonalSkillModel,
  projects: ProjectModel,
  languages: LanguageModel,
  interests: InterestModel,
  certificates: CertificateModel,
  socialLinks: SocialLinkModel,
  navigation: NavigationItemModel,
};

export const singletonModels = {
  profile: PersonalProfileModel,
  privateDetails: PrivatePersonalDetailsModel,
  siteSettings: SiteSettingsModel,
  hero: HeroModel,
  about: AboutModel,
  seo: SeoSettingsModel,
};

export const mediaReferenceMap: Array<{
  model: mongoose.Model<Record<string, unknown>>;
  fields: string[];
  arrayFields?: string[];
}> = [
  { model: PersonalProfileModel as unknown as mongoose.Model<Record<string, unknown>>, fields: ['profileImageId', 'heroImageId'] },
  { model: HeroModel as unknown as mongoose.Model<Record<string, unknown>>, fields: ['heroImageId'] },
  { model: AboutModel as unknown as mongoose.Model<Record<string, unknown>>, fields: ['aboutImageId'] },
  { model: SiteSettingsModel as unknown as mongoose.Model<Record<string, unknown>>, fields: ['logoId', 'faviconId', 'openGraphImageId'] },
  { model: SeoSettingsModel as unknown as mongoose.Model<Record<string, unknown>>, fields: ['defaultOpenGraphImageId'] },
  { model: ExperienceModel as unknown as mongoose.Model<Record<string, unknown>>, fields: ['organisationLogoId'] },
  { model: EducationModel as unknown as mongoose.Model<Record<string, unknown>>, fields: ['institutionLogoId', 'supportingDocumentId'] },
  {
    model: ProfessionalTrainingModel as unknown as mongoose.Model<Record<string, unknown>>,
    fields: ['certificateImageId', 'certificatePdfId', 'organisationLogoId'],
  },
  { model: SkillModel as unknown as mongoose.Model<Record<string, unknown>>, fields: ['logoId'] },
  {
    model: ProjectModel as unknown as mongoose.Model<Record<string, unknown>>,
    fields: ['thumbnailId'],
    arrayFields: ['galleryImageIds', 'supportingDocumentIds'],
  },
  { model: InterestModel as unknown as mongoose.Model<Record<string, unknown>>, fields: ['imageId'] },
  {
    model: CertificateModel as unknown as mongoose.Model<Record<string, unknown>>,
    fields: ['certificateImageId', 'certificatePdfId'],
  },
  { model: ResumeModel as unknown as mongoose.Model<Record<string, unknown>>, fields: ['mediaAssetId'] },
];

export type AdminDocument = mongoose.HydratedDocument<InferSchemaType<typeof adminSchema>>;
export type MediaAssetDocument = mongoose.HydratedDocument<InferSchemaType<typeof mediaAssetSchema>>;
