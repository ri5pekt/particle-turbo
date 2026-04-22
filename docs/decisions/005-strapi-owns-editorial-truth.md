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
- Product content in Strapi is linked to Medusa products via `external_id` (see ADR 010)
