# ADR 011 — Medusa ↔ Strapi sync pattern

**Status:** Accepted

## Decision
Use the official Medusa v2 + Strapi integration pattern: two-way sync via Medusa event subscribers and Strapi webhooks, with a virtual read-only link enabling single-call data access from the storefront.

Full reference: https://docs.medusajs.com/resources/integrations/guides/strapi  
Full code example: https://github.com/medusajs/examples/tree/main/strapi-integration

## Linking key convention
| System | Field | Contains |
|---|---|---|
| Strapi (`product`, `product-variant`, `product-option`, `product-option-value`) | `medusaId` | The corresponding Medusa entity ID |
| Medusa product `metadata` | `strapi_id` | The Strapi numeric ID |
| Medusa product `metadata` | `strapi_document_id` | The Strapi v5 document ID |

Links are maintained automatically by sync workflows — not set by hand.

## Sync directions
- **Medusa → Strapi:** Medusa subscribers listen to `product.created`, `product.updated`, `product.deleted` and run Medusa Workflows that push changes to Strapi via `@strapi/client`
- **Strapi → Medusa:** Strapi webhook fires on `entry.update`, POSTs to `POST /webhooks/strapi` on Medusa, which runs `handleStrapiWebhookWorkflow`

## Deduplication (infinite loop prevention)
The Strapi→Medusa webhook would re-trigger a Medusa→Strapi update, causing an infinite loop. Prevention: hash the webhook payload with `simpleHash`, check/set in Redis cache (TTL 60s), skip if already processed. Requires the Medusa Caching Module to be enabled.

## Storefront data access
A Medusa virtual read-only Link Module joins `product` ↔ `strapi_product`. The storefront requests `?fields=*strapi_product` on any Medusa Store API call and receives both Medusa commerce data and Strapi content data in a single response — no separate Strapi API call for product pages.

## Strapi content types (product sync types vs editorial types)
- **Synced from Medusa:** `product`, `product-variant`, `product-option`, `product-option-value` — defined via `schema.json` files in version control
- **Editorial only (not synced):** `landing-page`, `blog-post`, `marketing-banner`, `seo`, etc. — managed by Content Managers via Strapi Admin, consumed directly by Nuxt via Strapi REST API

## Consequences
- `@strapi/client` is a direct dependency of `apps/commerce`
- Medusa Caching Module with Redis is required (enabled via `featureFlags: { caching: true }`)
- Strapi content types for product data are code-first (schema.json), not created through Admin UI
- The storefront calls only Medusa for product data; Strapi is called directly only for non-product editorial content
