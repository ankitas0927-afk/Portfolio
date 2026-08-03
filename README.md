# Ankita Portfolio

Production-ready personal portfolio monorepo for Ankita Singh with:

- Next.js App Router frontend
- Express + TypeScript backend
- MongoDB for structured content
- MongoDB GridFS for images, resumes, PDFs, and documents
- Administrator dashboard with secure authentication
- Public portfolio pages fed from MongoDB only

## Overview

The application is split into:

- `apps/web`: public portfolio and administrator dashboard
- `apps/api`: REST API, authentication, MongoDB models, GridFS uploads/streaming, seed script
- `packages/shared-types`: shared DTO and domain types
- `packages/validation`: shared Zod validation schemas
- `packages/config`: app constants, bucket names, image variants, admin navigation

## Key Features

- Public portfolio pages for about, experience, education, training, projects, contact, and resume
- Secure administrator login with access tokens, refresh-token rotation, and HTTP-only cookie refresh storage
- MongoDB-backed content management for profile, hero, about, experience, education, training, skills, projects, languages, interests, navigation, SEO, and site settings
- GridFS-backed media uploads for images, resumes, PDFs, and documents
- Public/private field separation for sensitive personal data
- Media streaming with content headers, ETag, cache control, and range support
- Seed/import flow based on the supplied resume PDF and extracted profile image
- Docker and Docker Compose support
- CI workflow for lint, typecheck, test, and build

## Directory Structure

```text
ankita-portfolio/
├── apps/
│   ├── api/
│   └── web/
├── packages/
│   ├── config/
│   ├── shared-types/
│   └── validation/
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Environment Configuration

Copy the examples and fill them in:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Important variables:

- Backend:
  - `MONGODB_URI`
  - `JWT_ACCESS_SECRET`
  - `JWT_REFRESH_SECRET`
  - `ADMIN_NAME`
  - `ADMIN_EMAIL`
  - `ADMIN_INITIAL_PASSWORD`
  - `RESUME_PDF_PATH`
- Frontend:
  - `NEXT_PUBLIC_API_BASE_URL`
  - `NEXT_PUBLIC_SITE_URL`
  - `INTERNAL_API_BASE_URL`

`INTERNAL_API_BASE_URL` is used for server-side rendering inside Docker or reverse-proxy deployments. Browser-side requests continue using `NEXT_PUBLIC_API_BASE_URL`.

## Local Development

Install dependencies:

```bash
pnpm install
pnpm rebuild bcrypt sharp esbuild mongodb-memory-server
```

Run both apps:

```bash
pnpm dev
```

Run one side only:

```bash
pnpm dev:api
pnpm dev:web
```

## Seed / Import Process

The API seed script:

1. Creates the first administrator from environment variables if missing.
2. Stores the original resume PDF in GridFS.
3. Stores the extracted profile photo in GridFS.
4. Creates the initial public profile.
5. Seeds experience, education, training, skills, project, languages, interests, navigation, SEO, and site settings.
6. Stores sensitive details separately in `PrivatePersonalDetails`.
7. Does not overwrite existing portfolio content if a profile already exists.

Run it with:

```bash
pnpm seed
```

## Testing Commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

Current automated coverage included in the repo:

- API health check
- Invalid admin login
- Public profile field filtering
- Frontend home-page rendering
- Frontend contact-form validation
- Playwright smoke test scaffold

## Docker

Start the full stack:

```bash
docker compose up --build
```

Services:

- `mongo`: persistent MongoDB container with a named volume
- `api`: Express API on `http://localhost:5000`
- `web`: Next.js web app on `http://localhost:3000`

After the stack is up, run the seed command inside the API container if required:

```bash
docker compose exec api pnpm --filter @ankita-portfolio/api seed
```

## API Summary

### Public routes

- `GET /api/v1/public/site-context`
- `GET /api/v1/public/profile`
- `GET /api/v1/public/hero`
- `GET /api/v1/public/about`
- `GET /api/v1/public/experience`
- `GET /api/v1/public/education`
- `GET /api/v1/public/training`
- `GET /api/v1/public/skills`
- `GET /api/v1/public/projects`
- `GET /api/v1/public/projects/featured`
- `GET /api/v1/public/projects/:slug`
- `GET /api/v1/public/languages`
- `GET /api/v1/public/interests`
- `GET /api/v1/public/certificates`
- `GET /api/v1/public/social-links`
- `GET /api/v1/public/navigation`
- `GET /api/v1/public/resume`
- `GET /api/v1/public/media/:id`
- `POST /api/v1/public/contact`

### Authentication routes

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/logout-all`
- `GET /api/v1/auth/me`
- `GET /api/v1/auth/sessions`
- `DELETE /api/v1/auth/sessions/:id`
- `PATCH /api/v1/auth/change-password`

### Admin examples

- `GET/PATCH /api/v1/admin/profile`
- `GET/PATCH /api/v1/admin/hero`
- `GET/PATCH /api/v1/admin/about`
- CRUD collections under `/api/v1/admin/experience`, `/education`, `/training`, `/projects`, `/languages`, `/interests`, `/skillCategories`, `/skills`, `/personalSkills`, `/socialLinks`, `/navigation`
- Media management under `/api/v1/admin/media`
- Resume management under `/api/v1/admin/resumes`
- Contact messages under `/api/v1/admin/contact-messages`
- Audit logs under `/api/v1/admin/audit-logs`

## Media and GridFS

Binary content is stored in GridFS buckets:

- `profileImages`
- `contentImages`
- `projectImages`
- `documents`
- `resumes`
- `certificates`
- `logos`

The `MediaAsset` collection stores metadata such as bucket name, MIME type, file size, checksums, public/private visibility, and associations to content models.

## Privacy Notes

- Sensitive personal fields are stored separately from public profile data.
- Private values are not returned from public endpoints.
- Refresh tokens are stored in HTTP-only cookies.
- Access tokens are kept in memory on the frontend and refreshed as needed.
- Uploaded files are not persisted to a local uploads folder.

## Backup and Recovery

Because both structured documents and GridFS files live in MongoDB, backups must include normal collections plus GridFS collections:

- `*.files`
- `*.chunks`

Example MongoDB backup:

```bash
mongodump --uri="$MONGODB_URI" --out ./backups/ankita-portfolio-$(date +%Y%m%d-%H%M%S)
```

Restore:

```bash
mongorestore --uri="$MONGODB_URI" ./backups/ankita-portfolio-YYYYMMDD-HHMMSS
```

Recommended operational steps:

1. Schedule regular `mongodump` backups.
2. Verify restore integrity in a non-production database.
3. Keep environment-variable backups separately from database dumps.
4. Recreate indexes after major recovery operations if required.

## Deployment Notes

Recommended production shape:

1. Host MongoDB on Atlas or another managed MongoDB service.
2. Deploy the API behind HTTPS with secure cookies enabled.
3. Deploy the web app from the `apps/web` root directory with the `Next.js` framework preset and both `NEXT_PUBLIC_API_BASE_URL` and `INTERNAL_API_BASE_URL` configured.
4. If deploying the API separately, use the `apps/api` root directory, the `Express` framework preset, and set the build command to `pnpm --dir ../.. build:packages && pnpm run build`.
5. Set `FRONTEND_URL` in the API to the final public frontend origin.
6. Ensure reverse-proxy headers and CORS are aligned.
7. Keep persistent uploads in MongoDB GridFS only.

For production:

- set `COOKIE_SECURE=true`
- set `COOKIE_SAME_SITE=none` when the frontend and API are on different domains
- use strong random JWT secrets
- update `FRONTEND_URL`, `NEXT_PUBLIC_SITE_URL`, and `API_PUBLIC_URL`
- do not set `NODE_ENV` manually on Vercel or other Next.js hosts; let the platform/build command control it
- run `pnpm seed` once after provisioning

## Troubleshooting

- If `sharp` or `bcrypt` fail after install, run `pnpm rebuild bcrypt sharp esbuild mongodb-memory-server`.
- If the web app cannot reach the API in Docker, verify `INTERNAL_API_BASE_URL=http://api:5000/api/v1`.
- If the seed script cannot find the resume PDF, confirm `RESUME_PDF_PATH` is correct relative to `apps/api`.
- If uploads are rejected, check the configured file-size limits and category-specific MIME restrictions.
