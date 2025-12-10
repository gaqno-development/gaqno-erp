FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files (monorepo structure)
COPY package.json package-lock.json* ./
COPY apps/shell/package.json ./apps/shell/
COPY packages/core/package.json ./packages/core/
COPY packages/ui/package.json ./packages/ui/
COPY packages/config/package.json ./packages/config/

# Install dependencies
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Build the app
WORKDIR /app/apps/shell
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public folder
COPY --from=builder /app/apps/shell/public ./public

# Copy standalone build
# Next.js standalone output structure:
# - .next/standalone/apps/shell/ (app code)
# - .next/standalone/node_modules/ (dependencies)
# - .next/standalone/package.json
# - .next/standalone/server.js (entry point)
COPY --from=builder --chown=nextjs:nodejs /app/apps/shell/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/shell/.next/static ./apps/shell/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# The standalone build creates server.js in the root of standalone directory
# Next.js transpiles @repo packages and includes them in standalone/node_modules
CMD ["node", "server.js"]
