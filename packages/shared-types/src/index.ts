export type PublicationStatus = 'draft' | 'published' | 'archived';
export type DatePrecision = 'exact' | 'month' | 'year' | 'duration';
export type ProficiencyLevel = 'beginner' | 'familiar' | 'intermediate' | 'advanced' | 'expert';
export type AvailabilityStatus = 'open_to_work' | 'selective' | 'not_available';
export type MediaVariant = 'thumbnail' | 'small' | 'medium' | 'large' | 'original';
export type MediaCategory =
  | 'profile-image'
  | 'hero-image'
  | 'about-image'
  | 'logo'
  | 'favicon'
  | 'og-image'
  | 'project-thumbnail'
  | 'project-gallery'
  | 'document'
  | 'resume'
  | 'certificate-image'
  | 'certificate-pdf'
  | 'organisation-logo'
  | 'institution-logo';
export type ContactMessageStatus = 'unread' | 'read' | 'replied' | 'archived';
export type LanguageProficiency = 'basic' | 'conversational' | 'professional' | 'fluent' | 'native';

export interface SeoFields {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  openGraphImageId?: string | null;
}

export interface MediaReference {
  id: string;
  publicUrl: string;
  altText?: string;
  originalName?: string;
  extension?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  variant?: MediaVariant;
}

export interface MediaAssetSummary {
  id: string;
  bucketName: string;
  originalName: string;
  extension: string;
  mimeType: string;
  size: number;
  checksum: string;
  width?: number;
  height?: number;
  variant?: MediaVariant;
  category: MediaCategory;
  isPublic: boolean;
  publicUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VisibilityValue<T> {
  value?: T | null;
  isPublic: boolean;
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
  publicationStatus: PublicationStatus;
  displayOrder: number;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  opensInNewTab: boolean;
  publicationStatus: PublicationStatus;
  displayOrder: number;
}

export interface PublicProfile {
  id: string;
  fullName: string;
  preferredName?: string;
  professionalTitle: string;
  rotatingTitles: string[];
  shortIntroduction: string;
  professionalSummary: string;
  careerObjective: string;
  generalLocation: string;
  availability: AvailabilityStatus;
  profileImage?: MediaReference | null;
  publicEmail?: string | null;
  publicPhone?: string | null;
  activeResumeId?: string | null;
  socialLinks: SocialLink[];
  seo?: SeoFields;
}

export interface HeroSection {
  id: string;
  eyebrow?: string;
  heading: string;
  subheading: string;
  highlights: string[];
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
  heroImage?: MediaReference | null;
  publicationStatus: PublicationStatus;
}

export interface AboutSection {
  id: string;
  fullBiography: string;
  preferredEmploymentArea?: string;
  currentLocation?: string;
  availabilityLabel?: string;
  keyStrengths: string[];
  aboutImage?: MediaReference | null;
  publicationStatus: PublicationStatus;
}

export interface ExperienceRecord {
  id: string;
  jobTitle: string;
  organisation: string;
  employmentType?: string;
  location?: string;
  startDate?: string | null;
  endDate?: string | null;
  isCurrentPosition: boolean;
  approximateDuration?: string;
  datePrecision: DatePrecision;
  professionalSummary?: string;
  responsibilities: string[];
  keyAchievements: string[];
  researchAreas: string[];
  toolsUsed: string[];
  organisationLogo?: MediaReference | null;
  publicationStatus: PublicationStatus;
  displayOrder: number;
}

export interface EducationRecord {
  id: string;
  institution: string;
  qualification: string;
  fieldOfStudy?: string;
  startDate?: string | null;
  completionDate?: string | null;
  datePrecision: DatePrecision;
  grade?: string;
  percentage?: string;
  location?: string;
  description?: string;
  subjects: string[];
  academicAchievements: string[];
  institutionLogo?: MediaReference | null;
  supportingDocument?: MediaReference | null;
  publicationStatus: PublicationStatus;
  displayOrder: number;
}

export interface TrainingRecord {
  id: string;
  organisation: string;
  trainingTitle?: string;
  department?: string;
  trainingType?: string;
  location?: string;
  startDate?: string | null;
  endDate?: string | null;
  duration?: string;
  description?: string;
  responsibilities: string[];
  learningOutcomes: string[];
  skillsDeveloped: string[];
  certificateImage?: MediaReference | null;
  certificatePdf?: MediaReference | null;
  organisationLogo?: MediaReference | null;
  publicationStatus: PublicationStatus;
  displayOrder: number;
}

export interface SkillCategoryRecord {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  publicationStatus: PublicationStatus;
}

export interface SkillRecord {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  description?: string;
  proficiencyLevel?: ProficiencyLevel;
  proficiencyPercentage?: number | null;
  yearsOfExperience?: number | null;
  icon?: string;
  logo?: MediaReference | null;
  featured: boolean;
  publicationStatus: PublicationStatus;
  displayOrder: number;
}

export interface PersonalSkillRecord {
  id: string;
  title: string;
  description?: string;
  publicationStatus: PublicationStatus;
  displayOrder: number;
}

export interface ProjectRecord {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription?: string;
  category?: string;
  duration?: string;
  startDate?: string | null;
  completionDate?: string | null;
  datePrecision: DatePrecision;
  status?: string;
  objectives: string[];
  problemStatement?: string;
  methodology?: string;
  toolsAndTechnologies: string[];
  responsibilities: string[];
  mainFeatures: string[];
  challenges: string[];
  solutions: string[];
  outcomes: string[];
  learningOutcomes: string[];
  thumbnail?: MediaReference | null;
  galleryImages: MediaReference[];
  supportingDocuments: MediaReference[];
  githubUrl?: string;
  liveUrl?: string;
  caseStudyUrl?: string;
  featured: boolean;
  publicationStatus: PublicationStatus;
  displayOrder: number;
  seo?: SeoFields;
}

export interface LanguageRecord {
  id: string;
  name: string;
  readingProficiency?: LanguageProficiency;
  writingProficiency?: LanguageProficiency;
  speakingProficiency?: LanguageProficiency;
  isNative: boolean;
  displayOrder: number;
  publicationStatus: PublicationStatus;
}

export interface InterestRecord {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  image?: MediaReference | null;
  displayOrder: number;
  publicationStatus: PublicationStatus;
}

export interface CertificateRecord {
  id: string;
  title: string;
  issuingOrganisation?: string;
  issueDate?: string | null;
  description?: string;
  certificateImage?: MediaReference | null;
  certificatePdf?: MediaReference | null;
  publicationStatus: PublicationStatus;
  displayOrder: number;
}

export interface ResumeRecord {
  id: string;
  title: string;
  versionLabel: string;
  mediaAssetId: string;
  isActive: boolean;
  archivedAt?: string | null;
  publicationStatus: PublicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessageSummary {
  id: string;
  fullName: string;
  email: string;
  company?: string;
  subject: string;
  messagePreview: string;
  status: ContactMessageStatus;
  createdAt: string;
}

export interface DashboardStats {
  publishedProjects: number;
  draftProjects: number;
  experienceRecords: number;
  educationRecords: number;
  trainingRecords: number;
  skills: number;
  resumeVersions: number;
  gridFsFileCount: number;
  mediaStorageUsage: number;
  contactMessages: number;
  unreadContactMessages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    requestId?: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}
