# ADR 003 — Storefront is the BFF, not just a frontend

**Status:** Accepted

## Decision
`apps/storefront` is a full-stack Nuxt 3 application. It is the backend-for-frontend (BFF) and the main application layer — not a thin client.

## Responsibilities
- SSR and page rendering
- Route-level caching policy
- Data aggregation from Medusa and Strapi
- API composition (merges commerce + content into one page response)
- Future thin WooCommerce compatibility endpoints

## Reasons
- Nuxt server routes run on Node.js — capable of real backend logic
- Keeps data aggregation close to the rendering layer, reducing round trips from the browser
- Single deployment unit for the customer-facing surface

## Consequences
- Medusa and Strapi APIs are never called directly from the browser in production
- All cross-system composition logic lives in `apps/storefront/server/`
