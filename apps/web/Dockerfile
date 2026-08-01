FROM node:24-slim AS base
WORKDIR /app
RUN corepack enable
RUN corepack prepare pnpm@10.14.0 --activate

FROM base AS deps
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages ./packages
COPY apps/web/package.json ./apps/web/package.json
RUN corepack pnpm install --filter @ankita-portfolio/web... --frozen-lockfile=false

FROM deps AS build
COPY apps/web ./apps/web
RUN corepack pnpm --filter @ankita-portfolio/web build

FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
RUN corepack prepare pnpm@10.14.0 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=build /app/apps/web/.next ./apps/web/.next
COPY --from=build /app/apps/web/public ./apps/web/public
COPY --from=build /app/apps/web/package.json ./apps/web/package.json
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["corepack", "pnpm", "start"]
