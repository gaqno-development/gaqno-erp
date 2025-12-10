FROM node:20-alpine AS base

# Install git for git dependencies
RUN apk add --no-cache git

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files (standalone repository structure)
COPY package.json ./

# Install dependencies
# Note: Using npm install instead of npm ci since package-lock.json may not exist
# @repo packages are installed from git dependencies
RUN npm install --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Build the app
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public folder
COPY --from=builder /app/public ./public

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

