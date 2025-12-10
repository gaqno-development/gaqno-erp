# Shell App - Micro-Frontend Router

The Shell app acts as the main entry point and router for all micro-frontends.

## Architecture

- **Port:** 3000
- **Domain:** `portal.gaqno.com.br` (main entry point)
- **Role:** Routes requests to appropriate micro-frontends based on path

## Local Development

### Using Docker Compose

```bash
# From monorepo root
cd apps/shell
docker-compose up
```

### Using npm

```bash
# From monorepo root
npm run dev --filter=shell
```

## Docker Build

The Dockerfile uses Next.js standalone output for optimal production builds:

1. **Multi-stage build:**
   - `deps`: Installs dependencies
   - `builder`: Builds the app
   - `runner`: Production image

2. **Standalone output:**
   - Includes only necessary dependencies
   - Self-contained server.js
   - Optimized for Docker

### Build Context

The `docker-compose.yml` uses the monorepo root as build context:
```yaml
build:
  context: ../..  # Monorepo root
  dockerfile: apps/shell/Dockerfile
```

## Environment Variables

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

### Service URLs (for routing to other MFEs)
- `AUTH_SERVICE_URL` - Default: `http://localhost:3001`
- `ADMIN_SERVICE_URL` - Default: `http://localhost:3002`
- `AI_SERVICE_URL` - Default: `http://localhost:3003`
- `CRM_SERVICE_URL` - Default: `http://localhost:3004`
- `ERP_SERVICE_URL` - Default: `http://localhost:3005`
- `FINANCE_SERVICE_URL` - Default: `http://localhost:3006`
- `PLATFORM_SERVICE_URL` - Default: `http://localhost:3007`
- `PDV_SERVICE_URL` - Default: `http://localhost:3008`

### For Coolify
Use internal service names:
```env
AUTH_SERVICE_URL=http://auth:3001
ADMIN_SERVICE_URL=http://admin:3002
# ... etc
```

## Routing

The Shell app routes requests based on path patterns:

- `/login`, `/register` → Auth app
- `/admin/*` → Admin app
- `/dashboard/admin/*` → Admin app
- `/dashboard/finance/*` → Finance app
- `/dashboard/crm/*` → CRM app
- `/dashboard/erp/*` → ERP app
- `/dashboard/books/*` → AI app
- `/pdv/*` → PDV app
- `/dashboard/*` → Platform app (fallback)

## Deployment

### Coolify

1. Connect repository
2. Set build context to monorepo root
3. Use `apps/shell/Dockerfile`
4. Configure environment variables
5. Set domain to `portal.gaqno.com.br`

### Manual Docker

```bash
# From monorepo root
docker build -f apps/shell/Dockerfile -t shell-app .
docker run -p 3000:3000 --env-file .env.local shell-app
```

