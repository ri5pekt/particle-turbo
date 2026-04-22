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
- Product sync content types (`product`, `product-variant`, `product-option`, `product-option-value`) are linked to Medusa via `medusaId` field — maintained automatically by the two-way sync (see ADR 011)
- Editorial content types (landing pages, blog posts, banners, SEO fields) are Strapi-only and not synced to Medusa
