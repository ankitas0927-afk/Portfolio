export type PublicationStatus = "draft" | "published" | "archived";
export type DatePrecision = "exact" | "month" | "year" | "duration";
export type ProficiencyLevel = "beginner" | "familiar" | "intermediate" | "advanced" | "expert";
export type MediaBucket =
  | "profileImages"
  | "contentImages"
  | "projectImages"
  | "documents"
  | "resumes"
  | "certificates"
  | "logos";

export type VisibilityField<T> = {
  value: T;
  isPublic: boolean;
};

export type MediaAssetDto = {
  id: string;
  bucketName: MediaBucket;
  originalName: string;
  storedName: string;
  extension: string;
  mimeType: string;
  detectedSignature: string;
  size: number;
  width?: number | undefined;
  height?: number | undefined;
  variant: "thumbnail" | "small" | "medium" | "large" | "original";
  altText?: string | undefined;
  caption?: string | undefined;
  category: string;
  associatedModel?: string | undefined;
  associatedDocumentId?: string | undefined;
  isPublic: boolean;
  checksum: string;
  createdAt: string;
  updatedAt: string;
};

export type ResumeDto = {
  id: string;
  title: string;
  mediaAssetId: string;
  mediaAsset?: MediaAssetDto | undefined;
  isActive: boolean;
  status: PublicationStatus;
  uploadedAt: string;
};

export type ProfileDto = {
  id: string;
  name: string;
  heading: string;
  rotatingTitles: string[];
  heroIntroduction: string;
  professionalBiography: string;
  careerObjective: string;
  professionalSummary: string;
  availabilityStatus: string;
  preferredEmploymentArea: string;
  currentLocation: string;
  keyStrengths: string[];
  profileImage?: MediaAssetDto | undefined;
  heroImage?: MediaAssetDto | undefined;
  aboutImage?: MediaAssetDto | undefined;
  logo?: MediaAssetDto | undefined;
  favicon?: MediaAssetDto | undefined;
  openGraphImage?: MediaAssetDto | undefined;
  publicProfessionalEmail?: string | undefined;
  publicTelephoneNumber?: string | undefined;
  city?: string | undefined;
  state?: string | undefined;
  country?: string | undefined;
  status: PublicationStatus;
};

export type ExperienceDto = {
  id: string;
  jobTitle: string;
  organisation: string;
  employmentType?: string | undefined;
  location?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  isCurrent: boolean;
  approximateDuration?: string | undefined;
  datePrecision: DatePrecision;
  professionalSummary?: string | undefined;
  responsibilities: string[];
  keyAchievements: string[];
  researchAreas: string[];
  toolsUsed: string[];
  organisationLogo?: MediaAssetDto | undefined;
  isFeatured: boolean;
  status: PublicationStatus;
  displayOrder: number;
};

export type EducationDto = {
  id: string;
  institution: string;
  qualification: string;
  fieldOfStudy?: string | undefined;
  startDate?: string | undefined;
  completionDate?: string | undefined;
  datePrecision: DatePrecision;
  grade?: string | undefined;
  percentage?: string | undefined;
  location?: string | undefined;
  description?: string | undefined;
  subjects: string[];
  academicAchievements: string[];
  institutionLogo?: MediaAssetDto | undefined;
  supportingDocument?: MediaAssetDto | undefined;
  status: PublicationStatus;
  displayOrder: number;
};

export type TrainingDto = {
  id: string;
  organisation: string;
  trainingTitle: string;
  department?: string | undefined;
  trainingType?: string | undefined;
  location?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  duration?: string | undefined;
  description?: string | undefined;
  responsibilities: string[];
  learningOutcomes: string[];
  skillsDeveloped: string[];
  certificateImage?: MediaAssetDto | undefined;
  certificatePdf?: MediaAssetDto | undefined;
  organisationLogo?: MediaAssetDto | undefined;
  status: PublicationStatus;
  displayOrder: number;
};

export type SkillCategoryDto = {
  id: string;
  name: string;
  description?: string | undefined;
  displayOrder: number;
};

export type SkillDto = {
  id: string;
  name: string;
  category: SkillCategoryDto;
  description?: string | undefined;
  proficiencyLevel?: ProficiencyLevel | undefined;
  proficiencyPercentage?: number | undefined;
  yearsOfExperience?: number | undefined;
  icon?: string | undefined;
  logoImage?: MediaAssetDto | undefined;
  isFeatured: boolean;
  status: PublicationStatus;
  displayOrder: number;
};

export type FooterSettingsDto = {
  contactEmail?: string | undefined;
  contactPhone?: string | undefined;
  contactLocation?: string | undefined;
  socialLinks: {
    website?: string | undefined;
    github?: string | undefined;
    linkedin?: string | undefined;
    instagram?: string | undefined;
    facebook?: string | undefined;
    x?: string | undefined;
    youtube?: string | undefined;
  };
  updatedAt?: string | undefined;
};

export type PersonalSkillDto = {
  id: string;
  title: string;
  description?: string | undefined;
  status: PublicationStatus;
  displayOrder: number;
};

export type LanguageDto = {
  id: string;
  name: string;
  readingProficiency?: ProficiencyLevel | undefined;
  writingProficiency?: ProficiencyLevel | undefined;
  speakingProficiency?: ProficiencyLevel | undefined;
  isNative: boolean;
  displayOrder: number;
  status: PublicationStatus;
};

export type InterestDto = {
  id: string;
  title: string;
  description?: string | undefined;
  icon?: string | undefined;
  image?: MediaAssetDto | undefined;
  displayOrder: number;
  status: PublicationStatus;
};

export type ProjectDto = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription?: string | undefined;
  category?: string | undefined;
  duration?: string | undefined;
  startDate?: string | undefined;
  completionDate?: string | undefined;
  datePrecision: DatePrecision;
  projectStatus?: string | undefined;
  objectives: string[];
  problemStatement?: string | undefined;
  methodology?: string | undefined;
  toolsAndTechnologies: string[];
  responsibilities: string[];
  mainFeatures: string[];
  challenges: string[];
  solutions: string[];
  outcomes: string[];
  learningOutcomes: string[];
  thumbnail?: MediaAssetDto | undefined;
  galleryImages: MediaAssetDto[];
  supportingDocuments: MediaAssetDto[];
  githubUrl?: string | undefined;
  liveUrl?: string | undefined;
  externalCaseStudyUrl?: string | undefined;
  isFeatured: boolean;
  status: PublicationStatus;
  displayOrder: number;
  seoTitle?: string | undefined;
  seoDescription?: string | undefined;
  seoKeywords: string[];
  openGraphImage?: MediaAssetDto | undefined;
};

export type ContactMessageDto = {
  id: string;
  name: string;
  email: string;
  subject: string;
  status: "unread" | "read" | "replied" | "archived";
  createdAt: string;
};

export type PublicPortfolioDto = {
  profile: ProfileDto | null;
  experiences: ExperienceDto[];
  education: EducationDto[];
  training: TrainingDto[];
  skillCategories: SkillCategoryDto[];
  skills: SkillDto[];
  topSkills: SkillDto[];
  personalSkills: PersonalSkillDto[];
  languages: LanguageDto[];
  interests: InterestDto[];
  projects: ProjectDto[];
  activeResume: ResumeDto | null;
  footer: FooterSettingsDto | null;
};
