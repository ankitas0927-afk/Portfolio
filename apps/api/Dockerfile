FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages ./packages
COPY apps/api ./apps/api

RUN pnpm install --frozen-lockfile
RUN pnpm build:packages && pnpm --filter @ankita-portfolio/api build

EXPOSE 5000
CMD ["node", "apps/api/dist/server.js"]
