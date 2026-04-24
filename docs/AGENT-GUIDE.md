# Agent Guide — particle-turbo

This file is written for AI agents working on this project. It describes the running stack, how live reload works inside Docker, and exactly what action is required for every type of change. Read this before writing or editing any code.

---

## Stack overview

| System | Role | Local URL | Admin URL |
|---|---|---|---|
| **Medusa v2** (`apps/commerce`) | Commerce engine — products, orders, pricing, regions, customers, payments | http://localhost:9000 | http://localhost:9000/app |
| **Strapi v5** (`apps/content`) | CMS — editorial content, page builder, blog, navigation, site settings | http://localhost:1337 | http://localhost:1337/admin |
| **Nuxt 3** (`apps/storefront`) | Storefront + BFF — renders pages, owns server routes, queries both APIs | http://localhost:3000 | — |
| **PostgreSQL** (commerce) | Medusa database | localhost:5432 | — |
| **PostgreSQL** (content) | Strapi database | localhost:5434 | — |
| **Redis** | Medusa job queue and caching | localhost:6379 | — |

**Admin credentials** (from `.env`):
- Medusa: `denis@particleformen.com` / `MEDUSA_ADMIN_PASSWORD`
- Strapi: `denis@particleformen.com` / `STRAPI_ADMIN_INITIAL_PASSWORD`

---

## How the three apps communicate

There is **no sync process** between Medusa and Strapi. The Nuxt server routes (`apps/storefront/server/`) are the only join point:

```
Browser
  → Nuxt server route
      → Medusa Store API  (commerce data: price, inventory)
      → Strapi REST API   (editorial data: sections, SEO, description)
  ← merged response → Browser
```

Join key: **product `handle`** (identical in both Medusa and Strapi, e.g. `particle-face-wash`).

If Strapi has no entry for a handle, the server route returns Medusa-only data with safe defaults.

---

## Container architecture

All app services run inside Docker. Source code is **bind-mounted** from the host into `/workspace` inside each container. This means file changes on disk are immediately visible inside the container without a rebuild.

```
Host filesystem             Container filesystem
─────────────────           ────────────────────
particle-turbo/         →   /workspace/
  apps/commerce/        →   /workspace/apps/commerce/   (working_dir)
  apps/content/         →   /workspace/apps/content/    (working_dir)
  apps/storefront/      →   /workspace/apps/storefront/ (working_dir)
```

Each container runs its own dev server with file-watching enabled:

| Container | Dev command | Hot reload mechanism |
|---|---|---|
| `commerce` | `medusa develop` | Medusa watches `src/**` — restarts on change |
| `content` | `strapi develop` | Strapi watches `src/**` + `config/**` — restarts on change |
| `storefront` | `nuxt dev` | Vite HMR — instant module replacement in browser |

---

## What requires what action

This is the definitive reference. Every type of change maps to exactly one action.

### Medusa (`apps/commerce`)

| What changed | Action required |
|---|---|
| TypeScript source files in `src/` (routes, subscribers, workflows, modules, steps) | **Nothing** — `medusa develop` detects the change and auto-restarts within ~5s |
| `medusa-config.ts` | **`docker compose restart commerce`** — config is loaded at process start |
| `package.json` dependencies added/removed | **`docker compose build --no-cache commerce`** then `docker compose --profile apps up -d` |
| Environment variables in `.env` | **`docker compose restart commerce`** — env is read at container start |
| `compose.yml` environment block for `commerce` | **`docker compose up --force-recreate commerce`** |

### Strapi (`apps/content`)

| What changed | Action required |
|---|---|
| Schema files in `src/api/**/content-types/**/*.json` | **`docker compose restart content`** — Strapi runs DB migrations on restart |
| Component schemas in `src/components/**/*.json` | **`docker compose restart content`** |
| `config/plugins.ts`, `config/middlewares.ts`, `config/server.ts` | **`docker compose restart content`** |
| `config/database.ts` | **`docker compose restart content`** |
| Custom controllers/services/routes in `src/api/**/` TypeScript files | **Nothing** — `strapi develop` auto-reloads |
| `package.json` dependencies added/removed | **`docker compose build --no-cache content`** then restart |
| Environment variables in `.env` | **`docker compose restart content`** |

> **Important:** After any schema change, Strapi performs an automatic DB migration (adds/removes columns). The restart takes ~20–30s. Wait for `Strapi started successfully` in the logs before testing.

### Nuxt (`apps/storefront`)

| What changed | Action required |
|---|---|
| Vue components (`components/`, `pages/`, `layouts/`) | **Nothing** — Vite HMR updates the browser instantly |
| Server routes (`server/api/`, `server/routes/`, `server/middleware/`) | **Nothing** — Nitro watches and reloads server routes automatically |
| `nuxt.config.ts` | **`docker compose restart storefront`** |
| SCSS files in `assets/scss/` | **Nothing** — Vite HMR handles CSS |
| `package.json` dependencies added/removed | **`docker compose build --no-cache storefront`** then restart |
| Environment variables in `.env` | **`docker compose restart storefront`** |

### Infrastructure

| What changed | Action required |
|---|---|
| `.env` values (any service) | Restart the relevant app container(s) |
| `compose.yml` structure / volumes / ports | `docker compose up --force-recreate <service>` |
| `Dockerfile` for any app | `docker compose build --no-cache <service>` then `docker compose up -d <service>` |
| `.npmrc` hoisting rules | `docker compose build --no-cache` (all services) |

---

## Starting and stopping

```powershell
# Start infrastructure only (Postgres × 2, Redis)
docker compose up -d

# Start everything (infra + all 3 apps)
docker compose --profile apps up -d

# Stop everything
docker compose --profile apps down

# View live logs for one service
docker compose logs -f content
docker compose logs -f commerce
docker compose logs -f storefront

# Restart one service (picks up config/schema/env changes)
docker compose restart content
docker compose restart commerce
docker compose restart storefront

# Force recreate (picks up compose.yml changes)
docker compose up --force-recreate content

# Full rebuild (after Dockerfile or package.json changes)
docker compose build --no-cache content
docker compose --profile apps up -d
```

---

## Key file locations

### Medusa (`apps/commerce`)

```
apps/commerce/
  medusa-config.ts              ← Medusa core config (DB URL, Redis, CORS, admin)
  src/
    api/
      middlewares.ts            ← Global request middlewares (currently empty)
      webhooks/                 ← Custom inbound webhook endpoints (e.g. warehouse)
    modules/                    ← Custom Medusa modules (warehouse integration, etc.)
    subscribers/                ← Event subscribers (react to Medusa events)
    workflows/                  ← Medusa workflows + steps (orchestrated business logic)
    jobs/                       ← Scheduled jobs
    scripts/
      seed.ts                   ← DB seed: regions, sales channel (run once)
```

### Strapi (`apps/content`)

```
apps/content/
  config/
    plugins.ts                  ← Plugin config (users-permissions, etc.)
    middlewares.ts              ← HTTP middleware config
    server.ts                   ← Server config (host, port)
    database.ts                 ← DB connection config
  src/
    api/                        ← One folder per collection/single type
      product/
        content-types/product/schema.json   ← Product schema (handle is join key)
      page/                     ← Generic pages (home, faq, contact)
      landing-page/             ← Marketing landing pages
      article/                  ← Blog posts
      article-category/         ← Blog categories
      navigation/               ← Header/footer menus
      site-setting/             ← Global site config (single type)
    components/
      shared/                   ← Reusable components (seo, link, faq-item, etc.)
      sections/                 ← Page builder sections (hero, benefits, faq, etc.)
```

### Nuxt (`apps/storefront`)

```
apps/storefront/
  nuxt.config.ts                ← Nuxt config (SSR, runtime config, SCSS)
  pages/                        ← File-based routing
  components/                   ← Vue components
  layouts/                      ← Page layouts
  server/
    api/                        ← BFF endpoints (query Medusa + Strapi, merge)
    routes/                     ← Additional server routes
    middleware/                 ← Server middleware (auth, locale, etc.)
  assets/scss/                  ← Global SCSS styles
  composables/                  ← Vue composables
```

---

## Strapi schema changes — what actually happens

When you edit a `schema.json` and restart Strapi:

1. Strapi reads all `schema.json` files from disk
2. It diffs the schema against the current DB table structure
3. It runs SQL `ALTER TABLE` migrations automatically (adds columns, drops columns, adds indexes)
4. Server starts

**You never write SQL migrations by hand** for Strapi. Just edit `schema.json` and restart.

**Exception:** If you drop a column that has existing data Strapi considers important, it may refuse. Drop the column from the DB directly first:

```powershell
docker compose exec postgres-content psql -U strapi -d strapi_db -c "ALTER TABLE <table> DROP COLUMN IF EXISTS <column>;"
docker compose restart content
```

---

## Medusa custom code patterns

Custom business logic in Medusa follows this hierarchy:

```
API Route        →  receives HTTP request
Subscriber       →  reacts to Medusa domain event (product.created, order.placed, etc.)
Workflow         →  orchestrates multi-step business logic with compensation (rollback)
  Step           →  atomic unit of work inside a workflow
Module / Service →  owns a domain (e.g. WarehouseService, FulfillmentSyncService)
Scheduled Job    →  runs on a cron schedule
```

New modules must be registered in `medusa-config.ts`:

```typescript
modules: [
  {
    resolve: "./src/modules/warehouse",
    options: { /* ... */ },
  },
]
```

New modules that need to load at startup (before ts-node registers) require a `.js` file alongside the `.ts` file. See `docs/TROUBLESHOOTING.md` issue #4.

---

## How Nuxt talks to Medusa and Strapi

Nuxt server routes are the only code that calls Medusa or Strapi. Never call these APIs directly from Vue components (credentials leak, CORS, caching problems). Always go through a server route.

```typescript
// apps/storefront/server/api/products/[handle].get.ts
export default defineEventHandler(async (event) => {
  const handle = getRouterParam(event, 'handle')

  const [medusaRes, strapiRes] = await Promise.all([
    $fetch(`${process.env.NUXT_PUBLIC_MEDUSA_URL}/store/products?handle=${handle}`, {
      headers: { 'x-publishable-api-key': process.env.NUXT_MEDUSA_API_KEY },
    }),
    $fetch(`${process.env.NUXT_PUBLIC_STRAPI_URL}/api/products?filters[handle][$eq]=${handle}&populate=deep`, {
      headers: { Authorization: `Bearer ${process.env.NUXT_STRAPI_API_TOKEN}` },
    }),
  ])

  return {
    ...medusaRes.products?.[0],
    editorial: strapiRes.data?.[0] ?? null,
  }
})
```

---

## Common mistakes to avoid

| Mistake | Correct approach |
|---|---|
| Editing Strapi schemas via the Content-Type Builder UI | Edit `schema.json` files in `apps/content/src/` directly. The UI generates the same files but they don't get version-controlled if you use the UI |
| Adding a plugin to `config/plugins.ts` without installing the package | Always `pnpm add <package>` in `apps/content/` first, then rebuild |
| Expecting `.env` changes to auto-apply | Always restart the relevant container after `.env` changes |
| Calling Medusa/Strapi APIs from Vue `<script setup>` | Use Nuxt server routes — never expose API keys to the browser |
| Creating a Medusa module without a `.js` stub | Medusa's `require()` at startup can't load `.ts` — create both `.ts` and `.js` |
| Dropping a Strapi column with data via schema.json only | Drop the column in Postgres first, then restart Strapi |

---

## Quick diagnostics

```powershell
# Is everything running?
docker compose ps

# Why did Strapi crash?
docker compose logs content --tail=30

# Why did Medusa crash?
docker compose logs commerce --tail=30

# Is the Medusa API responding?
Invoke-RestMethod http://localhost:9000/health

# Is the Strapi API responding?
Invoke-RestMethod http://localhost:1337/api/products?pagination[pageSize]=1

# How many products in Medusa?
# (requires auth — use Medusa admin or the PowerShell product-creation pattern)

# Run a psql query against Medusa DB
docker compose exec postgres-commerce psql -U medusa -d medusa_db -c "SELECT COUNT(*) FROM product;"

# Run a psql query against Strapi DB
docker compose exec postgres-content psql -U strapi -d strapi_db -c "SELECT COUNT(*) FROM products;"
```

---

## Related docs

| File | Purpose |
|---|---|
| `docs/DEV-PLAN.md` | Full project plan, phase status, confirmed architecture decisions |
| `docs/ONBOARDING.md` | Setting up the project on a new machine |
| `docs/TROUBLESHOOTING.md` | Known issues and their fixes |
| `docs/decisions/` | Architecture Decision Records (ADRs) |
