# PDP Sections Playbook

This note captures implementation details learned while rebuilding the Gravite and Varros product pages. Read this before editing PDP sections, section schemas, or product content.

## Architecture

PDP pages are section-driven:

```text
Strapi product.sections
  -> apps/storefront/server/api/products/[handle].get.ts
  -> apps/storefront/pages/product/[handle].vue
  -> apps/storefront/components/pdp/PdpSectionRenderer.vue
```

The Strapi and Medusa join key is the product `handle`. Medusa owns commerce data; Strapi owns section order and editorial content.

When adding a new PDP section type, update all of these:

- `apps/content/src/components/pdp/*.json`
- `apps/content/src/api/product/content-types/product/schema.json`
- `apps/storefront/types/content.ts`
- `apps/storefront/server/api/products/[handle].get.ts`
- `apps/storefront/components/pdp/PdpSectionRenderer.vue`
- a Vue component in `apps/storefront/components/pdp/`

If reusing an existing section with a visual variant, prefer a `theme` enum over duplicating the component.

## Current Fragrance PDP Stack

`particle-gravite` and `particle-varros` use this family of reusable sections:

- `pdp.page-header`
- `pdp.scroll-tabs`
- `pdp.banner-section`
- `pdp.price-section`
- `pdp.carousel-section`
- `pdp.stamped-reviews`

Gravite also uses `pdp.horizontal-accordion`. Varros does not have that section in the scraped page.

Theme-capable sections currently include:

- `pdp.page-header`: `theme: gravite | varros`
- `pdp.scroll-tabs`: `theme: gravite | varros`
- `pdp.banner-section`: `theme: gravite | varros`
- `pdp.price-section`: `theme: gravite | varros`
- `pdp.carousel-section`: `theme: gravite | varros`
- `pdp.stamped-reviews`: `theme: default | dark | varros`

After adding fields to Strapi component schemas, restart Strapi so it creates the DB columns:

```powershell
docker compose restart content
```

Then restart or recreate the storefront if Nuxt is serving stale component CSS:

```powershell
docker compose exec -T redis redis-cli FLUSHDB
docker compose up -d --force-recreate storefront
```

## Scroll Tabs: Gravite vs Varros

`PdpScrollTabs.vue` intentionally contains two different layouts.

Gravite uses:

- `.scroll-tabs` on desktop
- `.scroll-tabs-mobile` on mobile
- a left timeline and separate right image stack
- GSAP trigger ids: `desktop-scroll-tabs`, `mobile-scroll-tabs`

Varros uses:

- `.scroll-tabs-varros`
- one bordered flex row of tab items
- each item has `.part-left` and `.part-right`
- active tab expands `.part-right`
- GSAP trigger ids: `varros-desktop`, `varros-mobile`

Important: keep the Varros selectors isolated. The generic Gravite rule `.items .item` previously leaked into Varros and broke the layout by adding `width: 100%`, `margin-top`, and `padding-left`. Always reset those inside `.scroll-tabs-varros .item`:

```scss
.scroll-tabs-varros {
  .item {
    width: auto;
    margin-top: 0;
    padding-left: 0;
  }
}
```

Do not replace the Varros layout with a grid unless you are intentionally redesigning it. The original WordPress implementation is flex-based and animates `flexGrow`, `.part-right` `width`, `flexBasis`, `paddingRight`, and image opacity.

Original references:

- `C:\Users\denis\Desktop\Particle Worspace\particleformen\wp-content\themes\particleformen\app\blocks\tabs-scroll-block\block.php`
- `C:\Users\denis\Desktop\Particle Worspace\particleformen\wp-content\themes\particleformen\assets\js\tabs-scroll.js`
- `C:\Users\denis\Desktop\Particle Worspace\particleformen\wp-content\themes\particleformen\assets\css\tabs-scroll.css`

## Check Availability CTA

The fragrance hero CTA must jump to `#price` while skipping pinned scroll-tab animation.

`PdpPageHeader.vue` does this by:

1. Preventing the normal hash jump.
2. Dispatching `pdp:scroll-tabs-skip-jump-start`.
3. Killing `desktop-scroll-tabs`, `mobile-scroll-tabs`, `varros-desktop`, and `varros-mobile`.
4. Waiting for layout to settle.
5. Looking up `#price` after the triggers are killed.
6. Scrolling to the corrected position.
7. Dispatching `pdp:scroll-tabs-skip-jump-complete` so tabs reinitialize.

If the CTA lands in a strange place, check whether target lookup is happening before pin spacers are removed.

## Banner And Hero Theme Gotchas

Varros is generally a light theme, but not all text is dark:

- Varros hero text is white over a darkened hero image.
- Varros hero CTA is white with dark text.
- Varros banner overlay text is white, even though the section background/theme is beige.
- Varros price/reviews sections use dark text on beige.

For `PdpBannerSection.vue`, scoped CSS order can be stubborn during HMR. There is an additional non-scoped override for `.banner-section--varros` to force title/body text white.

If a browser still shows old scoped CSS, recreate the storefront container and use a cache-busting query string.

## Stamped Reviews

Stamped reviews are fetched by the Nuxt server route and cached in Redis.

Required env:

```env
NUXT_STAMPED_PUBLIC_KEY=...
NUXT_STAMPED_STORE_URL=www.particleformen.com
NUXT_STAMPED_WIDGET_CACHE_TTL=86400
```

Do not add a WooCommerce scraping fallback. If the public key is missing, the widget endpoint should fail clearly.

Product ids used during local rebuild:

- Gravite: `1646173`
- Varros: `3276357`

`PdpStampedReviews.vue` has theme classes:

- `pdp-stamped-reviews--dark` for Gravite
- `pdp-stamped-reviews--varros` for Varros

Stamped injects its own HTML and CSS. Some overrides need non-scoped selectors or broad selectors because Stamped CSS can be loaded later and use strong selectors.

## Content Seeding Notes

For local speed, fragrance pages were seeded directly into Strapi Postgres by inserting component rows and `products_cmps` dynamic-zone links. This is acceptable for local restoration but be careful:

- Restart Strapi after schema edits before inserting into new columns.
- Flush Redis after changing Strapi content directly.
- `products_cmps.order` controls section order.
- Do not delete unrelated product sections unless the task is specifically to replace that product page.

Useful checks:

```powershell
# Current PDP section order for a product
docker compose exec -T postgres-content psql -U strapi -d strapi_db -c "select pc.order, pc.component_type, pc.cmp_id from products_cmps pc join products p on p.id=pc.entity_id where p.handle='particle-varros' and pc.field='sections' order by pc.order;"

# Storefront product API section list
$r = Invoke-RestMethod 'http://localhost:3000/api/products/particle-varros?ts=check'
$r.sections | ForEach-Object { \"$($_.__component) theme=$($_.theme) title=$($_.title)\" }
```

## Verification Checklist

After PDP section work:

```powershell
docker compose exec -T storefront pnpm typecheck
docker compose exec -T redis redis-cli FLUSHDB
docker compose restart storefront
```

Then verify in browser with a cache-busting query:

- `http://localhost:3000/product/particle-gravite?ts=<label>`
- `http://localhost:3000/product/particle-varros?ts=<label>`

Check:

- section order matches scraped page
- `Check Availability` lands on the add-to-cart section
- scroll-tabs still work when scrolling back up
- add-to-cart button shows spinner while loading
- Stamped reviews load and do not show the unavailable fallback
