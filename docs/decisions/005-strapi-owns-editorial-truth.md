# ADR 005 — Strapi owns editorial truth

**Status:** Accepted

## Decision
Strapi is the single source of truth for all editorial and content data. No other system stores marketing copy, SEO fields, or content blocks.

## Strapi-owned fields
- SEO title, description, canonical, OG tags (per locale)
- Landing page content and structure
- Product page content blocks (hero, ingredients, FAQs, marketing sections)
- Blog articles
- Banners and promotional content
- Media library
- Navigation structures (if CMS-managed)

## Consequences
- Medusa never stores SEO copy or marketing content
- All content is locale-aware via Strapi i18n — every content type has locale variants
- Product editorial content is linked to Medusa by matching product `handle` (see ADR 010/011). The older `medusaId` sync approach has been removed and should not be reintroduced.
- Editorial content types (landing pages, blog posts, banners, SEO fields) are Strapi-only and not synced to Medusa
