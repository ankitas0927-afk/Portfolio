export const APP_NAME = 'Ankita Singh Portfolio';
export const API_PREFIX = '/api/v1';

export const GRIDFS_BUCKETS = {
  profileImages: 'profileImages',
  contentImages: 'contentImages',
  projectImages: 'projectImages',
  documents: 'documents',
  resumes: 'resumes',
  certificates: 'certificates',
  logos: 'logos',
} as const;

export const IMAGE_VARIANTS = {
  thumbnail: { width: 160, quality: 72 },
  small: { width: 320, quality: 74 },
  medium: { width: 640, quality: 76 },
  large: { width: 1280, quality: 80 },
  original: { width: null, quality: 84 },
} as const;

export const PUBLIC_COLLECTIONS = [
  'profile',
  'hero',
  'about',
  'experience',
  'education',
  'training',
  'skills',
  'projects',
  'languages',
  'interests',
  'certificates',
  'social-links',
  'navigation',
  'resume',
] as const;

export const ADMIN_NAV_ITEMS = [
  { label: 'Overview', slug: 'overview' },
  { label: 'Profile', slug: 'profile' },
  { label: 'Hero', slug: 'hero' },
  { label: 'About', slug: 'about' },
  { label: 'Experience', slug: 'experience' },
  { label: 'Education', slug: 'education' },
  { label: 'Training', slug: 'training' },
  { label: 'Skills', slug: 'skills' },
  { label: 'Projects', slug: 'projects' },
  { label: 'Languages', slug: 'languages' },
  { label: 'Interests', slug: 'interests' },
  { label: 'Resumes', slug: 'resumes' },
  { label: 'Media Library', slug: 'media' },
  { label: 'Contact Messages', slug: 'contact-messages' },
  { label: 'Social Links', slug: 'social-links' },
  { label: 'Navigation', slug: 'navigation' },
  { label: 'SEO', slug: 'seo' },
  { label: 'Website Settings', slug: 'site-settings' },
  { label: 'Audit Logs', slug: 'audit-logs' },
  { label: 'Administrator Account', slug: 'account' },
] as const;

export const DEFAULT_ACCENT = '#0f766e';
export const DEFAULT_SECONDARY_ACCENT = '#1d4ed8';
