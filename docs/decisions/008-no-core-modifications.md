# ADR 008 — No direct core modifications to Medusa or Strapi

**Status:** Accepted

## Decision
Never fork or patch the core source of Medusa or Strapi. All customizations use the official extension points each framework provides.

## Medusa extension points
- Custom modules (`apps/commerce/src/modules/`)
- Custom workflows (`apps/commerce/src/workflows/`)
- Custom API routes (`apps/commerce/src/api/`)
- Subscribers and jobs
- Custom payment, fulfillment, and tax providers

## Strapi extension points
- Content types and components (via admin or `apps/content/src/api/`)
- Custom plugins (`apps/content/src/plugins/`)
- Lifecycle hooks and policies
- Custom admin panel extensions if needed

## Consequences
- Upgrading Medusa or Strapi to new versions is not blocked by patched internals
- All custom logic is version-controlled in this repo, not hidden in node_modules
