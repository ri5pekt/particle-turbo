# Content Seeding — populating Strapi from the scraped site

This document describes how to seed Strapi content from the scraped `particleformen.com` website. It covers the scrape folder layout, the PowerShell patterns that actually work in this environment, what has already been populated, and how to add more.

---

## Scrape location

All scraped data lives outside the repo:

```
C:\Users\denis\Desktop\Cursor Projects\particleformen-scrape\output\
  html\          ← full HTML pages (home.html, cart.html, category pages, product pages, …)
  assets\        ← all static assets, mirrored from the live site
    www.particleformen.com\
      wp-content\uploads\    ← product images, logos, banners
```

Key pages to reference:
| File | What it contains |
|---|---|
| `html\home.html` | Hero video, logos slider, CTA sections, footer and header structure |
| `html\cart.html` | Every product added to cart — full product listing with image filenames |
| `html\[product-slug].html` | Individual product page markup |

---

## Strapi admin API authentication

All content population goes through the **admin API** (not the public REST API). The admin API requires a bearer token obtained by logging in.

```powershell
$strapiBase = "http://localhost:1337"
$body = '{"email":"denis@particleformen.com","password":"23ltybc69"}'
$auth = Invoke-RestMethod -Uri "$strapiBase/admin/login" -Method Post `
    -Body $body -ContentType "application/json"
$token = $auth.data.token
```

> **Rate limiting:** Strapi's admin login endpoint is rate-limited by default (~5 attempts per 5-minute window). If you hit a `429 RateLimitError`, either wait ~5 minutes or disable rate limiting in `apps/content/config/admin.ts`:
>
> ```typescript
> rateLimit: {
>   enabled: false,
> },
> ```
>
> Then `docker compose restart content` and retry. The current `admin.ts` already has this set.

---

## Uploading media files

PowerShell 5.1 (the default on Windows 10) does **not** support the `-Form` parameter on `Invoke-RestMethod`. Use the following custom function instead:

```powershell
function Upload-File($token, $filePath, $fileName) {
    $boundary = [System.Guid]::NewGuid().ToString("N")
    $ct       = "multipart/form-data; boundary=$boundary"
    $nl       = "`r`n"
    $enc      = [System.Text.Encoding]::UTF8

    $header     = "--$boundary$nl" +
                  "Content-Disposition: form-data; name=`"files`"; filename=`"$fileName`"$nl" +
                  "Content-Type: image/png$nl$nl"
    $footer     = "$nl--$boundary--$nl"
    $headerB    = $enc.GetBytes($header)
    $footerB    = $enc.GetBytes($footer)
    $fileB      = [System.IO.File]::ReadAllBytes($filePath)
    $bodyBytes  = New-Object byte[] ($headerB.Length + $fileB.Length + $footerB.Length)
    [System.Buffer]::BlockCopy($headerB, 0, $bodyBytes, 0,                           $headerB.Length)
    [System.Buffer]::BlockCopy($fileB,   0, $bodyBytes, $headerB.Length,              $fileB.Length)
    [System.Buffer]::BlockCopy($footerB, 0, $bodyBytes, $headerB.Length+$fileB.Length,$footerB.Length)

    $resp = Invoke-RestMethod -Uri "$strapiBase/upload" -Method Post `
        -Headers @{ Authorization = "Bearer $token" } `
        -ContentType $ct -Body $bodyBytes
    return $resp[0]
}

# Usage
$result = Upload-File -token $token -filePath "C:\path\to\image.png" -fileName "image.png"
Write-Host "Uploaded: id=$($result.id)"
```

The returned `id` is what you pass as `@{ id = $result.id }` in component payloads.

---

## Updating a Single Type (e.g. site-setting)

```powershell
$payload = @{
    site_name = "Particle for Men"
    header    = @{
        transparent_on_home = $true
        cta_label           = "Shop Now"
        cta_url             = "/products"
        nav                 = @(
            @{
                label    = "Face"
                mega_menu = @(
                    @{ label = "Face"; is_heading = $true },
                    @{ label = "Face Wash"; url = "/products/face-wash"; image = @{ id = 10 } }
                )
            }
        )
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
    -Uri "$strapiBase/content-manager/single-types/api::site-setting.site-setting" `
    -Method Put -Headers @{ Authorization = "Bearer $token" } `
    -ContentType "application/json" -Body $payload
```

> **Important:** `ConvertTo-Json` in PS 5.1 does not support `EscapeHandling EscapeNonAscii`. Non-ASCII characters (©, é, —) may come through garbled. Either correct them manually in the Strapi admin afterwards, or replace them with ASCII equivalents in the PS payload before sending.

---

## Updating a Collection Type entry (e.g. a Page)

Collection type mutations require the entry's **`documentId`** (a UUID string), not the numeric `id`.

```powershell
# 1. Find the documentId
$pages  = Invoke-RestMethod -Uri "$strapiBase/content-manager/collection-types/api::page.page" `
    -Headers @{ Authorization = "Bearer $token" }
$docId  = ($pages.results | Where-Object { $_.slug -eq "home" }).documentId

# 2. Update the entry
$payload = @{
    title    = "Home"
    slug     = "home"
    sections = @(
        @{ "__component" = "sections.hero"; enabled = $true; headline = "Hello World" }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
    -Uri "$strapiBase/content-manager/collection-types/api::page.page/$docId" `
    -Method Put -Headers @{ Authorization = "Bearer $token" } `
    -ContentType "application/json" -Body $payload

# 3. Publish the entry
Invoke-RestMethod `
    -Uri "$strapiBase/content-manager/collection-types/api::page.page/$docId/actions/publish" `
    -Method Post -Headers @{ Authorization = "Bearer $token" } `
    -ContentType "application/json" -Body '{}'
```

### Preserving existing component IDs

When you PUT a payload that includes components with `"id"` fields (e.g. an existing hero component), Strapi updates those components in-place rather than creating new ones. Always fetch the current entry first and carry the `id` values forward:

```powershell
$current = Invoke-RestMethod `
    -Uri "$strapiBase/content-manager/collection-types/api::page.page/$docId" `
    -Headers @{ Authorization = "Bearer $token" }
$heroId  = $current.hero.id   # carry this into the PUT payload
```

---

## Extracting content from scraped HTML

Use PowerShell regex to pull specific sections out of an HTML file:

```powershell
$html = Get-Content "C:\Users\denis\Desktop\Cursor Projects\particleformen-scrape\output\html\home.html" -Raw

# Extract a named section
$match = [regex]::Match($html, '(?s)<section class="section-container logos-slider">(.*?)</section>')
$inner = $match.Groups[1].Value

# Extract all img src + alt pairs inside a block
$imgs  = [regex]::Matches($inner, '<img[^>]+src="([^"]+)"[^>]+alt="([^"]+)"')
foreach ($m in $imgs) {
    Write-Host "src=$($m.Groups[1].Value)  alt=$($m.Groups[2].Value)"
}
```

Image paths in the scraped HTML are relative to the `output/` folder, e.g.:
```
../assets/www.particleformen.com/wp-content/uploads/2023/12/l1.png
```

Strip the `../assets/` prefix and prepend the assets root to get the local path:
```
C:\Users\denis\Desktop\Cursor Projects\particleformen-scrape\output\assets\www.particleformen.com\wp-content\uploads\2023\12\l1.png
```

---

## What has already been seeded

### Site Setting (`api::site-setting.site-setting`)

| Field | Status |
|---|---|
| `site_name` | ✅ "Particle for Men" |
| `announcement_bar_text` | ✅ populated |
| `contact_email` | ✅ denis@particleformen.com |
| `contact_phone` | ✅ populated |
| `logo` | ✅ logo.png (media ID varies by install) |
| `favicon` | ✅ favicon.svg |
| `default_seo` | ✅ metaTitle + metaDescription |
| `payment_icons` | ✅ PayPal, Visa, Mastercard |
| `skin_cancer_badge` | ✅ scf.png |
| `social_links` | ✅ Instagram, Facebook, YouTube, TikTok |
| `header.nav` | ✅ all top-level nav items with mega-menu items and product thumbnail images |
| `footer.columns` | ✅ Particle / Products / Bundles & Sets / Account columns |
| `footer.legal_links` | ✅ Privacy Policy, Terms of Service, etc. |
| `footer.copyright_text` | ✅ populated (check for © symbol — may need manual correction) |

### Home Page (`api::page.page`, slug: `home`, documentId: `ceht8nhqjtqd8x67ox8761p0`)

| Section | Status |
|---|---|
| `seo` | ✅ metaTitle + metaDescription |
| `hero` | ✅ headline, uploaded videos/media, CTA. Removed original Nuxt-only subheadline mismatch. |
| `sections.logos-slider` | ✅ press logos via Strapi media upload fields |
| `sections.best-sellers` | ✅ product cards use Strapi media fields, not external URLs |
| `sections.all-products` | ✅ category tabs + product cards |
| `sections.insta-block` | ✅ uploaded molecule decorations + uploaded video |

### Cart Page (`api::page.page`, slug: `cart`, documentId: `fkrfkqq3hfpgeunw1o6so7fj`)

| Section | Status |
|---|---|
| `sections.cart-main` | ✅ seeded and published. Copy comes from Strapi; line items/totals come from Medusa through Nuxt. |

### Product Page (`api::product.product`, handle: `particle-face-mask`)

| Field / Section | Status |
|---|---|
| `handle` | ✅ matches Medusa product handle `particle-face-mask` |
| `sections` | ✅ PDP-only dynamic zone; regular page sections are not available here |
| `pdp.add-to-cart-regular` | ✅ gallery, video poster, guarantee icons, and quantity-card images are uploaded to Strapi media library |

### Media Library

| File | Media ID | Used in |
|---|---|---|
| `logo.png` | varies | site-setting.logo |
| `favicon.svg` | varies | site-setting.favicon |
| `scf.png` | varies | site-setting.skin_cancer_badge |
| `paypal.png` | varies | site-setting.payment_icons |
| `mastercard.png` | varies | site-setting.payment_icons |
| `visa.png` | varies | site-setting.payment_icons |
| Megamenu product thumbnails (×21) | varies | header.nav.mega_menu[*].image |
| `l1.png` – `l6.png` (press logos) | 28–33 | home page logos-slider |
| Best-seller product layers | varies | home page best-sellers |
| All-products card/category media | varies | home page all-products |
| Insta block molecules/video | varies | home page insta-block |
| Face Mask PDP gallery/guarantee/quantity media | varies | `particle-face-mask` PDP |

---

## What still needs to be seeded

- Additional cart page sections below the main cart block, such as `Bundle and Save`, reviews, trust blocks, and upsells. Use Strapi media upload fields for all images.
- Additional PDP pages and PDP-only sections for the rest of the catalog.
- Product/category listing pages matching WooCommerce URL patterns.
- Blog articles (`article` collection type)
- Other pages: FAQ, Contact, About, Shipping, Returns

---

## Strapi admin UI layout cache

After adding new fields to an existing schema, the Strapi admin sometimes shows a stale layout that hides the new fields. Fix:

```powershell
docker exec particle-turbo-postgres-content-1 psql -U strapi -d strapi_db -c "
DELETE FROM strapi_core_store_settings
WHERE key LIKE '%content_types_builder%'
   OR key LIKE '%content_manager_configuration%';"

docker compose restart content
```

This forces Strapi to regenerate the admin UI layout from the current schemas.

---

## Related docs

| File | Purpose |
|---|---|
| `docs/AGENT-GUIDE.md` | Stack overview, hot-reload rules, API patterns |
| `docs/TROUBLESHOOTING.md` | Known issues and fixes |
