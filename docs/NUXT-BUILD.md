# Nuxt Storefront Build Plan

Inspected source: scraped particleformen.com HTML + theme CSS/SCSS files from the WP codebase.
This doc is the single source of truth for building the Nuxt app. Update it as decisions change.

**Current status (2026-04-26):** The first Nuxt storefront flow is live locally: home page, PDP, Medusa-backed add-to-cart, cart drawer, `/cart` page, and a dev/admin toolbar. Strapi owns page/PDP/cart sections and uploaded media. Medusa owns product price, variants, cart line items, totals, and future checkout/order data.

**Reference codebases:**
- Scraped HTML + assets: `C:\Users\denis\Desktop\Cursor Projects\particleformen-scrape\output\`
- WP theme source (CSS/SCSS/fonts/SVGs): `C:\Users\denis\Desktop\Particle Worspace\particleformen\wp-content\themes\particleformen\`
- Neue Haas Grotesk font files (TTF): `C:\Users\denis\Desktop\Particle Worspace\particleformen\wp-content\plugins\landing-pages\assets\bluechew-like-lp\fonts\neue-haas-grotesk-display-pro\`

---

## Design tokens — extracted from real site

### Colors

| Token name | Hex | Used for |
|---|---|---|
| `$color-navy-deep` | `#030b2e` | Header bg (home/dark pages), mobile menu bg |
| `$color-navy` | `#050446` | Body text, section titles |
| `$color-navy-mid` | `#222A58` | Nav text, some buttons |
| `$color-topstrip` | `#09152b` | Announcement bar bg |
| `$color-footer` | `#293850` | Footer bg |
| `$color-sky` | `#52BBE8` | Hero headline, CTA button bg |
| `$color-blue` | `#0038B1` | Accent: hover states, headline spans |
| `$color-sky-light` | `#69c3eb` | Newsletter button bg |
| `$color-hero-bg` | `#ebf0f4` | Hero fallback bg (before video loads) |
| `$color-footer-rule` | `#adadb8` | Footer `<hr>` |
| `$color-footer-sep` | `#424b65` | Footer section separator |
| `$color-white` | `#ffffff` | — |

### Typography — fonts

All font files are confirmed available in the WP codebase. Copy to `public/fonts/` at build time.

| SCSS var | Family | Weights | Source path (relative to WP root) |
|---|---|---|---|
| `$font-display` | Neue Haas Grotesk Display Pro | 400 (Roman), 500 (Medium), 700 (Bold) | `wp-content/plugins/landing-pages/assets/bluechew-like-lp/fonts/neue-haas-grotesk-display-pro/` |
| `$font-body` | Raleway | 200, 400, 500, 600, 700, 800, 900 | `wp-content/themes/particleformen/assets/fonts/Raleway/` |
| `$font-ui` | Prompt | 300, 400, 600, 700 | `wp-content/themes/particleformen/assets/fonts/Prompt/` |
| `$font-accent` | Poppins | 400, 500, 700 | `wp-content/themes/particleformen/assets/fonts/Poppins/` |
| `$font-heading` | Montserrat | 300, 400, 700 | `wp-content/themes/particleformen/assets/fonts/Montserrat/` (woff2 + ttf) |

> All fonts are self-hosted via `public/fonts/` — no Google Fonts CDN request. Load with `@font-face` in `assets/scss/base/_fonts.scss`.

### Layout measurements

| Token | Value | Notes |
|---|---|---|
| `$container-max` | `1406px` | Main content container |
| `$section-inner-max` | `1640px` | Section inner wrapper (wider than container) |
| `$header-height` | `77px` | Desktop (17px padding × 2 + ~43px content) |
| `$topstrip-height` | `40px` | Announcement bar min-height |
| `$main-padding-top` | `125px` | Clears fixed header + topstrip |

---

## Decisions

| Topic | Decision |
|---|---|
| Announcement bar | **Always visible.** No dismiss button. |
| Language selector | **Present in header.** EN-only placeholder for now (flag + "en" text, no dropdown logic yet). Full i18n routing is out of scope for this phase. |
| Fonts | **Self-hosted** — all WOFF2/TTF files copied from WP codebase into `public/fonts/`. No external font CDN. |
| CSS approach | **Recreate from scratch** in SCSS using exact design tokens. Reference WP theme SCSS source at `assets/css/*.scss` for measurements and structure. |
| Component library | **`@headlessui/vue`** for mega-menu and mobile drawer (keyboard accessibility). **`@vueuse/nuxt`** for scroll utilities. No full UI framework. |
| Cart icon | Wired to `useCart()` live Medusa cart count. Click opens the cart drawer instead of navigating directly. |
| Product linking | Strapi product content and Medusa products are linked by matching `handle`; do **not** reintroduce `medusaId`. |
| Media ownership | Strapi media upload fields are used for editorial images/videos. Do not use external image URLs in Strapi content. |
| Cart page | `/cart` is a Strapi-backed `page` with `sections.cart-main`; line items and totals come from Medusa. |

---

## Assets to copy from WP theme

The following files need to be copied into `apps/storefront/public/` or `assets/` before Step 1:

| Asset | WP source | Destination |
|---|---|---|
| Neue Haas Grotesk (3 TTF) | `plugins/landing-pages/assets/bluechew-like-lp/fonts/neue-haas-grotesk-display-pro/` | `public/fonts/NeueHaas/` |
| Raleway (7 WOFF2) | `themes/particleformen/assets/fonts/Raleway/` | `public/fonts/Raleway/` |
| Prompt (4 WOFF2) | `themes/particleformen/assets/fonts/Prompt/` | `public/fonts/Prompt/` |
| Poppins (3 WOFF2) | `themes/particleformen/assets/fonts/Poppins/` | `public/fonts/Poppins/` |
| Montserrat (WOFF2: Light, Regular, Bold) | `themes/particleformen/assets/fonts/Montserrat/*.woff2` | `public/fonts/Montserrat/` |
| `basket.svg` | `themes/particleformen/assets/images/basket.svg` | `public/icons/` |
| `burger.svg` | `themes/particleformen/assets/images/burger.svg` | `public/icons/` |
| `arrow-right.svg` | `themes/particleformen/assets/images/arrow-right.svg` | `public/icons/` |
| `arrow-accent.svg` | `themes/particleformen/assets/images/arrow-accent.svg` | `public/icons/` |
| `logo-particle.svg` | `themes/particleformen/assets/images/logo-particle.svg` | `public/icons/` |
| Flag SVGs (12) | `themes/particleformen/assets/images/flag/*.svg` | `public/icons/flags/` |

---

## Dependencies to add

```bash
pnpm add @headlessui/vue --filter @particle-turbo/storefront
pnpm add @vueuse/nuxt @vueuse/core --filter @particle-turbo/storefront
```

`nuxt.config.ts` modules array becomes:
```typescript
modules: ['@vueuse/nuxt'],
```

---

## File structure to build

```
apps/storefront/
  public/
    fonts/
      NeueHaas/           ← NeueHaasDisplayRoman/Medium/Bold.ttf
      Raleway/            ← Raleway-*.woff2 (7 weights)
      Prompt/             ← Prompt-*.woff2 (4 weights)
      Poppins/            ← Poppins-*.woff2 (3 weights)
      Montserrat/         ← Montserrat-*.woff2 (Light, Regular, Bold)
    icons/
      basket.svg
      burger.svg
      arrow-right.svg
      arrow-accent.svg
      logo-particle.svg
      flags/              ← en-flag.svg, gb-flag.svg, … (12 flags)

  assets/
    scss/
      variables.scss              ← UPDATE: exact color/font/layout tokens
      main.scss                   ← UPDATE: @forward all partials
      base/
        _reset.scss               ← UPDATE: match original box-sizing, list, img resets
        _typography.scss          ← UPDATE: body font, size, color
        _fonts.scss               ← NEW: @font-face declarations for all self-hosted fonts
      utils/
        _accessibility.scss       ← keep as-is

  layouts/
    default.vue                   ← TheHeader + <slot> + TheFooter. Fetches site-setting.
    clean.vue                     ← No header/footer (for landing pages with show_header=false)

  components/
    layout/
      TheHeader.vue               ← Composes AnnouncementBar + NavBar
      AnnouncementBar.vue         ← Topstrip: always-visible dark strip with text from Strapi
      NavBar.vue                  ← Logo + desktop nav + right icons row
      NavItem.vue                 ← Single top-level nav item (plain link or mega-menu trigger)
      MegaMenu.vue                ← Dropdown panel: section headings + product links + hover image
      MobileMenu.vue              ← Slide-in drawer (@headlessui/vue Dialog), dark bg
      CartIcon.vue                ← basket.svg + live Medusa cart count; opens drawer
      LanguageSelector.vue        ← EN flag + "en" text. Placeholder — no switching logic yet.
      TheFooter.vue               ← Columns + bottom bar
      FooterColumn.vue            ← Heading + link list
      FooterBottom.vue            ← Social icons + payment icons + copyright + legal links

    sections/
      SectionRenderer.vue         ← v-if/component switch on section.__component
      HeroSection.vue             ← Full-viewport video bg + headline (v-html) + CTA
      LogosSlider.vue             ← Auto-scrolling press logo strip with gradient fade edges
      BestSellers.vue             ← Strapi media-field product card grid
      AllProducts.vue             ← Strapi-driven category tabs + product cards
      InstaBlock.vue              ← Social proof/video block with uploaded decorative media
      CartMain.vue                ← Medusa-backed cart table + order summary

    pdp/
      PdpSectionRenderer.vue      ← PDP-only section renderer
      PdpAddToCartRegular.vue     ← PDP gallery + quantity cards + Medusa add-to-cart

    cart/
      CartDrawer.vue              ← Medusa-backed cart drawer

    admin/
      AdminBar.vue                ← Dev/admin toolbar: Strapi edit, Medusa edit, cart actions

    ui/
      AppLink.vue                 ← NuxtLink for internal, <a target="_blank"> for external
      AppImage.vue                ← <img> prefixed with strapiUrl + lazy loading + alt
      AppButton.vue               ← Button variants: primary (sky blue), outline, text

  composables/
    useSiteSettings.ts            ← useAsyncData → /api/site-setting, shared via useState
    useStrapi.ts                  ← $fetch wrapper with base URL + token (client-side safe)
    useCart.ts                    ← cookie-backed Medusa cart state, drawer state, mutations

  server/
    api/
      site-setting.get.ts         ← Strapi site-setting with full nested populate
      pages/[slug].get.ts         ← Strapi page by slug + hero + sections populate
      products/[handle].get.ts    ← Strapi PDP content + Medusa product by handle
      cart/                       ← create/get cart, add/update/remove line items, recommendations
    utils/
      strapi.ts                   ← Server $fetch helper (NUXT_STRAPI_API_TOKEN injected)
      medusa.ts                   ← Server $fetch helper for Medusa

  pages/
    index.vue                     ← Home: fetches /api/pages/home → SectionRenderer
    product/[handle].vue          ← PDP: fetches /api/products/[handle] → PDP sections
    cart.vue                      ← Strapi-backed cart page with fallback cart-main section
```

---

## Build order

### Step 1 — Assets + tokens + fonts

1. **Copy font files and SVG icons** from WP codebase into `public/fonts/` and `public/icons/` (see Assets table above).
2. **Create `assets/scss/base/_fonts.scss`** — `@font-face` declarations for all 5 font families, referencing `/fonts/...` paths.
3. **Update `assets/scss/variables.scss`** — replace all placeholder values with exact tokens from the Design tokens table. Add `$color-navy-deep`, `$color-sky`, `$color-footer`, `$font-display`, `$font-ui`, `$container-max`, `$topstrip-height`, `$header-height`, `$main-padding-top`.
4. **Update `assets/scss/base/_reset.scss`** — match original: `box-sizing`, list reset, `img { display: block; max-width: 100% }`, `a { text-decoration: none }`, margin resets on headings/p/li.
5. **Update `assets/scss/base/_typography.scss`** — `body { font-family: $font-body; color: $color-navy; line-height: 1.5; font-size: 1rem }`.
6. **Update `assets/scss/main.scss`** — `@forward` (or `@use`) all base partials including the new `_fonts`.

### Step 2 — Server data layer

7. **`server/utils/strapi.ts`** — typed `$fetch` helper, reads `process.env.NUXT_STRAPI_API_TOKEN` and `process.env.NUXT_PUBLIC_STRAPI_URL`, adds `Authorization: Bearer` header.
8. **`server/api/site-setting.get.ts`** — Strapi populate query covering header nav + mega_menu images, footer columns + links, social_links, logo, favicon, payment_icons, skin_cancer_badge, announcement_bar_text, default_seo.
9. **`server/api/pages/[slug].get.ts`** — Strapi page by slug: `populate[hero][populate]=background_video,mobile_video,cta`, `populate[sections][populate][logos][populate]=image`.

### Step 3 — Layout shell

10. **`composables/useSiteSettings.ts`** — `useAsyncData('site-settings', () => $fetch('/api/site-setting'))`, shared via `useState` so it's fetched once per SSR request.
11. **`layouts/default.vue`** — calls `useSiteSettings()`, passes `header` data to `<TheHeader>` and `footer` data to `<TheFooter>`. `<main>` has `padding-top: $main-padding-top`.
12. **`app.vue`** — `<NuxtLayout>` wrapper only, no content.

### Step 4 — Header

13. **`AnnouncementBar.vue`** — single dark strip (`background: $color-topstrip`). Text from `siteSettings.announcement_bar_text`. Always visible.
14. **`LanguageSelector.vue`** — renders `en-flag.svg` + "en" text. No click logic yet. Visually matches original (flag + 2-letter code + chevron).
15. **`CartIcon.vue`** — `basket.svg` icon + live `useCart().itemCount`. Pointer cursor, opens `<CartDrawer>`.
16. **`MegaMenu.vue`** — dropdown panel. Uses `@headlessui/vue` `Menu` + `MenuItems` for keyboard support. Renders section headings (`is_heading=true` items as `<h3>`, no link), then product items with label + optional product image (absolutely positioned, fades in on hover).
17. **`NavItem.vue`** — if `item.mega_menu.length > 0`: renders as `<Menu>` trigger + `<MegaMenu>`. Otherwise: plain `<NuxtLink>`.
18. **`MobileMenu.vue`** — `@headlessui/vue` `Dialog`. Dark bg `$color-navy-deep`. Opens from left (370px). Contains nav items as stacked links, language selector, cart link.
19. **`NavBar.vue`** — flex row: logo (left) → `<nav>` with `NavItem` list (center) → cart + language + burger (right). Adds `.header--dark` class when `route.name === 'index'`. `position: fixed; top: 0; z-index: 180`.
20. **`TheHeader.vue`** — stacks `<AnnouncementBar>` + `<NavBar>`. Scroll handler via `useWindowScroll`: when `y > $topstrip-height`, add class that shifts `top` to `-$topstrip-height` (slides bar out of view) and darkens background.

### Step 5 — Footer

21. **`FooterColumn.vue`** — props: `heading`, `links[]`. Renders `<h2>` + `<ul>` with `<AppLink>` per item.
22. **`FooterBottom.vue`** — social icons (inline SVG per platform mapped from `platform` enum), payment icons (`<AppImage>`), copyright text, legal links separated by `|`.
23. **`TheFooter.vue`** — dark bg `$color-footer`. Padding `77px 0 44px`. Flex row of `<FooterColumn>` components. `<hr>`. `<FooterBottom>`.

### Step 6 — Home page sections

24. **`HeroSection.vue`** — `<section>` with full-viewport height. `.bg` div contains `<video autoplay muted loop playsinline>` with two `<source>` elements (desktop + mobile, switched via `matchMedia` on mount). Headline via `v-html`. CTA uses `<AppButton>` + `<AppLink>`.
25. **`LogosSlider.vue`** — receives `logos[]` (each has `image`, `alt`). Duplicates array for seamless loop. CSS `@keyframes` translate animation. `::before`/`::after` gradient fade overlays. Logos rendered as `<AppImage>` with `filter: grayscale(1); opacity: 0.3`.
26. **`SectionRenderer.vue`** — maps `__component` string to Vue component. Passes full `section` object as prop.
27. **`pages/index.vue`** — `useAsyncData('home', () => $fetch('/api/pages/home'))`. Renders `<HeroSection :hero="page.hero" />` then `<SectionRenderer v-for="section in page.sections" />`.

---

## Header behaviour details

| Behaviour | Implementation |
|---|---|
| Fixed at top | `position: fixed; width: 100%; z-index: 180` |
| Scroll: hide topstrip | `useWindowScroll` y > 40px → add `.scrolled` class → `top: -40px`, bg `#030b2e`, box-shadow |
| Dark on home page | `route.name === 'index'` → `.header--dark` class → bg `#030b2e`, logo/text white |
| Dark on scroll (any page) | `.scrolled` state → bg solidifies to `#030b2e` |
| Mobile breakpoint | ≤ 992px: hide desktop nav + language, show burger |

---

## Mega-menu details

| Behaviour | Value / approach |
|---|---|
| Trigger | Hover on desktop + keyboard via `@headlessui/vue Menu` |
| Position | `position: absolute; left: 50%; transform: translateX(-50%); top: 62px` |
| Triangle arrow | CSS `::before` on dropdown panel (border-trick, 8.5px × 12px) |
| Hover bridge gap | CSS `::after` on dropdown: 41px tall invisible block above panel to prevent hover loss |
| Product image preview | Absolutely positioned, right side of panel, `opacity:0` → `opacity:1` on `li:hover` or `:focus-within` |
| Section headings | Items with `is_heading: true` → non-interactive `<h3>`, `font-weight: 800` |
| Sub-item indentation | `margin-left: 10px` on non-heading items |

---

## Hero section details

| Property | Value |
|---|---|
| Height | `calc(100vh + 100px)` desktop / `calc(100svh + 56px)` mobile (≤481px) |
| Max-height | `1060px` |
| Margin-top | `-154px` — pulls section under fixed header |
| Headline font | `$font-display`, 94px → 74px (≤1360px) → 60px (≤576px) |
| Headline colour | `$color-sky` (#52BBE8), `<span>` = white, font-weight 700 |
| Content alignment | Bottom-left: `align-items: flex-end; padding-left: 60px; padding-bottom: 60px` |
| CTA button | `background: $color-sky; border-radius: 7px; min-width: 232px; min-height: 64px; font-weight: 700; text-transform: uppercase` |
| Video | `object-fit: cover; object-position: center bottom` |
| Overlay | `::after` on `.bg`: `background: #000; opacity: 0.05` |

---

## Logos slider details

| Property | Value |
|---|---|
| Padding | `50px 0` desktop / `35px 0` (≤950px) |
| Background | White + `box-shadow: 6px 9px 30px 0 rgba(40,32,71,.05)` |
| Logo style | `filter: grayscale(1); opacity: 0.3` |
| Logo gap | `margin: 0 20px` each item |
| Animation | CSS `@keyframes logo-scroll` — `transform: translateX(0)` → `translateX(-50%)` (since array is doubled, -50% = exactly one set of logos). `animation: logo-scroll 20s linear infinite` |
| Edge fade (desktop) | `::before` / `::after`: `width: 235px`, linear-gradient from white |
| Edge fade (mobile) | `width: 80px` (≤950px) |

---

## Strapi image URL pattern

Strapi v5 (local Docker) serves images at `http://localhost:1337/uploads/...`.
In production: CDN base URL (R2/S3) configured via env var.

```vue
<!-- AppImage.vue -->
<img :src="`${strapiUrl}${image.url}`" :alt="image.alternativeText || alt" loading="lazy" />
```

`strapiUrl = useRuntimeConfig().public.strapiUrl`

---

## Implemented commerce/page-builder scope

- Home page sections: `hero`, `logos-slider`, `best-sellers`, `all-products`, `insta-block`.
- PDP route: `/product/[handle]`.
- PDP-only dynamic zone: Strapi `product.sections` currently allows `pdp.add-to-cart-regular`.
- Product page: `Particle Face Mask` exists in Strapi with uploaded gallery, video poster, guarantee icons, and quantity-card images.
- Add to cart: `PdpAddToCartRegular.vue` sends the selected Strapi quantity to Medusa using the default Medusa variant resolved by matching product `handle`.
- Cart drawer: globally mounted, Medusa-backed, opens after add-to-cart, updates header count.
- Cart page: `/cart` fetches Strapi `page` slug `cart`, renders `sections.cart-main`, and lets users update/remove Medusa cart items with recalculated totals.
- Admin toolbar: dev/admin-only top tab with Strapi edit link, Medusa edit link, open cart, clear cart, reload.

---

## Still upcoming

- Checkout flow: shipping, payment sessions, order placement, confirmation page.
- Customer auth/account: Medusa customer login/register/logout, previous orders, guest cart attach/merge.
- Product/category listing routes matching WooCommerce URL patterns.
- Account / order pages
- Blog / articles
- Full i18n routing + language switching
- Search

---

## Open questions

All previously open questions are resolved:

| Question | Answer |
|---|---|
| Neue Haas Grotesk font files | ✅ Available at `plugins/landing-pages/assets/bluechew-like-lp/fonts/neue-haas-grotesk-display-pro/` |
| Language selector | ✅ Present — EN placeholder only, no switching logic |
| Announcement bar dismissible | ✅ Always visible, no dismiss button |
