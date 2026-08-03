import { z } from "zod";
export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid MongoDB object ID");
export const slugSchema = z
    .string()
    .min(2)
    .max(140)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens");
export const publicationStatusSchema = z.enum(["draft", "published", "archived"]);
export const datePrecisionSchema = z.enum(["exact", "month", "year", "duration"]);
export const proficiencyLevelSchema = z.enum([
    "beginner",
    "familiar",
    "intermediate",
    "advanced",
    "expert"
]);
const optionalString = z.string().trim().max(5000).optional().or(z.literal(""));
const stringArray = z.array(z.string().trim().min(1).max(500)).default([]);
export const contactMessageSchema = z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(180),
    subject: z.string().trim().min(3).max(180),
    message: z.string().trim().min(10).max(5000)
});
export const footerSettingsSchema = z.object({
    contactEmail: optionalString,
    contactPhone: optionalString,
    contactLocation: optionalString,
    socialLinks: z
        .object({
        website: optionalString,
        github: optionalString,
        linkedin: optionalString,
        instagram: optionalString,
        facebook: optionalString,
        x: optionalString,
        youtube: optionalString
    })
        .default({})
});
export const profileSchema = z.object({
    name: z.string().trim().min(2).max(120),
    heading: z.string().trim().min(3).max(240),
    rotatingTitles: z.array(z.string().trim().min(2).max(120)).min(1).max(12),
    heroIntroduction: z.string().trim().min(10).max(800),
    professionalBiography: z.string().trim().min(20).max(5000),
    careerObjective: z.string().trim().min(10).max(2000),
    professionalSummary: z.string().trim().min(10).max(2000),
    availabilityStatus: z.string().trim().max(160).default("Available for responsible opportunities"),
    preferredEmploymentArea: z.string().trim().max(160).default("Pharmaceutical research and quality-focused roles"),
    currentLocation: z.string().trim().max(160).default("Lucknow, India"),
    keyStrengths: stringArray,
    profileImage: objectIdSchema.optional(),
    heroImage: objectIdSchema.optional(),
    aboutImage: objectIdSchema.optional(),
    logo: objectIdSchema.optional(),
    favicon: objectIdSchema.optional(),
    openGraphImage: objectIdSchema.optional(),
    publicProfessionalEmail: optionalString,
    publicTelephoneNumber: optionalString,
    city: optionalString,
    state: optionalString,
    country: optionalString,
    privateAccountEmail: optionalString,
    privateTelephoneNumber: optionalString,
    fullPrivateAddress: optionalString,
    dateOfBirth: optionalString,
    parentOrGuardian: optionalString,
    gender: optionalString,
    nationality: optionalString,
    visibility: z
        .object({
        publicProfessionalEmail: z.boolean().default(false),
        publicTelephoneNumber: z.boolean().default(false),
        city: z.boolean().default(true),
        state: z.boolean().default(true),
        country: z.boolean().default(true),
        privateAccountEmail: z.boolean().default(false),
        privateTelephoneNumber: z.boolean().default(false),
        fullPrivateAddress: z.boolean().default(false),
        dateOfBirth: z.boolean().default(false),
        parentOrGuardian: z.boolean().default(false),
        gender: z.boolean().default(false),
        nationality: z.boolean().default(false)
    })
        .default({}),
    status: publicationStatusSchema.default("published")
});
export const experienceSchema = z.object({
    jobTitle: z.string().trim().min(2).max(180),
    organisation: z.string().trim().min(2).max(180),
    employmentType: optionalString,
    location: optionalString,
    startDate: optionalString,
    endDate: optionalString,
    isCurrent: z.boolean().default(false),
    approximateDuration: optionalString,
    datePrecision: datePrecisionSchema.default("duration"),
    professionalSummary: optionalString,
    responsibilities: stringArray,
    keyAchievements: stringArray,
    researchAreas: stringArray,
    toolsUsed: stringArray,
    organisationLogo: objectIdSchema.optional(),
    isFeatured: z.boolean().default(false),
    status: publicationStatusSchema.default("published"),
    displayOrder: z.coerce.number().int().default(0)
});
export const educationSchema = z.object({
    institution: z.string().trim().min(2).max(220),
    qualification: z.string().trim().min(2).max(220),
    fieldOfStudy: optionalString,
    startDate: optionalString,
    completionDate: optionalString,
    datePrecision: datePrecisionSchema.default("year"),
    grade: optionalString,
    percentage: optionalString,
    location: optionalString,
    description: optionalString,
    subjects: stringArray,
    academicAchievements: stringArray,
    institutionLogo: objectIdSchema.optional(),
    supportingDocument: objectIdSchema.optional(),
    status: publicationStatusSchema.default("published"),
    displayOrder: z.coerce.number().int().default(0)
});
export const trainingSchema = z.object({
    organisation: z.string().trim().min(2).max(220),
    trainingTitle: z.string().trim().min(2).max(220),
    department: optionalString,
    trainingType: optionalString,
    location: optionalString,
    startDate: optionalString,
    endDate: optionalString,
    duration: optionalString,
    description: optionalString,
    responsibilities: stringArray,
    learningOutcomes: stringArray,
    skillsDeveloped: stringArray,
    certificateImage: objectIdSchema.optional(),
    certificatePdf: objectIdSchema.optional(),
    organisationLogo: objectIdSchema.optional(),
    status: publicationStatusSchema.default("published"),
    displayOrder: z.coerce.number().int().default(0)
});
export const skillCategorySchema = z.object({
    name: z.string().trim().min(2).max(120),
    description: optionalString,
    displayOrder: z.coerce.number().int().default(0)
});
export const skillSchema = z.object({
    name: z.string().trim().min(2).max(120),
    category: objectIdSchema,
    description: optionalString,
    proficiencyLevel: proficiencyLevelSchema.optional(),
    proficiencyPercentage: z.coerce.number().int().min(0).max(100).optional(),
    yearsOfExperience: z.coerce.number().min(0).max(80).optional(),
    icon: optionalString,
    logoImage: objectIdSchema.optional(),
    isFeatured: z.boolean().default(false),
    status: publicationStatusSchema.default("published"),
    displayOrder: z.coerce.number().int().default(0)
});
export const personalSkillSchema = z.object({
    title: z.string().trim().min(2).max(120),
    description: optionalString,
    status: publicationStatusSchema.default("published"),
    displayOrder: z.coerce.number().int().default(0)
});
export const languageSchema = z.object({
    name: z.string().trim().min(2).max(80),
    readingProficiency: proficiencyLevelSchema.optional(),
    writingProficiency: proficiencyLevelSchema.optional(),
    speakingProficiency: proficiencyLevelSchema.optional(),
    isNative: z.boolean().default(false),
    displayOrder: z.coerce.number().int().default(0),
    status: publicationStatusSchema.default("published")
});
export const interestSchema = z.object({
    title: z.string().trim().min(2).max(120),
    description: optionalString,
    icon: optionalString,
    image: objectIdSchema.optional(),
    displayOrder: z.coerce.number().int().default(0),
    status: publicationStatusSchema.default("published")
});
export const projectSchema = z.object({
    title: z.string().trim().min(2).max(180),
    slug: slugSchema,
    shortDescription: z.string().trim().min(10).max(500),
    fullDescription: optionalString,
    category: optionalString,
    duration: optionalString,
    startDate: optionalString,
    completionDate: optionalString,
    datePrecision: datePrecisionSchema.default("duration"),
    projectStatus: optionalString,
    objectives: stringArray,
    problemStatement: optionalString,
    methodology: optionalString,
    toolsAndTechnologies: stringArray,
    responsibilities: stringArray,
    mainFeatures: stringArray,
    challenges: stringArray,
    solutions: stringArray,
    outcomes: stringArray,
    learningOutcomes: stringArray,
    thumbnail: objectIdSchema.optional(),
    galleryImages: z.array(objectIdSchema).default([]),
    supportingDocuments: z.array(objectIdSchema).default([]),
    githubUrl: z.string().url().optional().or(z.literal("")),
    liveUrl: z.string().url().optional().or(z.literal("")),
    externalCaseStudyUrl: z.string().url().optional().or(z.literal("")),
    isFeatured: z.boolean().default(false),
    status: publicationStatusSchema.default("published"),
    displayOrder: z.coerce.number().int().default(0),
    seoTitle: optionalString,
    seoDescription: optionalString,
    seoKeywords: stringArray,
    openGraphImage: objectIdSchema.optional()
});
export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(120).optional(),
    status: z.string().trim().max(40).optional(),
    sort: z.string().trim().max(80).optional()
});
export const loginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(8).max(200)
});
export const passwordChangeSchema = z.object({
    currentPassword: z.string().min(8).max(200),
    nextPassword: z
        .string()
        .min(12)
        .max(200)
        .regex(/[a-z]/)
        .regex(/[A-Z]/)
        .regex(/\d/)
        .regex(/[^A-Za-z0-9]/)
});
