FROM node:24-slim AS base
WORKDIR /app
RUN corepack enable
RUN corepack prepare pnpm@10.14.0 --activate

FROM base AS deps
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/package.json
RUN corepack pnpm install --filter @ankita-portfolio/api... --frozen-lockfile=false

FROM deps AS build
COPY apps/api ./apps/api
RUN corepack pnpm --filter @ankita-portfolio/api build

FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
RUN corepack prepare pnpm@10.14.0 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=deps /app/packages ./packages
EXPOSE 5000
CMD ["node", "apps/api/dist/server.js"]
