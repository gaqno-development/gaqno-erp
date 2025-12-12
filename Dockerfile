FROM node:20-alpine AS base
RUN apk add --no-cache git

FROM base AS builder
WORKDIR /app

WORKDIR /app/gaqno-erp
COPY gaqno-erp/package.json ./
COPY gaqno-erp/package-lock.json ./
RUN npm config set fetch-timeout 600000 && \
    npm config set fetch-retries 5 && \
    npm install --legacy-peer-deps

COPY gaqno-erp/ .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/gaqno-erp/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/gaqno-erp/.next/static ./.next/static
RUN mkdir -p ./public

USER nextjs
EXPOSE 3005
ENV PORT=3005
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
