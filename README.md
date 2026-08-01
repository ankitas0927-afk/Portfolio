# Ankita Singh Portfolio

A production-oriented personal portfolio monorepo for Ankita Singh with a Next.js public site, secure administrator dashboard, Express REST API, MongoDB structured content, and MongoDB GridFS media storage.

## Features

- Public portfolio pages for profile, about, experience, education, training, skills, projects, resume and contact.
- Administrator dashboard for profile editing, content CRUD, media uploads, resume management and contact-message handling.
- MongoDB stores all structured portfolio content.
- GridFS stores resumes, profile images, content images, project images, certificates, documents, logos, favicon and Open Graph images.
- Images are validated by file signature, normalized with Sharp, converted to responsive WebP variants and streamed from GridFS.
- JWT access tokens, HTTP-only refresh cookie rotation, bcrypt password hashing, rate limiting, Helmet, CORS allow-list, request IDs and audit logs.
- Zod validation on shared schemas used by the API and frontend.
- Vitest/Supertest/MongoDB Memory Server backend tests, React Testing Library frontend tests and Playwright E2E scaffolding.
- Docker Compose with MongoDB persistent volume.

## Architecture

```text
ankita-portfolio/
  apps/
    api/        Express, TypeScript, Mongoose, GridFS, auth, seed/import
    web/        Next.js App Router, Tailwind, TanStack Query, admin CMS
  packages/
    config/     Environment validation
    shared-types/
    validation/ Shared Zod schemas
```

## Requirements

- Node.js 24+
- pnpm 10+ via Corepack
- MongoDB 7+ or MongoDB Atlas
- `mongodump` and `mongorestore` for backup scripts

Enable Corepack if needed:

```powershell
corepack enable
corepack prepare pnpm@10.14.0 --activate
```

## Setup

```powershell
cd ankita-portfolio
Copy-Item .env.example .env
corepack pnpm install
docker compose up -d mongo
corepack pnpm seed
corepack pnpm dev
```

If Docker Desktop is not running or you do not have a local MongoDB service yet, skip the `docker compose` line and use the memory-backed API preview instead:

```powershell
corepack pnpm --filter @ankita-portfolio/api dev:memory
corepack pnpm --filter @ankita-portfolio/web dev
```

The seed reads the original PDF from `RESUME_PDF_PATH`. In this workspace the default is:

```env
RESUME_PDF_PATH=../../../Ankita CV edit.pdf
```

If automatic profile-photo extraction is not available, provide a separate image:

```env
PROFILE_IMAGE_PATH=../../../ankita-profile.jpg
```

The administrator can also upload or replace the profile photo from the media library.

## Environment

Backend variables are documented in [apps/api/.env.example](apps/api/.env.example). Frontend variables are documented in [apps/web/.env.example](apps/web/.env.example).

Startup fails when required API configuration is missing or invalid. Keep JWT secrets long, unique and private.

## Seed Import

```powershell
corepack pnpm seed
```

The import process:

- Creates the first administrator from environment variables.
- Stores the original resume PDF in the `resumes` GridFS bucket.
- Creates the active resume document.
- Optionally imports a profile image into `profileImages`.
- Seeds resume-supported profile, experience, education, training, skill, language, interest, personal-skill and project records.
- Stores sensitive fields from environment variables with private visibility by default.
- Avoids overwriting existing profile and active resume records.

## Development

```powershell
corepack pnpm dev          # web and API
corepack pnpm --filter @ankita-portfolio/api dev:memory  # local preview when Docker/MongoDB is unavailable
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test
corepack pnpm build
```

API: `http://localhost:5000`  
Web: `http://localhost:3000`

`dev:memory` starts an ephemeral MongoDB Memory Server, imports the PDF seed and runs the API. It is only for local preview; production must use persistent MongoDB.

## API Overview

Public:

- `GET /api/v1/portfolio`
- `GET /api/v1/profile`
- `GET /api/v1/projects`
- `GET /api/v1/projects/:slug`
- `GET /api/v1/resume/active`
- `GET /api/v1/resume/preview`
- `GET /api/v1/resume/download`
- `GET /api/v1/media/:id/stream`
- `GET /api/v1/media/:id/download`
- `POST /api/v1/contact`

Authentication:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/password`
- `POST /api/v1/auth/revoke-sessions`

Admin content:

- `GET/PATCH /api/v1/admin/profile`
- `GET/POST /api/v1/admin/experiences`
- `GET/POST /api/v1/admin/education`
- `GET/POST /api/v1/admin/training`
- `GET/POST /api/v1/admin/skill-categories`
- `GET/POST /api/v1/admin/skills`
- `GET/POST /api/v1/admin/personal-skills`
- `GET/POST /api/v1/admin/languages`
- `GET/POST /api/v1/admin/interests`
- `GET/POST /api/v1/admin/projects`
- `GET/PATCH/DELETE /api/v1/admin/:resource/:id`

Media:

- `POST /api/v1/admin/media/upload`
- `GET /api/v1/admin/media`
- `GET /api/v1/admin/media/:id`
- `PATCH /api/v1/admin/media/:id`
- `POST /api/v1/admin/media/:id/replace`
- `DELETE /api/v1/admin/media/:id`
- `POST /api/v1/admin/media/cleanup`
- `GET /api/v1/admin/media/storage-statistics`

Resumes:

- `POST /api/v1/admin/resumes`
- `GET /api/v1/admin/resumes`
- `GET /api/v1/admin/resumes/:id`
- `PATCH /api/v1/admin/resumes/:id`
- `PATCH /api/v1/admin/resumes/:id/activate`
- `PATCH /api/v1/admin/resumes/:id/archive`
- `DELETE /api/v1/admin/resumes/:id`

Messages:

- `GET /api/v1/admin/contact-messages`
- `PATCH /api/v1/admin/contact-messages/:id/status`
- `DELETE /api/v1/admin/contact-messages/:id`
- `POST /api/v1/admin/contact-messages/export`

## Privacy

Private fields such as full address, date of birth, parent/guardian information, private email and private telephone are not returned by public APIs. Public pages and structured data are built from filtered public DTOs only. Avoid adding private fields to frontend constants, metadata, logs or analytics.

## GridFS Media

Structured records store only media references. Binary data is stored in GridFS buckets:

- `profileImages`
- `contentImages`
- `projectImages`
- `documents`
- `resumes`
- `certificates`
- `logos`

Each upload creates `MediaAsset` metadata with file signature, MIME type, size, checksum, dimensions, visibility and ownership data. Public streaming routes only serve assets marked public.

## Docker

```powershell
Copy-Item .env.example .env
docker compose up --build
docker compose exec api corepack pnpm seed
```

MongoDB data, including GridFS `.files` and `.chunks`, is preserved in the `mongo-data` volume.

## Backup And Recovery

Backup:

```powershell
$env:MONGODB_URI="mongodb://localhost:27017/ankita_portfolio"
corepack pnpm backup
```

Verify backup contents:

```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/verify-backup.ps1 -BackupDirectory .\backups\ankita-portfolio-YYYYMMDD-HHMMSS
```

Restore:

```powershell
corepack pnpm restore -- -BackupDirectory .\backups\ankita-portfolio-YYYYMMDD-HHMMSS
```

Backups must include normal collections and all GridFS `.files` and `.chunks` collections.

## Deployment

- Deploy the API to a persistent Node.js runtime with HTTPS.
- Deploy the frontend to a Next.js-compatible host.
- For the public portfolio site on Vercel, set the project root to `apps/web`.
- Do not use `apps/api` as the public portfolio root unless you intentionally want the backend service exposed there.
- For Vercel, set the project root to `apps/web` and point `NEXT_PUBLIC_API_BASE_URL` at the API host.
- Set `NEXT_PUBLIC_SITE_URL` to the Vercel production URL or custom domain so metadata and sitemaps stay canonical.
- Use MongoDB Atlas or a managed MongoDB service with backups enabled.
- Set `FRONTEND_URL`, `API_PUBLIC_URL`, cookie flags, JWT secrets and CORS origins for production.
- Put the API behind a reverse proxy that preserves `x-forwarded-for` and HTTPS.
- Keep the current API off Vercel unless you redesign file uploads away from GridFS/memory uploads; Vercel Functions have a 4.5 MB body limit.
- Run `corepack pnpm --filter @ankita-portfolio/api seed` once against the production database.
- Schedule `mongodump` backups and periodically test `mongorestore` into a non-production database.
- Ensure uploaded files never depend on ephemeral deployment disk; GridFS is the persistent media store.

## Security Notes

- Change the initial administrator password immediately after first login.
- Use separate access and refresh secrets.
- Enable secure cookies in production.
- Never log passwords, tokens, private address data or full contact-message content.
- Review audit logs for authentication, content changes, media changes and resume activation.
