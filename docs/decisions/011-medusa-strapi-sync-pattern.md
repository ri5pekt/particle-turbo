# ADR 011 — Medusa ↔ Strapi sync pattern

**Status:** Superseded by ADR 010 (rev 2)

## Original decision (superseded)

Use the official Medusa v2 + Strapi integration pattern: two-way sync via Medusa event
subscribers and Strapi webhooks, with `medusaId` / `metadata.strapi_id` as the cross-system
linking key.

## Why it was superseded

The sync was built and verified end-to-end, then removed. Reasons:

1. **Duplicated data.** Two databases stored the same product data. Any discrepancy between them was a bug waiting to surface.
2. **Fragile integration.** Subscribers → workflows → Strapi API calls → webhook → Medusa — five moving parts, each a failure point.
3. **No material benefit.** The storefront needs to call Strapi for editorial content regardless (sections, SEO, page builder). A separate sync just added complexity without reducing the number of API calls.

## Current decision — see ADR 010

Nuxt server routes query Medusa and Strapi independently using **product `handle`** as the natural join key. No sync code exists in the codebase.
