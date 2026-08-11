import type {
  AboutSection,
  EducationRecord,
  ExperienceRecord,
  HeroSection,
  LanguageRecord,
  ProjectRecord,
  PublicProfile,
  TrainingRecord,
} from '@ankita-portfolio/shared-types';

export const cvFallback = {
  fullName: 'Ankita Singh',
  siteTagline: 'Research Analyst | Pharmacy Graduate',
  professionalTitle: 'Research Analyst | Pharmacy Graduate | Quality Control',
  location: 'Sankrail, Howrah, West Bengal, India',
  publicEmail: 'ankita7003244@gmail.com',
  publicPhone: '+91 6387454579',
  summary:
    'Detail-oriented pharmacy graduate and current Research Analyst at Royal Research with hands-on quality control training, pharmaceutical software exposure, and a disciplined approach to accurate research work.',
  biography:
    'Ankita Singh is a pharmacy graduate and current Research Analyst with 2 years and 3 months of research analysis experience at Royal Research, practical Quality Control training at Glenmark Pharmaceuticals, and working knowledge of pharmaceutical and data analysis tools.',
  heroHighlights: [
    'Current Research Analyst at Royal Research',
    'B.Pharm graduate',
    'Quality Control training at Glenmark Pharmaceuticals',
  ],
  strengths: [
    'Strong adaptability',
    'Positive attitude',
    'Effective time management',
    'Collaborative teamwork',
    'Accuracy under pressure',
  ],
  rotatingTitles: [
    'Research Analyst',
    'Pharmacy Graduate',
    'Quality Control Trainee',
    'Pharmaceutical Software Learner',
  ],
};

export const fallbackProfile: PublicProfile = {
  id: 'fallback-profile',
  fullName: cvFallback.fullName,
  professionalTitle: cvFallback.professionalTitle,
  rotatingTitles: cvFallback.rotatingTitles,
  shortIntroduction:
    'Dedicated pharmacy graduate with research analysis experience, QC training, and practical pharmaceutical software exposure.',
  professionalSummary: cvFallback.summary,
  careerObjective:
    'To secure a research or quality-focused role in a reputed pharmaceutical organization where analytical skills, disciplined work ethic, and accuracy under pressure can support dependable outcomes.',
  generalLocation: cvFallback.location,
  availability: 'open_to_work',
  profileImage: null,
  publicEmail: cvFallback.publicEmail,
  publicPhone: cvFallback.publicPhone,
  activeResumeId: null,
  socialLinks: [],
};

export const fallbackHero: HeroSection = {
  id: 'fallback-hero',
  eyebrow: 'Professional Profile',
  heading: cvFallback.fullName,
  subheading: cvFallback.summary,
  highlights: cvFallback.heroHighlights,
  ctaPrimaryLabel: 'View Resume',
  ctaPrimaryHref: '/resume',
  ctaSecondaryLabel: 'Contact',
  ctaSecondaryHref: '/contact',
  heroImage: null,
  publicationStatus: 'published',
};

export const fallbackAbout: AboutSection = {
  id: 'fallback-about',
  fullBiography: cvFallback.biography,
  preferredEmploymentArea:
    'Research analysis, pharmaceutical quality control, and data-supported evaluation',
  currentLocation: cvFallback.location,
  availabilityLabel: 'Open to suitable opportunities',
  keyStrengths: cvFallback.strengths,
  aboutImage: null,
  publicationStatus: 'published',
};

export const fallbackExperience: ExperienceRecord[] = [
  {
    id: 'fallback-experience-royal-research',
    jobTitle: 'Research Analyst',
    organisation: 'Royal Research',
    employmentType: 'Current role',
    location: 'India',
    isCurrentPosition: true,
    approximateDuration: '2 years and 3 months',
    datePrecision: 'duration',
    professionalSummary:
      'Conducts research analysis and data-driven evaluation across 15-20 projects per month while supporting accurate and timely reporting.',
    responsibilities: [
      'Conduct research analysis and data-driven evaluation across 15-20 projects per month.',
      'Apply structured methodologies to maintain accuracy, consistency, and timely delivery.',
      'Collaborate with cross-functional teams of 4-6 members to streamline reporting processes.',
    ],
    keyAchievements: [
      'Improved report turnaround time by approximately 20%.',
      'Helped reduce reporting errors by approximately 15%.',
    ],
    researchAreas: ['Research analysis', 'Data-driven evaluation', 'Report quality'],
    toolsUsed: ['MS Office', 'SPSS', 'NVivo', 'MySQL', 'Orange Data Mining'],
    organisationLogo: null,
    publicationStatus: 'published',
    displayOrder: 0,
  },
];

export const fallbackEducation: EducationRecord[] = [
  {
    id: 'fallback-education-bpharm',
    institution: 'Hygia Institute of Pharmaceutical Education and Research',
    qualification: 'Bachelor of Pharmacy (B.Pharm)',
    fieldOfStudy: 'Pharmacy',
    startDate: '2019',
    completionDate: '2023',
    datePrecision: 'year',
    description: 'Affiliated to Veer Bahadur Singh Purvanchal University.',
    subjects: [],
    academicAchievements: [],
    institutionLogo: null,
    supportingDocument: null,
    publicationStatus: 'published',
    displayOrder: 0,
  },
  {
    id: 'fallback-education-xii',
    institution: 'MMD Public School',
    qualification: 'Higher Secondary (XII)',
    completionDate: '2017',
    datePrecision: 'year',
    subjects: [],
    academicAchievements: [],
    institutionLogo: null,
    supportingDocument: null,
    publicationStatus: 'published',
    displayOrder: 1,
  },
  {
    id: 'fallback-education-x',
    institution: 'MMD Public School',
    qualification: 'Secondary (X)',
    completionDate: '2015',
    datePrecision: 'year',
    subjects: [],
    academicAchievements: [],
    institutionLogo: null,
    supportingDocument: null,
    publicationStatus: 'published',
    displayOrder: 2,
  },
];

export const fallbackTraining: TrainingRecord[] = [
  {
    id: 'fallback-training-glenmark-qc',
    organisation: 'Glenmark Pharmaceuticals',
    trainingTitle: 'Industrial Trainee',
    department: 'Quality Control (QC) Department',
    trainingType: 'Industrial Training',
    location: 'Baddi, Himachal Pradesh, India',
    startDate: '2022-02',
    endDate: '2022-03',
    duration: '45 days',
    description:
      'Completed a 45-day industrial training program with exposure to sample analysis, quality testing procedures, documentation, GMP practices, and pharmaceutical compliance standards.',
    responsibilities: [
      'Handled 30-50 pharmaceutical samples for analysis during training.',
      'Supported documentation accuracy and compliance-focused quality practices.',
    ],
    learningOutcomes: [
      'Practical exposure to quality testing procedures.',
      'Improved understanding of GMP practices and pharmaceutical compliance expectations.',
    ],
    skillsDeveloped: [
      'Quality Control',
      'GMP awareness',
      'Sample handling',
      'Documentation accuracy',
    ],
    certificateImage: null,
    certificatePdf: null,
    organisationLogo: null,
    publicationStatus: 'published',
    displayOrder: 0,
  },
];

export const fallbackProjects: ProjectRecord[] = [
  {
    id: 'fallback-project-pharmaceutical-software',
    slug: 'pharmaceutical-software-project',
    title: 'Pharmaceutical Software Project',
    shortDescription:
      'Three-month project focused on Marg ERP and ChemDraw for pharmaceutical workflows.',
    fullDescription:
      'A practical learning project focused on Marg ERP for pharmaceutical data management and ChemDraw for chemical structure drawing.',
    category: 'Pharmaceutical software',
    duration: '3 months',
    datePrecision: 'duration',
    objectives: [
      'Build practical familiarity with pharmaceutical data management software.',
      'Use chemical structure drawing tools in a pharmaceutical learning context.',
    ],
    toolsAndTechnologies: ['Marg ERP', 'ChemDraw'],
    responsibilities: [],
    mainFeatures: [],
    challenges: [],
    solutions: [],
    outcomes: [],
    learningOutcomes: [
      'Practical familiarity with Marg ERP for pharmaceutical data management.',
      'Applied ChemDraw for chemical structure drawing.',
    ],
    galleryImages: [],
    supportingDocuments: [],
    featured: true,
    publicationStatus: 'published',
    displayOrder: 0,
  },
];

export const fallbackLanguages: LanguageRecord[] = [
  {
    id: 'fallback-language-hindi',
    name: 'Hindi',
    readingProficiency: 'fluent',
    writingProficiency: 'fluent',
    speakingProficiency: 'fluent',
    isNative: true,
    displayOrder: 0,
    publicationStatus: 'published',
  },
  {
    id: 'fallback-language-english',
    name: 'English',
    readingProficiency: 'professional',
    writingProficiency: 'professional',
    speakingProficiency: 'professional',
    isNative: false,
    displayOrder: 1,
    publicationStatus: 'published',
  },
];
