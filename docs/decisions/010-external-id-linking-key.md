# ADR 010 — Medusa ↔ Strapi linking key

**Status:** Superseded by ADR 011

## Original decision (superseded)
Use a custom `external_id` field on both the Medusa product and the Strapi content entry as the stable cross-system link.

## Why it was superseded
After reviewing the [official Medusa v2 Strapi integration guide](https://docs.medusajs.com/resources/integrations/guides/strapi), the canonical pattern is different and does not require a custom field on the Medusa side.

## Current decision — see ADR 011
- Strapi stores `medusaId` (the Medusa product/variant/option ID) on each synced content type
- Medusa stores `metadata.strapi_id` and `metadata.strapi_document_id` on its products and variants — written automatically by the sync workflow, not by hand
- The link is maintained by two-way sync workflows, not a manually managed shared key

## Migration note
During WooCommerce data migration, the Medusa product IDs (assigned at import time) become the `medusaId` values in Strapi. No separate stable key is needed.
