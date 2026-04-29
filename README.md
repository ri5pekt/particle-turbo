# particle-turbo

Headless e-commerce platform built on Nuxt 3, Medusa v2, and Strapi v5.

## Stack

| Layer | Technology |
|---|---|
| Storefront / BFF | Nuxt 3 + Vue 3 + TypeScript |
| Commerce engine | Medusa v2 |
| CMS | Strapi v5 |
| Database (commerce) | PostgreSQL 16 |
| Database (content) | PostgreSQL 16 |
| Cache / infra | Redis 7 |
| Media storage | Cloudflare R2 Object Storage |
| Monorepo | pnpm workspaces + Turborepo |
| Local dev | Docker Compose |

## Local development

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 20](https://nodejs.org/)
- [pnpm 9](https://pnpm.io/installation)

### First-time setup

```bash
# 1. Copy the example env file and fill in values
cp .env.example .env

# 2. Install workspace dependencies
pnpm install

# 3. Start infrastructure services (postgres + redis)
pnpm docker:infra

# 4. Start all services
pnpm docker:up
```

### Local URLs

| Service | URL |
|---|---|
| Storefront | http://localhost:3000 |
| Commerce (Medusa) | http://localhost:9000 |
| Commerce admin | http://localhost:9000/app |
| Content (Strapi) | http://localhost:1337 |
| Strapi admin | http://localhost:1337/admin |

### Media storage

Strapi media uploads and migrated Medusa product images are stored in Cloudflare R2 instead of the local filesystem. Local development, staging, and production should use environment-specific R2 buckets or prefixes so developers do not need to copy `apps/content/public/uploads` between machines.

The local Strapi upload provider uses the S3-compatible R2 API. Browser image requests should resolve directly to the configured public R2 URL, not to `localhost:1337/uploads`.

### Common commands

```bash
# Start only infrastructure (postgres + redis) — use during Phase 0
pnpm docker:infra

# Start full stack
pnpm docker:up

# Stop all containers
pnpm docker:down

# Run dev servers (after apps are scaffolded in Phase 1)
pnpm dev

# Build all apps
pnpm build

# Lint all
pnpm lint

# Type check all
pnpm typecheck
```

## Monorepo structure

```
particle-turbo/
  apps/
    storefront/        # Nuxt 3 — storefront + BFF
    commerce/          # Medusa v2 — commerce engine
    content/           # Strapi v5 — CMS
  packages/
    config-eslint/     # Shared ESLint config
    config-typescript/ # Shared TypeScript config
    types-shared/      # Cross-system TypeScript types
    sdk-commerce/      # Typed Medusa client wrapper
    sdk-content/       # Typed Strapi client wrapper
    utils/             # Shared utilities
  infra/
    docker/            # Dockerfiles (added in Phase 1)
  docs/
    architecture/      # Architecture notes
    decisions/         # Architecture Decision Records (ADRs)
    api-contracts/     # API shape documentation
  scripts/
    migration/         # WooCommerce → Medusa migration scripts
```

## Documentation

- [Dev Plan](docs/DEV-PLAN.md) — phased development plan and architectural constraints
- [Project Description](docs/project-description.md) — original project spec
- [Commerce Flows](docs/COMMERCE-FLOWS.md) — checkout, Braintree, PPU, account, and order-history behavior
- [Architecture Decisions](docs/decisions/) — ADR log
