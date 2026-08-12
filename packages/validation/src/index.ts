import { z } from 'zod';

export const publicationStatusSchema = z.enum(['draft', 'published', 'archived']);
export const datePrecisionSchema = z.enum(['exact', 'month', 'year', 'duration']);
export const proficiencyLevelSchema = z.enum([
  'beginner',
  'familiar',
  'intermediate',
  'advanced',
  'expert',
]);
export const availabilitySchema = z.enum(['open_to_work', 'selective', 'not_available']);
export const mediaVariantSchema = z.enum(['thumbnail', 'small', 'medium', 'large', 'original']);
export const mediaCategorySchema = z.enum([
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
]);
export const languageProficiencySchema = z.enum([
  'basic',
  'conversational',
  'professional',
  'fluent',
  'native',
]);
export const contactMessageStatusSchema = z.enum(['unread', 'read', 'replied', 'archived']);

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB ObjectId');
export const optionalUrlSchema = z
  .string()
  .trim()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''))
  .transform((value) => value || undefined);
export const optionalEmailSchema = z
  .string()
  .trim()
  .email('Please enter a valid email address')
  .optional()
  .or(z.literal(''))
  .transform((value) => value || undefined);
export const optionalPhoneSchema = z
  .string()
  .trim()
  .min(7, 'Phone number is too short')
  .max(20, 'Phone number is too long')
  .optional()
  .or(z.literal(''))
  .transform((value) => value || undefined);

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  status: publicationStatusSchema.optional(),
  featured: z.coerce.boolean().optional(),
  sortBy: z.string().trim().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const seoFieldsSchema = z.object({
  title: z.string().trim().max(140).optional(),
  description: z.string().trim().max(300).optional(),
  keywords: z.array(z.string().trim().min(1).max(50)).default([]),
  canonicalUrl: optionalUrlSchema,
  openGraphImageId: objectIdSchema.nullish(),
});

export const mediaReferenceSchema = z.object({
  mediaAssetId: objectIdSchema,
  altText: z.string().trim().max(180).optional(),
});

export const socialLinkSchema = z.object({
  label: z.string().trim().min(1).max(80),
  url: z.string().trim().url(),
  icon: z.string().trim().max(60).optional(),
  publicationStatus: publicationStatusSchema.default('published'),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export const navigationItemSchema = z.object({
  label: z.string().trim().min(1).max(80),
  href: z.string().trim().min(1).max(200),
  opensInNewTab: z.coerce.boolean().default(false),
  publicationStatus: publicationStatusSchema.default('published'),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export const personalProfileSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  preferredName: z.string().trim().max(120).optional(),
  professionalTitle: z.string().trim().min(1).max(180),
  rotatingTitles: z.array(z.string().trim().min(1).max(120)).default([]),
  shortIntroduction: z.string().trim().min(1).max(800),
  professionalSummary: z.string().trim().min(1).max(1400),
  careerObjective: z.string().trim().min(1).max(1400),
  generalLocation: z.string().trim().min(1).max(180),
  availability: availabilitySchema.default('open_to_work'),
  profileImageId: objectIdSchema.nullish(),
  heroImageId: objectIdSchema.nullish(),
  publicEmail: optionalEmailSchema,
  publicPhone: optionalPhoneSchema,
  activeResumeId: objectIdSchema.nullish(),
  socialLinkIds: z.array(objectIdSchema).default([]),
  seo: seoFieldsSchema.optional(),
  publicationStatus: publicationStatusSchema.default('published'),
});

export const privatePersonalDetailsSchema = z.object({
  privateEmail: optionalEmailSchema,
  privatePhone: optionalPhoneSchema,
  fullAddress: z.string().trim().max(500).optional(),
  dateOfBirth: z.string().trim().optional(),
  parentOrGuardian: z.string().trim().max(160).optional(),
  gender: z.string().trim().max(60).optional(),
  nationality: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
  state: z.string().trim().max(80).optional(),
  country: z.string().trim().max(80).optional(),
  publicProfessionalEmail: optionalEmailSchema,
  publicProfessionalPhone: optionalPhoneSchema,
  emailIsPublic: z.coerce.boolean().default(true),
  phoneIsPublic: z.coerce.boolean().default(true),
  addressIsPublic: z.coerce.boolean().default(false),
  dateOfBirthIsPublic: z.coerce.boolean().default(false),
  guardianIsPublic: z.coerce.boolean().default(false),
  genderIsPublic: z.coerce.boolean().default(false),
  nationalityIsPublic: z.coerce.boolean().default(false),
});

export const heroSchema = z.object({
  eyebrow: z.string().trim().max(80).optional(),
  heading: z.string().trim().min(1).max(180),
  subheading: z.string().trim().min(1).max(500),
  highlights: z.array(z.string().trim().min(1).max(120)).default([]),
  ctaPrimaryLabel: z.string().trim().min(1).max(60),
  ctaPrimaryHref: z.string().trim().min(1).max(200),
  ctaSecondaryLabel: z.string().trim().max(60).optional(),
  ctaSecondaryHref: z.string().trim().max(200).optional(),
  heroImageId: objectIdSchema.nullish(),
  publicationStatus: publicationStatusSchema.default('published'),
});

export const aboutSchema = z.object({
  fullBiography: z.string().trim().min(1).max(4000),
  preferredEmploymentArea: z.string().trim().max(200).optional(),
  currentLocation: z.string().trim().max(200).optional(),
  availabilityLabel: z.string().trim().max(120).optional(),
  keyStrengths: z.array(z.string().trim().min(1).max(120)).default([]),
  aboutImageId: objectIdSchema.nullish(),
  publicationStatus: publicationStatusSchema.default('published'),
});

export const experienceSchema = z.object({
  jobTitle: z.string().trim().min(1).max(120),
  organisation: z.string().trim().min(1).max(160),
  employmentType: z.string().trim().max(80).optional(),
  location: z.string().trim().max(160).optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  isCurrentPosition: z.coerce.boolean().default(false),
  approximateDuration: z.string().trim().max(120).optional(),
  datePrecision: datePrecisionSchema.default('duration'),
  professionalSummary: z.string().trim().max(1600).optional(),
  responsibilities: z.array(z.string().trim().min(1).max(260)).default([]),
  keyAchievements: z.array(z.string().trim().min(1).max(260)).default([]),
  researchAreas: z.array(z.string().trim().min(1).max(160)).default([]),
  toolsUsed: z.array(z.string().trim().min(1).max(160)).default([]),
  organisationLogoId: objectIdSchema.nullish(),
  featured: z.coerce.boolean().default(false),
  publicationStatus: publicationStatusSchema.default('published'),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export const educationSchema = z.object({
  institution: z.string().trim().min(1).max(180),
  qualification: z.string().trim().min(1).max(180),
  fieldOfStudy: z.string().trim().max(180).optional(),
  startDate: z.string().trim().optional(),
  completionDate: z.string().trim().optional(),
  datePrecision: datePrecisionSchema.default('year'),
  grade: z.string().trim().max(40).optional(),
  percentage: z.string().trim().max(40).optional(),
  location: z.string().trim().max(160).optional(),
  description: z.string().trim().max(1400).optional(),
  subjects: z.array(z.string().trim().min(1).max(120)).default([]),
  academicAchievements: z.array(z.string().trim().min(1).max(200)).default([]),
  institutionLogoId: objectIdSchema.nullish(),
  supportingDocumentId: objectIdSchema.nullish(),
  publicationStatus: publicationStatusSchema.default('published'),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export const trainingSchema = z.object({
  organisation: z.string().trim().min(1).max(180),
  trainingTitle: z.string().trim().max(180).optional(),
  department: z.string().trim().max(160).optional(),
  trainingType: z.string().trim().max(120).optional(),
  location: z.string().trim().max(160).optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  duration: z.string().trim().max(120).optional(),
  description: z.string().trim().max(1600).optional(),
  responsibilities: z.array(z.string().trim().min(1).max(260)).default([]),
  learningOutcomes: z.array(z.string().trim().min(1).max(260)).default([]),
  skillsDeveloped: z.array(z.string().trim().min(1).max(160)).default([]),
  certificateImageId: objectIdSchema.nullish(),
  certificatePdfId: objectIdSchema.nullish(),
  organisationLogoId: objectIdSchema.nullish(),
  publicationStatus: publicationStatusSchema.default('published'),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export const skillCategorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(400).optional(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  publicationStatus: publicationStatusSchema.default('published'),
});

export const skillSchema = z.object({
  name: z.string().trim().min(1).max(120),
  categoryId: objectIdSchema,
  description: z.string().trim().max(600).optional(),
  proficiencyLevel: proficiencyLevelSchema.optional(),
  proficiencyPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  yearsOfExperience: z.coerce.number().min(0).max(60).optional().nullable(),
  icon: z.string().trim().max(60).optional(),
  logoId: objectIdSchema.nullish(),
  featured: z.coerce.boolean().default(false),
  publicationStatus: publicationStatusSchema.default('published'),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export const personalSkillSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(400).optional(),
  publicationStatus: publicationStatusSchema.default('published'),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export const projectSchema = z.object({
  title: z.string().trim().min(1).max(180),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly'),
  shortDescription: z.string().trim().min(1).max(240),
  fullDescription: z.string().trim().max(6000).optional(),
  category: z.string().trim().max(120).optional(),
  duration: z.string().trim().max(120).optional(),
  startDate: z.string().trim().optional(),
  completionDate: z.string().trim().optional(),
  datePrecision: datePrecisionSchema.default('duration'),
  status: z.string().trim().max(80).optional(),
  objectives: z.array(z.string().trim().min(1).max(260)).default([]),
  problemStatement: z.string().trim().max(1000).optional(),
  methodology: z.string().trim().max(1600).optional(),
  toolsAndTechnologies: z.array(z.string().trim().min(1).max(120)).default([]),
  responsibilities: z.array(z.string().trim().min(1).max(260)).default([]),
  mainFeatures: z.array(z.string().trim().min(1).max(260)).default([]),
  challenges: z.array(z.string().trim().min(1).max(260)).default([]),
  solutions: z.array(z.string().trim().min(1).max(260)).default([]),
  outcomes: z.array(z.string().trim().min(1).max(260)).default([]),
  learningOutcomes: z.array(z.string().trim().min(1).max(260)).default([]),
  thumbnailId: objectIdSchema.nullish(),
  galleryImageIds: z.array(objectIdSchema).default([]),
  supportingDocumentIds: z.array(objectIdSchema).default([]),
  githubUrl: optionalUrlSchema,
  liveUrl: optionalUrlSchema,
  caseStudyUrl: optionalUrlSchema,
  featured: z.coerce.boolean().default(false),
  publicationStatus: publicationStatusSchema.default('draft'),
  displayOrder: z.coerce.number().int().min(0).default(0),
  seo: seoFieldsSchema.optional(),
});

export const languageSchema = z.object({
  name: z.string().trim().min(1).max(80),
  readingProficiency: languageProficiencySchema.optional(),
  writingProficiency: languageProficiencySchema.optional(),
  speakingProficiency: languageProficiencySchema.optional(),
  isNative: z.coerce.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).default(0),
  publicationStatus: publicationStatusSchema.default('published'),
});

export const interestSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  icon: z.string().trim().max(60).optional(),
  imageId: objectIdSchema.nullish(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  publicationStatus: publicationStatusSchema.default('published'),
});

export const certificateSchema = z.object({
  title: z.string().trim().min(1).max(180),
  issuingOrganisation: z.string().trim().max(180).optional(),
  issueDate: z.string().trim().optional(),
  description: z.string().trim().max(1200).optional(),
  certificateImageId: objectIdSchema.nullish(),
  certificatePdfId: objectIdSchema.nullish(),
  publicationStatus: publicationStatusSchema.default('published'),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export const resumeSchema = z.object({
  title: z.string().trim().min(1).max(180),
  versionLabel: z.string().trim().min(1).max(120),
  mediaAssetId: objectIdSchema,
  isActive: z.coerce.boolean().default(false),
  publicationStatus: publicationStatusSchema.default('published'),
});

export const siteSettingsSchema = z.object({
  siteName: z.string().trim().min(1).max(120),
  siteTagline: z.string().trim().max(220).optional(),
  logoId: objectIdSchema.nullish(),
  faviconId: objectIdSchema.nullish(),
  openGraphImageId: objectIdSchema.nullish(),
  accentColor: z.string().trim().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  secondaryAccentColor: z
    .string()
    .trim()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  enableDarkTheme: z.coerce.boolean().default(true),
  maintenanceMode: z.coerce.boolean().default(false),
  footerText: z.string().trim().max(240).optional(),
});

export const seoSettingsSchema = z.object({
  defaultTitle: z.string().trim().min(1).max(140),
  defaultDescription: z.string().trim().min(1).max(300),
  defaultKeywords: z.array(z.string().trim().min(1).max(50)).default([]),
  defaultOpenGraphImageId: objectIdSchema.nullish(),
  siteUrl: z.string().trim().url(),
});

export const contactSubmissionSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  company: z.string().trim().max(120).optional(),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(2500),
  phone: optionalPhoneSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z
    .string()
    .min(10, 'Password must be at least 10 characters long')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/\d/, 'Password must include a number')
    .regex(/[^A-Za-z0-9]/, 'Password must include a symbol'),
});

export const reorderSchema = z.object({
  ids: z.array(objectIdSchema).min(1),
});

export const mediaMetadataSchema = z.object({
  altText: z.string().trim().max(180).optional(),
  caption: z.string().trim().max(240).optional(),
  category: mediaCategorySchema.optional(),
  isPublic: z.coerce.boolean().optional(),
  associatedModel: z.string().trim().max(120).optional(),
  associatedDocumentId: objectIdSchema.optional(),
});

export type PersonalProfileInput = z.infer<typeof personalProfileSchema>;
export type PrivatePersonalDetailsInput = z.infer<typeof privatePersonalDetailsSchema>;
export type HeroInput = z.infer<typeof heroSchema>;
export type AboutInput = z.infer<typeof aboutSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type TrainingInput = z.infer<typeof trainingSchema>;
export type SkillCategoryInput = z.infer<typeof skillCategorySchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;
