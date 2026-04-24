# particle-turbo — Dev Plan

Last updated: 2026-04-22 (rev 5 — Medusa↔Strapi sync removed; Nuxt handle-based join adopted)

---

## Project references

| Parameter | Value |
|---|---|
| GitHub repo | https://github.com/ri5pekt/particle-turbo.git |
| Local dev — storefront | http://localhost:3000 |
| Local dev — commerce (Medusa) | http://localhost:9000 |
| Local dev — content (Strapi) | http://localhost:1337 |
| Primary branch | `main` |

---

## Confirmed decisions

| Decision | Choice | Notes |
|---|---|---|
| Commerce engine | Medusa **v2** | Module-based architecture, not v1 |
| CMS | Strapi **v5** | Document Service API |
| Storefront styling | Custom **SCSS** | Match existing PHP/CSS site — no UI component lib |
| Cross-system linking key | **Product `handle`** | Nuxt server routes query Medusa and Strapi independently using the same handle string (e.g. `particle-face-wash`). No sync, no shared foreign key, no duplication. |
| WooCommerce compatibility | Deferred | Thin Nuxt server routes when actually needed |
| Production deployment | VPS + Docker Compose | Hostinger or similar, single-server |
| Cloudflare | Staging/prod only | Not needed locally |
| Multi-currency / multi-language | **Yes, required** | Independent prices per region (not converted); Strapi i18n from day one |
| WooCommerce data migration | **Required** | Customers, orders, subscriptions — full migration before go-live |
| URL structure | Must match WooCommerce exactly | SEO preservation; 301 redirects for any paths that must change |
| SEO fidelity | Full parity required | Title, description, canonical, hreflang, JSON-LD, sitemap, robots.txt |
| Accessibility | WCAG 2.1 AA minimum | Built in from day one — not a post-launch task |
| Custom integrations | Fulfillment, address validation, taxes, fraud, tracking, analytics | All must be rewritten; each maps to a specific layer in the new stack |
| Admin roles | Full Admin, E-commerce Manager, Content Manager, Customer Support, Marketing | Separate Medusa + Strapi panels; no unified dashboard in early phases |
| Payment gateways | Braintree (primary), BlueSnap, Afterpay | Medusa v2 payment provider modules; Braintree handles subscription vaults |

---

## Node / package versions to use

| Tool | Version |
|---|---|
| Node.js | 20 LTS |
| pnpm | 9.x |
| Turborepo | latest |
| Nuxt | 3.x (latest stable) |
| Medusa | 2.x (latest stable) |
| Strapi | 5.x (latest stable) |
| TypeScript | 5.x |

---

## Phase 0 — Monorepo skeleton + Docker Compose

**Goal:** A single `docker compose up` boots the full local stack. Repo structure exists. No app code yet.

### 0.1 — Root workspace files

- [ ] `package.json` — root with workspace scripts (`dev`, `build`, `lint`, `typecheck`, `test`, `clean`)
- [ ] `pnpm-workspace.yaml` — declare `apps/*` and `packages/*`
- [ ] `turbo.json` — pipeline config for `dev`, `build`, `lint`, `typecheck`, `test`, `clean`
- [ ] `.nvmrc` / `.node-version` — pin Node 20
- [ ] `.editorconfig`
- [ ] `.gitignore` — node_modules, .env, dist, .turbo, .nuxt, .medusa, etc.
- [ ] `README.md` — project overview + local dev quickstart

### 0.2 — Folder structure

Create the full directory skeleton (empty, with `.gitkeep` where needed):

```
particle-turbo/
  apps/
    storefront/
    commerce/
    content/
  packages/
    config-eslint/
    config-typescript/
    types-shared/
    sdk-commerce/
    sdk-content/
    utils/
  infra/
    docker/
  docs/
    architecture/
    decisions/
    api-contracts/
  scripts/
```

### 0.3 — Docker Compose

File: `infra/docker/compose.yml`

Services:
| Service | Image | Port | Notes |
|---|---|---|---|
| `postgres-commerce` | postgres:16-alpine | 5432 | DB for Medusa |
| `postgres-content` | postgres:16-alpine | 5433 | DB for Strapi |
| `redis` | redis:7-alpine | 6379 | Shared Redis |
| `commerce` | local build | 9000 | Medusa v2 |
| `content` | local build | 1337 | Strapi v5 |
| `storefront` | local build | 3000 | Nuxt 3 |

Rules:
- Source code mounted into containers for live dev
- `commerce` and `content` containers depend_on their respective postgres
- All services on same Docker network
- Health checks on postgres services
- Named volumes for postgres data persistence

### 0.4 — Environment files

- `infra/docker/.env.example` — all variables needed by all services
- Document each variable with a comment

Variables to include:
```
# Postgres - Commerce
POSTGRES_COMMERCE_USER=
POSTGRES_COMMERCE_PASSWORD=
POSTGRES_COMMERCE_DB=

# Postgres - Content
POSTGRES_CONTENT_USER=
POSTGRES_CONTENT_PASSWORD=
POSTGRES_CONTENT_DB=

# Redis
REDIS_URL=redis://redis:6379

# Medusa
MEDUSA_DATABASE_URL=
MEDUSA_REDIS_URL=
MEDUSA_JWT_SECRET=
MEDUSA_COOKIE_SECRET=
MEDUSA_ADMIN_EMAIL=
MEDUSA_ADMIN_PASSWORD=

# Strapi
STRAPI_DATABASE_HOST=
STRAPI_DATABASE_PORT=
STRAPI_DATABASE_NAME=
STRAPI_DATABASE_USERNAME=
STRAPI_DATABASE_PASSWORD=
STRAPI_JWT_SECRET=
STRAPI_APP_KEYS=
STRAPI_API_TOKEN_SALT=
STRAPI_ADMIN_JWT_SECRET=

# Nuxt / Storefront
NUXT_PUBLIC_MEDUSA_URL=http://commerce:9000
NUXT_PUBLIC_STRAPI_URL=http://content:1337
NUXT_MEDUSA_API_KEY=          # Medusa publishable API key (Medusa admin → Settings → API Keys)
NUXT_STRAPI_API_TOKEN=        # Strapi read-only API token (Strapi admin → Settings → API Tokens)
```

### 0.5 — Shared package stubs

Minimal `package.json` for each shared package. No actual code yet, just the scaffolding so pnpm workspace resolves them.

- `packages/config-typescript` — base `tsconfig.json` extended by all apps
- `packages/config-eslint` — shared ESLint flat config
- `packages/types-shared` — placeholder for cross-system TypeScript types
- `packages/sdk-commerce` — placeholder for typed Medusa client wrapper
- `packages/sdk-content` — placeholder for typed Strapi client wrapper
- `packages/utils` — placeholder for shared utilities

### 0.6 — Architecture decision records (ADRs)

Create short markdown files in `docs/decisions/`:

- `001-monorepo-pnpm-turbo.md`
- `002-three-core-apps-only.md`
- `003-storefront-is-bff.md`
- `004-medusa-owns-commerce-truth.md`
- `005-strapi-owns-editorial-truth.md`
- `006-redis-from-day-one.md`
- `007-cloudflare-staging-prod-only.md`
- `008-no-core-modifications.md`
- `009-woo-bridge-deferred.md`
- `010-cross-system-linking-key.md` — product `handle` as natural join key (no sync)

Keep them to ~10 lines each. Purpose, decision, consequences.

### Phase 0 deliverable

- `docker compose up` starts all 6 services without errors
- All service health checks pass
- Monorepo structure is in place
- Workspace dependencies resolve cleanly (`pnpm install` at root works)

---

## Phase 1 — Scaffold core apps

**Goal:** All three apps run inside Docker with live reload. No real features yet.

### 1.1 — Scaffold Medusa v2 app (`apps/commerce`)

- Use `npx create-medusa-app@latest` or manual scaffold
- Configure PostgreSQL and Redis connections
- Expose admin at `/app` and API at `/api`
- Verify: `GET http://localhost:9000/health` returns 200
- Add Dockerfile for local dev (Node base, mount source)

### 1.2 — Scaffold Strapi v5 app (`apps/content`)

- Use `npx create-strapi-app@latest`
- Configure PostgreSQL connection
- Verify: admin panel accessible at `http://localhost:1337/admin`
- Add Dockerfile for local dev
- Enable API tokens for programmatic access from storefront

### 1.3 — Scaffold Nuxt 3 storefront (`apps/storefront`)

- Use `npx nuxi@latest init`
- TypeScript enabled
- Set up SCSS pipeline:
  - Install `sass` (Dart Sass) as dev dependency
  - Create `assets/scss/` directory structure
  - Configure global SCSS imports in `nuxt.config.ts` via `vite.css.preprocessorOptions`
- Minimal Nuxt config with:
  - `ssr: true`
  - `routeRules` stubs for later caching
  - Runtime config wired to env vars (Medusa URL, Strapi URL)
- Add Dockerfile for local dev
- Verify: `http://localhost:3000` renders a placeholder page

### 1.4 — Wire env vars end-to-end

- Ensure Docker Compose passes the right env vars to each service
- Verify each app reads its config correctly at startup

### Phase 1 deliverable

- `docker compose up` → all 3 apps start with live reload
- Medusa health endpoint responds
- Strapi admin is accessible
- Nuxt renders a page

---

## Phase 2 — Define domain model — ✅ Complete

> Full implementation notes and task list have been archived. See the "Status" block below.

### Phase 2 — Status summary

**Completed 2026-04-22. Sync architecture removed 2026-04-22.**

**Key outcomes:**

- 8 Medusa regions configured (US, GB, AU, CA, EU, BR, JP, IL)
- 35 products created in Medusa (title, USD price, full-size image URL, description)
- Strapi `product` content type defined via `schema.json` (version-controlled; no variants — particleformen.com has no product variations)
- 35 matching product entries created in Strapi (same `handle` as Medusa)
- **Medusa↔Strapi sync was built then intentionally removed** — see engineering notes below

**Architecture decision (rev 5):**

The Medusa → Strapi sync module (subscribers, workflows, webhook endpoint, custom module) was removed in favour of a simpler pattern:

> Nuxt server routes query **Medusa** for commerce data and **Strapi** for editorial data independently, using the product `handle` as the natural join key. No sync process, no duplicate data, no fragile integration layer.

```
// apps/storefront/server/api/products/[handle].get.ts (future)
const [medusaProduct, strapiProduct] = await Promise.all([
  $medusa(`/store/products?handle=${handle}`),
  $strapi(`/api/products?filters[handle][$eq]=${handle}&populate=deep`),
])
return { ...medusaProduct, editorial: strapiProduct }
```

If Strapi has no editorial entry for a handle, the route returns Medusa-only data with safe defaults. Strapi product entries are created and enriched manually by content editors — not auto-generated by a sync.

**Engineering notes (lessons learned from Phase 2):**
- `ts-node` must be a devDependency in `apps/commerce` — Medusa's runtime loader uses `require()` to load TypeScript subscribers/workflows without it
- Medusa's `defineConfig` calls `require()` on custom modules at startup before `ts-node` is registered — custom modules need a CommonJS `.js` entry alongside their `.ts` source
- `tsconfig.json` must use `"module": "node16"` + `"moduleResolution": "node16"` to resolve `@medusajs/framework/workflows-sdk` sub-path exports
- Docker Compose does not auto-inject `.env` keys — any env var needed inside a container must be declared explicitly in the `environment:` block of `compose.yml`

---

## Phase 3 — Flexible page builder + storefront scaffold

**Goal:** Every page (home, PDP, landing pages) is composed from an ordered list of sections in Strapi. The Nuxt storefront renders those sections with A/B testing and show/hide support built in.

> **Design decision:** All pages share the same section library. No page has hard-coded layout — everything is a Dynamic Zone. This is the Strapi equivalent of ACF Flexible Content.

---

### 3.1 — Strapi: shared components

Create reusable building blocks in `apps/content/src/components/`:

```
components/
  shared/
    seo.json           ← { seo_title, seo_description, og_image (media) }
    link.json          ← { label, url, target: "self"|"blank" }
    faq-item.json      ← { question, answer (richtext) }
    benefit-item.json  ← { icon (media), headline, body }
    testimonial.json   ← { quote, author, role, avatar (media), rating (1–5) }
    step.json          ← { step_number (int), text, image (media) }
```

Every **section** component also includes three control fields for visibility:

```json
"enabled":        { "type": "boolean", "default": true },
"ab_test_key":    { "type": "string"  },
"ab_test_value":  { "type": "string"  }
```

- `enabled: false` → section hidden everywhere
- `ab_test_key: "variant", ab_test_value: "b"` → section only renders when `?variant=b` is in the URL
- Default traffic (no param) sees the control version; test traffic sees the variant

---

### 3.2 — Strapi: section components

Create in `apps/content/src/components/sections/`:

| Component | Key fields |
|---|---|
| `hero` | headline, subheadline, cta (`link`), background_image, background_video_url |
| `text-image` | body (richtext), image, layout: `"image_left"` \| `"image_right"` |
| `benefits` | title, items (`benefit-item[]` repeatable) |
| `testimonials` | title, items (`testimonial[]` repeatable) |
| `faq` | title, items (`faq-item[]` repeatable) |
| `rich-text` | content (richtext) |
| `cta-banner` | headline, cta (`link`), background_color |
| `video` | url, poster (media), autoplay (boolean) |
| `before-after` | before_image, after_image, caption |
| `how-to-use` | title, steps (`step[]` repeatable) |
| `ingredients` | title, intro (richtext), items (`benefit-item[]` repeatable — reused for icon + name + description) |
| `product-showcase` | title, medusa_handles (text, comma-separated — resolved at runtime by Nuxt), layout: `"grid"` \| `"carousel"` |

Each component JSON lives at `components/sections/<name>.json`.

---

### 3.3 — Strapi: page content types

**`page`** — generic slug-based page (home `/`, any landing page):

```
apps/content/src/api/page/
  content-types/page/
    schema.json   ← { slug (uid, unique), title, seo (shared.seo, single), sections (dynamiczone) }
  controllers/page.ts
  services/page.ts
  routes/page.ts
```

Dynamic zone includes all `sections.*` components.

**`product-page-content`** — editorial enrichment for PDPs (marketing copy on top of Medusa commerce data):

```
apps/content/src/api/product-page-content/
  content-types/product-page-content/
    schema.json   ← { medusaHandle (string, unique), seo (shared.seo, single), sections (dynamiczone) }
```

Nuxt fetches `product-page-content` by `medusaHandle` and merges it with Medusa product data.

---

### 3.4 — Nuxt: section renderer

Create `apps/storefront/components/SectionRenderer.vue` — the single entry point for rendering any page's sections array:

```vue
<!-- loops through sections from Strapi, applies visibility rules -->
<SectionRenderer :sections="page.sections" />
```

Visibility logic (applied per section before render):

```typescript
function isVisible(section: StrapiSection): boolean {
  if (!section.enabled) return false
  if (section.ab_test_key) {
    return route.query[section.ab_test_key] === section.ab_test_value
  }
  return true
}
```

One Vue component per section type:

```
components/sections/
  SectionHero.vue
  SectionTextImage.vue
  SectionBenefits.vue
  SectionTestimonials.vue
  SectionFaq.vue
  SectionRichText.vue
  SectionCtaBanner.vue
  SectionVideo.vue
  SectionBeforeAfter.vue
  SectionHowToUse.vue
  SectionIngredients.vue
  SectionProductShowcase.vue
```

`SectionRenderer` maps `section.__component` (e.g. `"sections.hero"`) to the correct Vue component.

---

### 3.5 — Nuxt: shared SDK packages

Fill in `packages/sdk-commerce` and `packages/sdk-content`:

**`sdk-commerce`** — typed wrapper around `@medusajs/js-sdk`:
- `getProductByHandle(handle)` — fetches product from Medusa Store API
- `listProducts(filters)`, `getCollectionProducts(handle)`, `getCart(id)`, etc.

**`sdk-content`** — typed wrapper around Strapi REST API:
- `getPage(slug)` — fetches `page` content type (used by catch-all route)
- `getProductPageContent(handle)` — fetches `product-page-content` by `medusaHandle`
- `getSiteSettings()`, `getNavigationMenu()`, etc.
- Uses `NUXT_STRAPI_API_TOKEN` (read-only) — never the sync token

**Data fetch pattern per page type:**

| Page | Commerce data | Editorial data |
|---|---|---|
| Homepage (`/`) | None | `sdk-content.getPage("/")` → sections |
| Landing page (`/collections/skincare`) | None | `sdk-content.getPage(slug)` → sections |
| PDP (`/product/[handle]`) | `sdk-commerce.getProductByHandle(handle)` | `sdk-content.getProductPageContent(handle)` → sections |

---

### 3.6 — Nuxt: pages

- `pages/[...slug].vue` — catch-all; fetches `page` from Strapi by slug; renders `<SectionRenderer>`
- `pages/product/[handle].vue` — PDP; fetches from Medusa (price, add-to-cart) + Strapi (sections); renders `<SectionRenderer>` below commerce block
- `pages/product-category/[handle].vue` — category listing (URL matches WooCommerce pattern)

### 3.7 — SCSS setup

- Mirror the structure from the existing PHP/CSS site
- Create `assets/scss/base/`, `assets/scss/components/`, `assets/scss/pages/`
- Global variables / tokens in `assets/scss/variables.scss`
- Import strategy via `nuxt.config.ts` preprocessor options

---

### Phase 3 deliverable

- Strapi has `page` and `product-page-content` content types; section component library is defined
- Nuxt `SectionRenderer` can render any section type with visibility/A/B testing
- Homepage (`/`) and PDP (`/product/[handle]`) render from live data
- SCSS scaffold matches existing site structure
- `pnpm db:seed` or Strapi admin can be used to populate test page content

---

## Phase 4 — Caching v1

**Goal:** Public pages are cache-friendly. Private pages are not cached.

### 4.1 — Route rules in Nuxt

```ts
// nuxt.config.ts
routeRules: {
  '/': { swr: 60 },
  '/products/**': { swr: 300 },
  '/collections/**': { swr: 300 },
  '/cart': { ssr: true, cache: false },
  '/checkout/**': { ssr: true, cache: false },
  '/account/**': { ssr: true, cache: false },
}
```

### 4.2 — Redis-backed cache (selective)

- Use `unstorage` with Redis driver for server-side data cache where appropriate
- Do not cache cart/checkout/account data

### 4.3 — Document purge strategy

- Write `docs/architecture/cache-strategy.md`
- Describe what is cached, TTLs, and how to invalidate (manual + future webhook-based)

### Phase 4 deliverable

- Public pages have route-level SWR caching
- Private pages explicitly excluded
- Cache strategy documented

---

## Phases 5–8 (outlined, not yet planned in detail)

| Phase | Focus | Trigger |
|---|---|---|
| 5 | Commerce flows — cart, checkout, orders, account | After Phase 3 pages are stable |
| 6 | Content workflows — Strapi editors, previews, roles | After Phase 3 pages are stable |
| 7 | WooCommerce compatibility — thin Nuxt routes for real integrations | When a live legacy integration needs it |
| 8 | Staging + production — VPS deploy, Cloudflare, observability | When feature-complete enough to stage |

---

## SCSS migration notes (from existing PHP/CSS site)

- Do not import the old CSS directly. Port it to SCSS with variables and proper structure.
- Audit existing styles before Phase 3 to understand the design system (colors, spacing, typography, component classes)
- Create a `tokens` layer in SCSS before building any components
- Nuxt uses Vite under the hood — `sass` (Dart Sass) is the recommended preprocessor (not `node-sass`)

---

## Architectural constraints — confirmed, must not be forgotten

### Multi-region: currency and language

The platform **must** support multiple currencies and multiple languages from the start of architecture decisions, even if full implementation comes in a later phase.

Key rules:
- Different regions/locales can have **independent prices** — not just converted rates. A product can be $29 USD and €35 EUR with no automatic conversion relationship between them.
- This maps cleanly to Medusa v2's built-in **Regions + Price Lists** model. Each region has its own currency and its own price set per product variant.
- Strapi content types must also be **locale-aware**. Strapi v5 has built-in i18n — content types (product content, landing pages, articles, SEO fields) need the `locale` field enabled from day one.
- The Medusa ↔ Strapi link (`medusaId` in Strapi / `metadata.strapi_id` in Medusa) is locale-agnostic — it identifies the product entity; Strapi handles locale variants internally via i18n.

**Impact on Phase 2 (domain model):**
- Medusa: configure regions + currencies before seeding any product prices
- Strapi: enable i18n plugin and mark localizable fields on all content types before creating any entries
- Do not add prices or content in a single-currency/single-language way and then try to retrofit regions later — that is painful

**Impact on Phase 3 (storefront):**
- Nuxt must detect or accept locale + region context on every page request
- Server routes must pass region/locale context when fetching from Medusa and Strapi
- URL strategy: **country-code prefix**, default (US) has no prefix — matches existing site exactly

**Confirmed regions (from live site):**

| URL prefix | Region | Language | Currency |
|---|---|---|---|
| `/` (default) | United States | English | USD |
| `/ca/` | Canada | English | CAD |
| `/gb/` | Britain / UK | English | GBP |
| `/au/` | Australia | English | AUD |
| `/fr/` | France | French | EUR |
| `/de/` | Germany | German | EUR |
| `/es/` | Spain | Spanish | EUR |
| `/it/` | Italy | Italian | EUR |
| `/he/` | Israel | Hebrew | ILS |
| `/br/` | Brazil | Portuguese (BR) | BRL |
| `/ja/` | Japan | Japanese | JPY |

**Medusa regions to create (Phase 2.1):** one region per row above — 11 total.
**Strapi i18n locales to enable (Phase 2.2):** `en`, `fr`, `de`, `es`, `it`, `he`, `pt-BR`, `ja`.
Note: `ca`, `gb`, `au` are English-language regions with different currencies — they share the `en` locale in Strapi but have separate Medusa regions for currency/price set purposes.

**URL rules for Nuxt (Phase 3):**
- `nuxt-i18n` strategy: `prefix_except_default` — US (en) has no prefix, all others prefixed with country code
- Route files: `pages/[locale]/product/[handle].vue` or via i18n module automatic prefix injection
- The country code is the routing key, not the language code (e.g. `/ca/` not `/en-ca/`)

---

### WooCommerce data migration

A full data migration from WooCommerce is required. This is not a greenfield launch — existing data must be preserved.

Data to migrate:
- **Customers** — accounts, contact info, addresses
- **Orders** — order history, line items, statuses, payment info
- **Subscriptions** — active and past subscriptions (WooCommerce Subscriptions plugin data)
- **Products** — existing catalog (products, variants, prices per region)

This is a significant engineering task that needs its own dedicated phase (between Phase 2 and going live).

**Architectural implications:**
- Medusa v2 must be configured with all regions/currencies **before** migration runs, so imported prices land in the right price sets
- Customer records must be imported before order records (orders reference customers)
- Subscriptions may require a custom Medusa v2 module — Medusa does not have native subscription support out of the box
- After migration, the sync workflows must be run once to push all imported Medusa products into Strapi (populating `medusaId` on each Strapi entry and `metadata.strapi_id` on each Medusa product)
- Migration should be a **one-time scripted process**, not a live sync — run it, verify, cut over

**Migration phase (to be planned in detail later — call it Phase 2.5 or a separate track):**
- [ ] Audit WooCommerce export: what data exists, what format
- [ ] Map WooCommerce data model → Medusa v2 data model (customers, orders, line items, addresses)
- [ ] Map WooCommerce Subscriptions → custom Medusa module or third-party solution
- [ ] Write migration scripts in `scripts/migration/`
- [ ] Test migration on staging with production data snapshot
- [ ] Define cutover plan (DNS, redirect strategy, order ID continuity if needed)

**Open sub-questions (needed before migration planning begins):**
- [ ] What WooCommerce plugins are used for subscriptions? (WooCommerce Subscriptions, YITH, other?)
- [ ] How many active subscriptions are there approximately?
- [ ] Are order IDs referenced externally (in emails, shipping labels, other systems) — do they need to be preserved?
- [ ] Is there existing customer account login that needs to be migrated (password hashes, OAuth)?
- [ ] What payment gateway stores subscription billing agreements — will those tokens transfer?

---

### Custom integrations — rewrite from WooCommerce

All of the following currently exist as WooCommerce plugins or custom PHP code. Each must be re-implemented in the correct layer of the new stack. None of them belong in WooCommerce-specific code anymore.

This is a substantial engineering effort. Each integration should be treated as its own mini-project with its own discovery, design, and implementation step — not bundled together.

---

#### 1. Fulfillment

**What it does:** Sends orders to a fulfillment center / 3PL / warehouse after checkout. May handle multi-warehouse routing, partial fulfillments, backorders, and fulfillment status callbacks.

**Where it lives in the new stack:** `apps/commerce` — Medusa v2 fulfillment provider module

Medusa v2 has a first-class fulfillment module. Custom fulfillment providers implement a standard interface:
- `createFulfillment` — sends order to the warehouse/3PL
- `cancelFulfillment` — cancels a pending fulfillment
- `getFulfillmentDocuments` — returns packing slips, labels, etc.

**Actions before implementation:**
- [ ] Identify which fulfillment provider(s) / 3PL(s) are used today (ShipBob, ShipStation, in-house WMS, custom API?)
- [ ] Identify whether multi-warehouse routing logic exists and how it works
- [ ] Identify whether partial fulfillments or split shipments happen
- [ ] Identify the fulfillment callback/webhook mechanism (how the warehouse tells the platform an order shipped)

---

#### 2. Address validation

**What it does:** Validates and normalizes shipping addresses at checkout to reduce failed deliveries.

**Where it lives in the new stack:** Two possible locations depending on when validation happens:
- **At input time (UX):** `apps/storefront` — Nuxt server route or composable, called as the user types or on blur
- **At order submission time:** `apps/commerce` — Medusa v2 custom workflow step, runs before order is confirmed

Likely providers: SmartyStreets, Google Address Validation API, Loqate, USPS, EasyPost address API.

**Actions before implementation:**
- [ ] Identify which address validation service is currently used
- [ ] Identify which markets/countries require validation (US only, or international?)
- [ ] Decide whether to validate at input time, at checkout submit, or both

---

#### 3. Taxes

**What it does:** Calculates the correct tax amount for an order based on product type, shipping destination, and jurisdiction rules.

**Where it lives in the new stack:** `apps/commerce` — Medusa v2 tax provider module

Medusa v2 has a pluggable tax module. Custom tax providers implement:
- `getTaxLines` — given a cart/order context, return line-item and shipping tax rates

Likely providers: TaxJar, Avalara/AvaTax, custom rule-based logic.

**Important:** Tax rules for e-commerce vary significantly by market (US state nexus rules, EU VAT, AU GST). Multi-region setup means the tax provider must handle all active markets.

**Actions before implementation:**
- [ ] Identify which tax service is currently used (TaxJar, Avalara, custom, WooCommerce Tax?)
- [ ] Identify which markets have active tax obligations (US states with nexus, EU VAT registered countries, etc.)
- [ ] Confirm whether tax is calculated inclusive or exclusive of price per region (EU typically tax-inclusive)
- [ ] Confirm whether tax-exempt customers exist (B2B, resellers)

---

#### 4. Fraud prevention

**What it does:** Scores orders at checkout to detect and block fraudulent transactions before fulfillment.

**Where it lives in the new stack:** `apps/commerce` — Medusa v2 workflow + subscriber

Implementation pattern:
- A Medusa workflow step runs after payment capture and before fulfillment trigger
- If fraud score exceeds threshold → order is flagged/held, fulfillment is blocked, ops team is notified
- If fraud score is acceptable → fulfillment proceeds normally

Likely providers: Signifyd, Kount, Sift, custom rule set, or payment-gateway-native (Braintree has fraud tools built in).

**Actions before implementation:**
- [ ] Identify which fraud prevention service/tool is used today
- [ ] Identify what happens when an order is flagged (manual review queue? Auto-cancel? Hold?)
- [ ] Check whether Braintree's native fraud tools (Advanced Fraud Management / Kount) are already active — if so, this may be partially handled at the payment layer

---

#### 5. Shipment tracking

**What it does:** Gives customers visibility into where their order is after it ships. Updates order status as the shipment moves through the carrier network.

**Where it lives in the new stack:**
- **Inbound tracking data:** `apps/commerce` — Medusa subscriber listens for fulfillment webhook events, updates shipment records
- **Customer-facing tracking UI:** `apps/storefront` — Nuxt page or component that displays tracking status (fetched from Medusa or directly from a tracking API)
- **Tracking notification emails:** Medusa notification module / email provider

Likely providers: AfterShip, EasyPost, ShipStation, direct carrier APIs (UPS, FedEx, USPS, DHL).

**Actions before implementation:**
- [ ] Identify which tracking platform or carrier APIs are used today
- [ ] Identify whether tracking is shown in-app, via email only, or via a third-party tracking page
- [ ] Identify whether tracking updates trigger customer notifications (email, SMS?)

---

#### 6. Data analytics

**What it does:** Tracks user behavior, commerce events, and business metrics. Powers marketing analysis, funnel optimization, and reporting.

**Where it lives in the new stack:** Split across layers by event type:

| Event type | Source layer | Implementation |
|---|---|---|
| Page views, clicks, scroll depth | `apps/storefront` | Client-side (GA4, GTM, Segment, or custom) |
| Commerce events (add to cart, begin checkout, purchase) | `apps/storefront` + `apps/commerce` | Client-side GA4 ecommerce events + server-side Medusa subscribers |
| Order revenue, refunds, LTV | `apps/commerce` | Medusa subscribers → data warehouse or analytics platform |
| A/B test exposure | `apps/storefront` | Client-side via feature flag / experiment platform |
| Email engagement | External email platform | Not in-app |

**Server-side vs client-side tracking:**
- Client-side tracking (GA4 via GTM) is standard but increasingly unreliable due to ad blockers and privacy browsers
- Server-side tracking via Medusa subscribers is more reliable for commerce events (purchase confirmation, refunds, subscription events)
- Consider a hybrid: client-side for UX events, server-side for commerce truth events

Likely platforms in play: Google Analytics 4, Google Tag Manager, Meta Pixel, possibly Segment, Klaviyo, or a custom data warehouse.

**Actions before implementation:**
- [ ] Audit which analytics platforms currently receive data (GA4, Meta, others)
- [ ] Identify whether there is a customer data platform (Segment, Rudderstack) or direct integrations
- [ ] Identify which events are business-critical vs nice-to-have
- [ ] Decide on server-side event strategy for purchase/refund events
- [ ] Confirm GDPR/privacy compliance requirements per region (consent management, cookie banner)

---

#### Integration rewrite — sequencing

Not all integrations are needed at the same time. Suggested order:

| Priority | Integration | Needed by |
|---|---|---|
| 1 | Taxes | Phase 5 (checkout must calculate tax) |
| 2 | Address validation | Phase 5 (checkout flow) |
| 3 | Fulfillment | Phase 5 (orders must flow to warehouse) |
| 4 | Fraud prevention | Phase 5 (before live orders) |
| 5 | Shipment tracking | Phase 5 / shortly after go-live |
| 6 | Data analytics | Phase 3 onward (basic GA4 early; full server-side events before go-live) |

**Open questions across all integrations:**
- [ ] Which specific vendor/service powers each integration today? (full audit needed)
- [ ] Are there any custom-built integrations (no third-party vendor — pure custom PHP code)? Those are highest-risk rewrites
- [ ] Are any of these integrations shared with other systems outside the WooCommerce site?

---

### Admin roles and permissions

The platform has **two separate admin panels** — Medusa admin and Strapi admin. There is no single unified dashboard. Roles must be configured in each system independently.

#### Role definitions

| Role | Medusa admin access | Strapi admin access | Notes |
|---|---|---|---|
| **Full Admin** | Full access | Full access | Developers and senior ops; can change settings, roles, and system config |
| **E-commerce Manager** | Full access | Read-only or none | Manages products, pricing, orders, inventory, promotions, regions, customers |
| **Content Manager** | None or read-only | Full content access | Manages landing pages, articles, product content blocks, SEO fields, media |
| **Customer Support** | Orders + customers (read + limited write) | None | Can view orders, process refunds, add notes; cannot change products or pricing |
| **Marketing** | Promotions + discount codes; read-only orders | Full content access | Manages campaigns in both systems; no order fulfillment or product pricing |

#### Medusa v2 — roles and permissions

Medusa v2 has a built-in user and permission system in the admin. Configure:
- Invite-only admin user creation (no open registration)
- Role-based access per the table above
- Limit E-commerce Manager from accessing system settings, API keys, and other admin user management
- Customer Support role: read orders, create notes, trigger refunds — but cannot edit products, prices, or regions

#### Strapi v5 — roles and permissions

Strapi has granular RBAC (role-based access control) built in. Configure:
- **Author** — can create and edit their own content entries, cannot publish
- **Editor** — can create, edit, and publish any content entry
- **Content Manager** (custom role) — full access to all content types, media library, and components; cannot touch Strapi system settings or API tokens
- **Full Admin** — Strapi superadmin; access to all settings, roles, API tokens, and webhooks

Rules:
- API tokens used by the storefront should be **read-only tokens** scoped to specific content types — never use a full-access token in the storefront
- Do not give content editors access to API tokens or webhook configuration

#### No unified admin dashboard (early phases)

A single SSO admin portal covering both systems is out of scope for early phases. Users who need both systems get separate logins. If a unified admin becomes a priority later, it can be explored as a custom Nuxt admin app or a third-party identity layer.

#### Action before Phase 5 (Medusa) and Phase 6 (Strapi)
- [ ] Confirm final role list and which real team members map to which role
- [ ] Define which Medusa admin actions Customer Support is allowed to perform (refunds only? also cancellations? address edits?)
- [ ] Confirm whether Marketing needs Medusa access at all, or only Strapi
- [ ] Set up Strapi API tokens with minimum required scopes for the storefront (read-only, per content type)

---

### URL structure — must match existing WooCommerce paths exactly

The new Nuxt storefront must replicate the exact URL structure of the current WooCommerce site. This is non-negotiable for:
- **SEO** — preserving existing search rankings and inbound links
- **External integrations** — any third-party service, affiliate, or marketing tool that references hardcoded URLs
- **User bookmarks and shared links**

WooCommerce default URL patterns (verify against the live site before Phase 3):

| Page type | Typical WooCommerce pattern | Nuxt route file |
|---|---|---|
| Product | `/product/[slug]/` | `pages/product/[slug].vue` |
| Product category | `/product-category/[slug]/` | `pages/product-category/[slug].vue` |
| Shop / all products | `/shop/` | `pages/shop/index.vue` |
| Blog post | `/[slug]/` or `/blog/[slug]/` | depends on current config |
| Account | `/my-account/` | `pages/my-account/index.vue` |
| Cart | `/cart/` | `pages/cart/index.vue` |
| Checkout | `/checkout/` | `pages/checkout/index.vue` |
| Order confirmation | `/checkout/order-received/[id]/` | `pages/checkout/order-received/[id].vue` |

**Multi-language URL implication:**
- If the current site uses language prefixes (e.g. `/de/product/[slug]/`), the Nuxt locale strategy must match that prefix pattern exactly
- If the current site uses subdomains (e.g. `de.example.com`) or separate domains, that must be replicated or redirected cleanly

**Rules:**
- Do not invent new URL structures — audit the live site first
- If any URL pattern must change (e.g. a cleaner structure is strongly preferred), implement **301 redirects** from old to new — do not let old URLs 404
- Trailing slashes: match whatever the current site uses consistently — Nuxt has a `trailingSlash` config option
- 301 redirect rules can be defined in `nuxt.config.ts` via `routeRules` or handled at the Cloudflare/nginx level in production

**Action before Phase 3:**
- [ ] Export a full sitemap from the current WooCommerce site
- [ ] Confirm the URL pattern for each page type (product, category, blog, account, etc.)
- [ ] Confirm the multi-language URL strategy (prefix, subdomain, or separate domain)
- [ ] Identify any custom permalink structures set in WooCommerce settings

---

### SEO preservation — full fidelity required

The new platform must preserve all existing SEO equity. A botched migration can destroy years of rankings within weeks. This touches every layer of the stack.

#### 1. URL parity (see URL structure section above)
- Exact path match for every indexed page
- 301 redirects for anything that genuinely must change
- Zero 404s on previously indexed URLs

#### 2. On-page signals — must match or improve

Every page must have parity on:

| Signal | Source in new platform | Notes |
|---|---|---|
| `<title>` | Strapi SEO field per content type | Per locale |
| `<meta name="description">` | Strapi SEO field | Per locale |
| `<meta property="og:*">` | Strapi SEO field | Open Graph for social sharing |
| Canonical URL | Nuxt `useHead` / Nuxt SEO module | Must be self-referencing; no duplicate canonicals |
| `hreflang` tags | Generated from locale config | Critical for multi-language — tells Google which page is which language |
| Heading hierarchy (H1, H2…) | Nuxt page templates | Match the existing page structure |
| Structured data / JSON-LD | Nuxt page templates | Product schema, BreadcrumbList, Organization — match what currently exists |
| `robots.txt` | Nuxt public dir or server route | Replicate current rules exactly |
| XML sitemap | Generated (e.g. `nuxt-simple-sitemap`) | Include all public pages, all locales, correct `lastmod` |

#### 3. Nuxt SEO tooling

Use **Nuxt SEO** (`@nuxtjs/seo`) or the composable stack built on `unhead`. Do not manually manage every meta tag — use a consistent pattern so no page is accidentally missing tags.

Recommended modules to evaluate:
- `@nuxtjs/seo` — meta, OG, JSON-LD, sitemap, robots in one
- `nuxt-schema-org` — structured data
- `nuxt-simple-sitemap` — auto-generated XML sitemap with i18n support

#### 4. `hreflang` is mandatory

With multiple languages, Google requires `hreflang` annotations on every page to understand which version is for which locale. Missing or wrong `hreflang` = language pages competing against each other.

Every page render must include:
```html
<link rel="alternate" hreflang="en" href="https://example.com/en/product/slug/" />
<link rel="alternate" hreflang="de" href="https://example.com/de/product/slug/" />
<link rel="alternate" hreflang="x-default" href="https://example.com/product/slug/" />
```

This is generated automatically if Nuxt i18n is configured correctly — but it must be verified.

#### 5. Core Web Vitals

Nuxt SSR gives a strong foundation. Maintain it:
- Do not block server-side rendering with slow API calls — use parallel fetches
- Lazy-load non-critical components
- Optimize images (use `<NuxtImg>` with responsive sizing)
- SCSS must not cause render-blocking — critical styles inline, rest deferred where possible

#### 6. Pre-launch SEO checklist (before Phase 8 / go-live)

- [ ] Crawl the old site with Screaming Frog — capture all indexed URLs, titles, descriptions, H1s, canonical URLs, and structured data
- [ ] Crawl the new site with the same tool — diff against old site output
- [ ] Verify all `hreflang` annotations are correct across locales
- [ ] Verify sitemap includes all pages and is submitted to Google Search Console
- [ ] Verify `robots.txt` is correct (no accidental `Disallow: /`)
- [ ] Verify no page has a missing or duplicate `<title>` or canonical
- [ ] Set up Google Search Console for the new domain/property before cutover
- [ ] Monitor Search Console for crawl errors in the first 2 weeks after go-live

---

### Accessibility — required, not optional

The storefront must meet **WCAG 2.1 AA** as a baseline. This is not a post-launch polish task — it must be built in from the first component.

#### Why this matters beyond compliance
- Legal exposure in many markets (EU, US, AU all have accessibility legislation for e-commerce)
- SEO overlap — many accessibility signals (semantic HTML, alt text, heading hierarchy) are also ranking signals
- Directly improves usability for all users, not just those with disabilities

#### Core rules for every component and page

**Semantic HTML**
- Use the correct element for the job: `<button>` for actions, `<a>` for navigation, `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<article>` where appropriate
- Never use `<div>` or `<span>` as interactive elements without explicit ARIA roles
- One `<h1>` per page, logical heading hierarchy (no skipping from H2 to H4)

**Keyboard navigation**
- Every interactive element must be reachable and operable via keyboard alone
- Focus order must be logical (matches visual reading order)
- Custom components (dropdowns, modals, sliders, tabs) must implement correct keyboard patterns per [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- Never use `outline: none` without providing a visible custom focus style

**Focus management**
- Modal/dialog open → focus moves into modal; modal close → focus returns to trigger
- Mobile nav open → focus trapped inside nav; nav close → focus returns to hamburger button
- Route changes → focus moves to the new page's main heading or top of content

**Color and contrast**
- Minimum contrast ratio: **4.5:1** for normal text, **3:1** for large text and UI components
- Do not convey information using color alone (e.g. error states need an icon or text, not just a red border)
- When porting SCSS from the existing PHP/CSS site, audit contrast ratios — do not assume the old site passes

**Images and media**
- All meaningful images must have descriptive `alt` text
- Decorative images must have `alt=""` (empty string, not missing)
- Use `<NuxtImg>` with `alt` prop enforced
- Any video content needs captions

**Forms and checkout**
- Every input must have a visible, associated `<label>` (not just placeholder text)
- Error messages must be programmatically associated with the field that failed (`aria-describedby`)
- Required fields must be indicated both visually and with `aria-required="true"`
- The entire checkout flow must be keyboard-navigable

**ARIA — use carefully**
- First preference: correct semantic HTML (no ARIA needed)
- Second preference: ARIA only where native semantics are insufficient
- Never use ARIA to paper over a broken DOM structure — fix the HTML first

#### Tooling and process

| Tool | Purpose |
|---|---|
| `axe-core` / `@axe-core/vue` | Automated in-browser accessibility scanning during dev |
| Vue `eslint-plugin-vuejs-accessibility` | Lint-time accessibility checks on `.vue` files |
| Browser DevTools accessibility panel | Inspect ARIA tree, contrast ratios |
| Manual keyboard testing | Tab through every interactive flow before marking a page done |
| Screen reader testing (NVDA/JAWS on Windows, VoiceOver on Mac) | Spot-check key flows: product page, cart, checkout |

Add `eslint-plugin-vuejs-accessibility` to the ESLint config in `packages/config-eslint` — this catches issues at write time, not after.

#### Accessibility checkpoints per phase

- **Phase 1 (scaffold):** ESLint accessibility plugin configured from day one
- **Phase 3 (pages):** Every new page and component reviewed for semantic HTML, keyboard nav, and contrast before it is considered done
- **Phase 5 (commerce flows):** Cart, checkout, and account flows get full keyboard + screen reader testing — these are the highest-risk flows
- **Phase 8 (pre-launch):** Full automated scan with axe-core on all public pages; manual screen reader walkthrough of the purchase flow

#### Pre-launch accessibility checklist

- [ ] axe-core scan passes on all public pages with zero critical or serious violations
- [ ] Full purchase flow (product → cart → checkout → confirmation) is completable by keyboard alone
- [ ] All images have correct `alt` text
- [ ] All form inputs have associated labels
- [ ] Color contrast passes 4.5:1 for all text
- [ ] Focus is always visible and never lost
- [ ] `hreflang` and `lang` attribute on `<html>` set correctly per locale

---

### Payment gateways

Three payment providers must be supported. All are implemented as **Medusa v2 payment provider modules** — none of them touch Nuxt or Strapi directly.

| Gateway | Role | Notes |
|---|---|---|
| **Braintree** | Primary | Handles credit/debit cards; also supports PayPal via Braintree vault; likely handles subscription billing agreements |
| **BlueSnap** | Secondary | Often used for international/multi-currency processing — relevant given the multi-region requirement |
| **Afterpay** | BNPL | Buy Now Pay Later; typically only available in certain regions (AU, NZ, US, CA, UK) |

**Medusa v2 payment provider status (check before Phase 5):**
- Medusa maintains official payment plugins — verify which of the three have an official `@medusajs/payment-*` module vs. needing a custom implementation
- Braintree is the most likely to need a custom provider module if not officially supported in v2 yet
- Each provider must be mapped to the correct Medusa **regions** — Afterpay should only appear as a payment option in regions where it operates

**Subscription billing implication:**
- Braintree stores vault tokens for recurring billing. If subscriptions migrate to the new platform, existing Braintree vault tokens should remain valid — this is an important data migration constraint. Do not ask customers to re-enter payment details if avoidable.

**Open sub-questions (needed before Phase 5):**
- [ ] Which payment gateway currently handles subscription recurring charges — Braintree only, or are BlueSnap subscriptions also active?
- [ ] Is PayPal used via Braintree's vault, or is it a separate integration?
- [ ] Which regions/countries use BlueSnap vs. Braintree — is the split by currency, country, or product type?

---

## Open questions (track and close before relevant phase)

- [ ] What is the exact list of active WooCommerce integrations/webhooks that will need compatibility? (needed before Phase 7)
- [ ] What is the existing site's URL and domain — does the new site need to run on the same domain with zero downtime cutover? (needed before Phase 8)
- Payment gateways confirmed: **Braintree** (primary), **BlueSnap**, **Afterpay** — all three need Medusa payment provider integrations before Phase 5
- [ ] Is there a staging VPS already provisioned, or does it need to be set up from scratch? (needed before Phase 8)
- ~~What currencies and locales are active today?~~ **Closed** — 11 regions confirmed, see multi-region section above
- [ ] What WooCommerce plugins are used for subscriptions? (needed before migration planning)
- [ ] Are order IDs referenced externally? (needed before migration planning)

---

## Strapi API token architecture

Three separate tokens are needed. Create these in Strapi Admin → Settings → API Tokens.

| Token | Used by | Permission level | Scope |
|---|---|---|---|
| `STRAPI_SYNC_TOKEN` | Medusa `apps/commerce` Strapi Module (`@strapi/client`) | **Full access** or custom read-write | `product` content type + media library upload |
| `STRAPI_STOREFRONT_TOKEN` | Nuxt `apps/storefront` sdk-content (editorial reads) | **Read-only** | Editorial content types only: `landing-page`, `blog-post`, `marketing-banner`, etc. |
| *(Medusa Secret API Key)* | Strapi webhook → Medusa (`POST /webhooks/strapi`) | N/A — created in **Medusa Admin**, not Strapi | Used as `Authorization: Bearer <key>` header on the Strapi webhook config |

**Notes:**
- Product data does NOT require `STRAPI_STOREFRONT_TOKEN` from the storefront — it arrives via Medusa's virtual link in a single Medusa Store API call
- `STRAPI_SYNC_TOKEN` must have write access to the media library so product images can be uploaded from Medusa
- Both Strapi tokens go in `.env` — add them after creating tokens in Strapi Admin during Phase 2 setup
- The Medusa Secret API Key is created in Medusa Admin → Settings → Secret API Keys during Phase 2.6

---

---

## Medusa ↔ Strapi integration — architecture reference

> This section summarises the official integration pattern so it is always visible when working in this repo.
> Full guide: https://docs.medusajs.com/resources/integrations/guides/strapi
> Full code example: https://github.com/medusajs/examples/tree/main/strapi-integration

### Data flow diagram

```
┌─────────────────────────────┐        ┌──────────────────────────────┐
│          MEDUSA              │        │           STRAPI              │
│                              │        │                               │
│  product.created event ──────┼──────► │  Product entry (medusaId)    │
│  product.updated event ──────┼──────► │  (product-level only;         │
│  product.deleted event ──────┼──────► │   no variants/options)        │
│                              │        │                               │
│  POST /webhooks/strapi ◄─────┼────────┼─ Strapi webhook (entry.update)│
│  (updates Medusa product)    │        │                               │
│                              │        │  + Editorial content types:   │
│  metadata.strapi_id          │        │    landing-page, blog-post,   │
│  metadata.strapi_document_id │        │    marketing-banner, etc.     │
└─────────────────────────────┘        └──────────────────────────────┘
         │
         │  Virtual link (Medusa Query)
         ▼
┌──────────────────────────────────────────────────────────┐
│  Nuxt storefront                                          │
│                                                           │
│  GET /store/products?fields=*strapi_product               │
│    → gets Medusa commerce data + Strapi content in 1 call │
│                                                           │
│  GET /strapi/api/landing-pages/:slug                      │
│    → gets non-product editorial content directly          │
└──────────────────────────────────────────────────────────┘
```

### Linking key convention

| System | Field | Contains |
|---|---|---|
| Strapi (all product content types) | `medusaId` | The Medusa product/variant/option ID |
| Medusa product `metadata` | `strapi_id` | The Strapi numeric ID |
| Medusa product `metadata` | `strapi_document_id` | The Strapi document ID (v5 document API) |

### Duplicate-update prevention

Medusa → Strapi → Medusa creates an infinite update loop. Prevention mechanism:
1. When Medusa sends an update to Strapi, Strapi fires a webhook back to Medusa
2. Medusa's webhook handler hashes the payload with `simpleHash(JSON.stringify(body))`
3. Checks if that hash is in Redis cache (TTL: 60s) — if yes, skip processing
4. If no, process the update and cache the hash

This requires the Medusa **Caching Module** with Redis to be enabled.

### Packages needed (Phase 2)

```bash
# in apps/commerce
pnpm add @strapi/client

# for caching (Medusa module — requires featureFlag.caching: true)
pnpm add @medusajs/caching-redis
```

---

## Working convention

- One phase at a time. Do not begin Phase N+1 until Phase N deliverable is confirmed.
- Every structural or ownership decision gets a short ADR in `docs/decisions/`.
- `.env` files are never committed. Only `.env.example` files with dummy values.
- All service source code is TypeScript. Exceptions: `medusa-config.js` (CommonJS required by Medusa CLI) and `apps/commerce/src/modules/*/index.js` + `service.js` (Medusa's `defineConfig` calls `require()` on custom modules at startup before `ts-node` is registered — a CommonJS `.js` entry alongside `.ts` is required). The `.ts` files remain authoritative for type-checking; the `.js` files mirror the runtime logic.
- Keep Dockerfiles simple during local dev — use official Node base images, mount source, run dev server inside container.
- Follow the [official Medusa v2 Strapi guide](https://docs.medusajs.com/resources/integrations/guides/strapi) for the sync implementation in Phase 2 — do not invent a custom pattern.
