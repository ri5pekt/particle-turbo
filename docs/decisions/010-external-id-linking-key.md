# ADR 010 — external_id as the Medusa ↔ Strapi linking key

**Status:** Accepted

## Decision
Use `external_id` as the stable field that links a Medusa product to its corresponding Strapi product content entry.

## How it works
- Every Medusa product has a custom `external_id` field (string, unique)
- Every Strapi `product-content` entry has an `external_id` field (string, required, unique)
- The storefront fetches a product from Medusa by handle/slug, then fetches the matching Strapi content by `external_id`
- `external_id` is locale-agnostic — it identifies the product, not the locale. Strapi handles locale variants internally.

## Why not product handle
- Handle can change (slug renames for SEO purposes)
- `external_id` is stable and intentionally opaque — it survives handle changes

## Consequences
- `external_id` must be set when creating products in either system
- During WooCommerce migration, existing product IDs or a generated stable key will be used as `external_id`
- If a Strapi content entry is missing for a product, the storefront must degrade gracefully (render commerce data only)
