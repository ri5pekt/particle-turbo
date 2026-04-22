# ADR 002 — Three core apps only at startup

**Status:** Accepted

## Decision
Start with exactly three apps: `storefront` (Nuxt), `commerce` (Medusa), `content` (Strapi). Do not add more services until there is a clear, justified need.

## Reasons
- Minimizes operational complexity during early development
- Each app has a well-defined, non-overlapping responsibility
- Additional services (e.g. woo-bridge, standalone admin) can be added later if genuinely needed

## Consequences
- WooCommerce compatibility endpoints live inside `apps/storefront/server/api/woo/` until volume justifies extraction
- No standalone analytics, search, or media service in early phases
