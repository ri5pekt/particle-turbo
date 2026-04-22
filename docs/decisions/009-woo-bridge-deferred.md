# ADR 009 — WooCommerce compatibility bridge deferred

**Status:** Accepted

## Decision
Do not create a standalone WooCommerce bridge service at project start. If compatibility endpoints are needed, implement them as thin Nuxt server routes under `apps/storefront/server/api/woo/`.

## Reasons
- No active integrations require Woo-compatible endpoints at launch
- A standalone service adds infrastructure overhead before the need is proven
- Nuxt server routes can handle the initial compatibility surface cleanly

## Extraction trigger
If the compatibility layer grows large, becomes shared across systems, or requires its own deployment lifecycle — extract it to `apps/woo-bridge`.

## Consequences
- Only implement the specific endpoints and webhook shapes actually required by real integrations
- Do not attempt to replicate the entire WooCommerce REST API
