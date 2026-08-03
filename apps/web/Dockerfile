FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages ./packages
COPY apps/web ./apps/web

RUN pnpm install --frozen-lockfile
RUN pnpm build:packages && pnpm --filter @ankita-portfolio/web build

EXPOSE 3000
CMD ["pnpm", "--filter", "@ankita-portfolio/web", "start"]
