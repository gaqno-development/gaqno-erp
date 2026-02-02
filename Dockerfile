FROM node:20-alpine AS base
RUN apk add --no-cache git libc6-compat

FROM base AS builder
WORKDIR /app

COPY package.json ./
COPY .npmrc* ./
ARG NPM_TOKEN
RUN if [ -n "$NPM_TOKEN" ]; then \
    printf '%s\n' "@gaqno-development:registry=https://npm.pkg.github.com" "//npm.pkg.github.com/:_authToken=$NPM_TOKEN" > .npmrc; \
    fi
RUN --mount=type=cache,target=/root/.npm \
    npm config set fetch-timeout 1200000 && \
    npm config set fetch-retries 10 && \
    npm install --legacy-peer-deps

COPY . .
RUN mkdir -p public
# PATCH: Fix unused @ts-expect-error in @gaqno-development/frontcore
RUN find node_modules -name useDialogForm.ts -exec sed -i '/@ts-expect-error/d' {} +
RUN npm run build

FROM nginx:alpine AS runner
WORKDIR /app

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/public /usr/share/nginx/html/public

RUN echo 'server { listen 3005; server_name _; root /usr/share/nginx/html; index index.html; \
    location / { try_files $uri $uri/ /index.html; } \
    location /assets { add_header Cache-Control "public, immutable"; add_header Access-Control-Allow-Origin "*"; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 3005
CMD ["nginx", "-g", "daemon off;"]
