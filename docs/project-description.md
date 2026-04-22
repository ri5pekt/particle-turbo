particle-turbo — project description and development flow

1. Project overview

particle-turbo is a modern headless e-commerce platform intended to replace an old WooCommerce-based website.

The goal is to build a faster, more scalable, more maintainable platform with a clean separation of concerns:

Nuxt 3 + Vue 3 as the main application layer and storefront
Medusa as the commerce engine
Strapi as the content management system
PostgreSQL for persistent storage
Redis for caching and infrastructure support
Docker Compose for local multi-service development
pnpm workspaces + Turborepo for monorepo management

This system must support:

high-traffic public storefront pages
SSR and cache-aware rendering
flexible content editing for managers
strong commerce capabilities
future compatibility with some legacy WooCommerce-based integrations

The architecture must stay modular, but development should start with the minimum sane number of moving parts.

2. High-level architecture

The project will start as a monorepo with 3 core apps:

apps/storefront — Nuxt full-stack app
apps/commerce — Medusa app
apps/content — Strapi app

The storefront is not just a frontend. It is the main application layer.

Nuxt will be responsible for:

page rendering
SSR
route-level caching logic
backend-for-frontend behavior
fetching and composing data from Medusa and Strapi
future thin compatibility endpoints for Woo-style integrations if needed
Core ownership model
Medusa owns commerce truth
products
variants
prices
promotions / discounts
carts
checkout
customers
orders
inventory-related business fields
other commerce-specific custom fields
Strapi owns editorial/content truth
landing pages
blog/articles
SEO fields
product page content blocks
marketing sections
FAQs
banners
media-heavy structured content
Nuxt owns presentation and orchestration
routing
SSR
public/private page rendering policy
page composition
caching policy
API aggregation
future Woo bridge starter layer

Important rule:
Do not let Medusa and Strapi both own the same field.
For example:

price belongs only to Medusa
product marketing blocks belong only to Strapi 3. Naming and repo layout

Repository name:

particle-turbo

Initial monorepo structure:

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
compose.yml
.env.example
docs/
architecture/
decisions/
api-contracts/
scripts/
package.json
pnpm-workspace.yaml
turbo.json
.gitignore
.editorconfig
README.md

Notes:

commerce = Medusa app
content = Strapi app
use generic names for apps so the repo is not married forever to a vendor name
shared packages should stay small and practical 4. Tech stack
Frontend / app layer
Nuxt 3
Vue 3
TypeScript
Commerce backend
Medusa
TypeScript / Node.js
Content backend
Strapi
Node.js
Infrastructure
PostgreSQL
Redis
Docker Compose
Monorepo tooling
pnpm workspaces
Turborepo
Edge / production later
Cloudflare

Important:
Cloudflare is not required in local development.
The app should be built in a cache-friendly way from day 1, but Cloudflare can be added later in staging/production.

5. Development principles
   Do not modify Medusa core directly.
   Extend it using its app/module patterns.
   Do not modify Strapi core directly.
   Extend it using content types, components, plugins, and app-level customization.
   Keep custom code close to the system it belongs to.
   commerce customizations live in apps/commerce
   content customizations live in apps/content
   orchestration/rendering/caching lives in apps/storefront
   Do not create unnecessary services on day 1.
   Start with 3 core apps only.
   Do not create a standalone Woo bridge service initially.
   If Woo compatibility is needed early, start by implementing thin compatibility endpoints inside Nuxt server routes.
   Include Redis from the beginning, but do not overengineer caching immediately.
   Design for caching from day 1, even if the first implementation is minimal.
   Favor strict field ownership and clear API contracts over clever sync hacks.
6. Local development environment

Create a single root Docker Compose setup to run the whole stack locally.

Local services
storefront
commerce
content
postgres-commerce
postgres-content
redis

Optional later:

mailpit
local S3-compatible storage like MinIO
Local dev goals
one command should boot the full environment
source code should be mounted for live development
services should be reachable via predictable local URLs
databases should be isolated per app

Suggested local URLs:

storefront: http://localhost:3000
commerce: http://localhost:9000
content: http://localhost:1337 7. Where custom code lives
apps/commerce (Medusa)

Custom modules, workflows, routes, subscribers, and commerce-specific logic live here.

Suggested shape:

apps/commerce/
src/
modules/
api/
workflows/
subscribers/
jobs/
utils/

Examples of future custom modules:

marketing flags
warehouse routing metadata
product business metadata
legacy integration adapters
custom tax-related metadata
apps/content (Strapi)

Content models, components, and editorial structures live here.

Suggested shape:

apps/content/
src/
api/
components/
extensions/
config/

Examples of future content types:

landing-page
product-page
article
faq
seo
shared marketing blocks
apps/storefront (Nuxt)

This is the main application layer.

Suggested shape:

apps/storefront/
pages/
components/
composables/
server/
api/
utils/
middleware/
plugins/
utils/

Examples:

server routes to fetch and normalize data from commerce/content
route rules for caching
product page rendering
collection page rendering
CMS landing page rendering 8. Data model and page composition strategy

A product page will often be composed from two sources:

From Medusa
product id
handle
variants
pricing
discount info
stock or availability flags
commerce metadata
From Strapi
SEO title / description
hero section
page content blocks
ingredients/features sections
FAQ blocks
marketing images
custom content sections

The storefront should merge those two sources into one rendered page.

There must be a stable linking field between the two systems.

Decision (see ADR 011): use the official Medusa v2 + Strapi integration pattern.
- Strapi stores `medusaId` (the Medusa entity ID) on each synced content type
- Medusa stores `metadata.strapi_id` and `metadata.strapi_document_id` back on products/variants
- Links are maintained automatically by two-way sync workflows — not set by hand
- The storefront fetches both Medusa and Strapi data in a single Medusa API call via a virtual read-only Link Module (`?fields=*strapi_product`)

9. Caching strategy

Caching is a requirement from day 1, but the first version should be focused and simple.

Public pages that should be designed for caching
homepage
landing pages
category / collection pages
product pages for anonymous visitors
article/blog pages
Pages that should not be full-page cached
cart
checkout
account
personalized pages
anything user/session-specific
Initial caching layers
App-level caching in storefront
route rules
cached data fetches where useful
Redis-backed support when needed
Redis
included from day 1
initially for infrastructure support and selective caching
not everything should depend on Redis immediately
Cloudflare later
add only in staging/production
use for edge caching and origin offload later

Important:
Do not overbuild invalidation logic before real pages exist.
Start with cache-aware route design and expand carefully.

10. WooCommerce compatibility strategy

Some existing third-party services may rely on WooCommerce REST API shapes or Woo-style webhooks.

We may eventually implement a Woo compatibility layer, but we should not create a dedicated standalone service on day 1.

Phase 1 approach

If compatibility is needed, implement thin compatibility endpoints inside:

apps/storefront/server/api/woo/...

This can act as a temporary translation layer.

Possible future extraction

If the compatibility layer becomes large, shared, or integration-heavy, it can later be extracted into:

apps/woo-bridge

Important rule

Do not try to mimic the entire Woo API.
Only implement the endpoints and webhook contracts actually needed by real integrations.

11. Monorepo tasks and root scripts

Root scripts should orchestrate the whole workspace.

Suggested root scripts:

{
"dev": "turbo dev",
"build": "turbo build",
"lint": "turbo lint",
"typecheck": "turbo typecheck",
"test": "turbo test",
"clean": "turbo clean"
}

Suggested workspace tasks:

dev
build
lint
typecheck
test

Use Turborepo to coordinate app/package commands.

12. Phased development flow
    Phase 0 — initialize monorepo and infra

Goal: create the repo and make the full dev environment boot.

Tasks:

initialize pnpm workspace
initialize Turborepo
create repo structure
create root package.json
create pnpm-workspace.yaml
create turbo.json
create Docker Compose
add shared config packages
add README and architecture docs

Deliverable:

repository skeleton exists
all services can be started from one place
Phase 1 — scaffold core apps

Goal: get all three apps running.

Tasks:

scaffold Nuxt storefront app
scaffold Medusa app
scaffold Strapi app
connect app env variables
connect Postgres and Redis where appropriate
verify local startup of all services

Deliverable:

storefront, commerce, and content apps all run locally
Phase 2 — define initial domain model

Goal: define what belongs in Medusa and what belongs in Strapi.

Tasks:

define commerce-owned custom fields in Medusa
define content-owned content types in Strapi
define linking key between Medusa products and Strapi product content
write short ADRs for ownership rules

Deliverable:

a single example product can exist across both systems with clear ownership
Phase 3 — build initial storefront composition

Goal: render real pages.

Tasks:

create homepage
create product listing / category page
create product page composed from Medusa + Strapi
create one CMS landing page
implement composables/services to fetch data from both backends
implement error handling and fallback behavior

Deliverable:

real SSR pages render using live data from commerce + content
Phase 4 — implement caching v1

Goal: make public pages fast.

Tasks:

define route-level caching rules in storefront
make public routes cache-friendly
add selective Redis-backed cache support if useful
define private/non-cacheable routes
document purge strategy outline

Deliverable:

public pages have first-pass caching behavior
cart/checkout/account remain safe
Phase 5 — implement commerce flows

Goal: make the store usable.

Tasks:

cart
checkout
promotions / discounts
account basics
product variant selection
order completion flow

Deliverable:

core e-commerce flow works end-to-end
Phase 6 — implement content workflows

Goal: make content manageable by non-developers.

Tasks:

finish Strapi content types
create reusable components
define editorial roles and workflows
support previews if needed
support product content editing flow

Deliverable:

managers/content editors can update content cleanly
Phase 7 — legacy integration compatibility

Goal: support critical old integrations.

Tasks:

inventory real existing Woo-based integrations
identify which endpoints/webhooks are actually needed
implement only those compatibility contracts
test against one real integration at a time

Deliverable:

key legacy integrations continue working during migration
Phase 8 — staging and production preparation

Goal: create a production-like deployment path.

Tasks:

create staging environment
add Cloudflare in front of staging
configure edge cache policy
configure purge/invalidation hooks
add observability/logging
verify performance under realistic load

Deliverable:

production-ready deployment path exists 13. Initial documentation to create

Create docs/decisions/ and write short architecture decisions such as:

monorepo with pnpm + turbo
3 core apps only at startup
storefront is Nuxt full-stack app, not just frontend
Medusa owns commerce truth
Strapi owns editorial truth
Redis included from start
Cloudflare only from staging/prod
no direct core modifications of Medusa or Strapi
Woo bridge postponed unless clearly needed

Keep them short and practical.

14. Success criteria for initial milestone

The first meaningful milestone is complete when:

monorepo is running locally
storefront can fetch from commerce and content
one product page renders using both systems
one landing page renders from Strapi
public page caching strategy exists in first form
no direct core hacks were introduced
architecture docs exist 15. Instructions for the AI coding agent

Build this project incrementally.

Rules
do not overengineer
do not add extra services unless justified
do not fork or edit Medusa/Strapi core directly
do not create a separate Woo bridge service initially
keep strict ownership boundaries
prefer clear folder structure and typed service wrappers
prefer minimal working vertical slices over broad unfinished scaffolding
First implementation target

Implement:

monorepo skeleton
Docker Compose local stack
Nuxt storefront scaffold
Medusa scaffold
Strapi scaffold
one product page composed from Medusa + Strapi
initial route caching policy for public pages
Output expectations

The agent should generate:

repo structure
root workspace config
docker compose config
base README
architecture notes
app scaffolds
initial env examples
initial product/content composition example
