# syntax=docker/dockerfile:1
# Backboard web app (Next.js standalone server). Data is read at runtime from
# DATA_DIR, which the pipeline container keeps up to date (see docs/self-hosting.md).

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATA_DIR=/data \
    SEED_DATA_DIR=/app/seed-data \
    DATA_SEASON=2026-27
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
# Fallback data so the app works before the pipeline's first run.
COPY --from=build /app/src/data ./seed-data
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=60s --timeout=5s --start-period=20s \
    CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1
CMD ["node", "server.js"]
