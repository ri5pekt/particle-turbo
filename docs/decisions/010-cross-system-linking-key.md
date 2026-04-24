# ADR 010 — Cross-system linking key: product handle

**Status:** Active (supersedes the earlier `medusaId` / sync approach)

## Decision

Medusa and Strapi are joined by **product `handle`** — a URL-friendly slug that is identical in both systems (e.g. `particle-face-wash`).

Nuxt server routes query both APIs independently and merge the results:

```ts
// server/api/products/[handle].get.ts
const [medusaData, strapiData] = await Promise.all([
  $medusa(`/store/products?handle=${handle}`),
  $strapi(`/api/products?filters[handle][$eq]=${handle}&populate=deep`),
])
return { ...medusaData, editorial: strapiData ?? null }
```

## Why not a shared foreign key / sync?

A Medusa → Strapi product sync was built and then deliberately removed. The sync:

- Duplicated product data across two databases
- Required subscribers, workflows, a custom module, and a webhook endpoint
- Was the most fragile part of the architecture (first to break, hardest to debug)
- Provided no benefit over simply querying both APIs at request time

## Consequences

- Strapi product entries are created and enriched manually by content editors (or via one-time import scripts), not auto-generated
- If no Strapi entry exists for a handle, Nuxt falls back to Medusa-only data
- Handles must be kept in sync between systems — when a product handle changes in Medusa, the corresponding Strapi entry handle must be updated manually (rare; handles are stable)
- No sync tokens, no webhook keys, no subscribers needed in `apps/commerce`
