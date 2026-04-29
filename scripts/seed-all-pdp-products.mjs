import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const envPath = path.join(root, 'env')
const scrapeHtmlDir = process.env.SCRAPE_HTML_DIR
  ? path.resolve(process.env.SCRAPE_HTML_DIR)
  : path.resolve(root, '..', '..', 'Cursor Projects', 'particleformen-scrape', 'output', 'html')

const readEnv = () => {
  if (!fs.existsSync(envPath)) {
    return {}
  }

  return Object.fromEntries(
    fs.readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=')
        return [line.slice(0, index), line.slice(index + 1)]
      }),
  )
}

const env = { ...readEnv(), ...process.env }
const strapiUrl = env.NUXT_PUBLIC_STRAPI_URL?.replace('content:1337', 'localhost:1337') || 'http://localhost:1337'
const token = env.NUXT_STRAPI_API_TOKEN
let adminToken

if (!token) {
  throw new Error('NUXT_STRAPI_API_TOKEN is required to seed PDP content.')
}

if (!fs.existsSync(scrapeHtmlDir)) {
  throw new Error(`Scraped HTML directory was not found: ${scrapeHtmlDir}`)
}

const apiHeaders = {
  Authorization: `Bearer ${token}`,
}

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...apiHeaders,
      ...(options.headers || {}),
    },
  })
  const text = await response.text()
  const body = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${url} failed: ${response.status} ${text}`)
  }

  return body
}

const getAdminToken = async () => {
  if (adminToken) {
    return adminToken
  }

  if (!env.STRAPI_ADMIN_EMAIL || !env.STRAPI_ADMIN_INITIAL_PASSWORD) {
    throw new Error('STRAPI_ADMIN_EMAIL and STRAPI_ADMIN_INITIAL_PASSWORD are required to upload PDP media.')
  }

  const response = await fetch(`${strapiUrl}/admin/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      email: env.STRAPI_ADMIN_EMAIL,
      password: env.STRAPI_ADMIN_INITIAL_PASSWORD,
    }),
  })
  const body = await response.json()

  if (!response.ok || !body.data?.token) {
    throw new Error(`Strapi admin login failed: ${response.status} ${JSON.stringify(body)}`)
  }

  adminToken = body.data.token
  return adminToken
}

const adminRequest = async (url, options = {}) => {
  const token = await getAdminToken()
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })
  const text = await response.text()
  const body = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${url} failed: ${response.status} ${text}`)
  }

  return body
}

const decodeHtml = (value = '') => {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&trade;/g, '™')
    .replace(/&reg;/g, '®')
}

const cleanText = (value = '') => {
  return decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const stripAttributes = (html = '') => {
  return html
    .replace(/\s+(class|style|id|data-[^=]+|aria-[^=]+|role|tabindex|decoding|loading)="[^"]*"/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim()
}

const uniqueBy = (items, keyFn) => {
  const seen = new Set()
  return items.filter((item) => {
    const key = keyFn(item)
    if (!key || seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

const toAbsoluteAssetUrl = (src = '') => {
  const decoded = decodeHtml(src).trim()

  if (!decoded) {
    return ''
  }

  if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
    return decoded
  }

  const wpPath = decoded.match(/(?:\.\.\/)?assets\/www\.particleformen\.com\/(.+)$/)?.[1]
  if (wpPath) {
    return `https://www.particleformen.com/${wpPath}`
  }

  if (decoded.startsWith('/wp-content/')) {
    return `https://www.particleformen.com${decoded}`
  }

  return ''
}

const fileNameFromUrl = (url) => {
  const pathname = new URL(url).pathname
  return decodeURIComponent(path.basename(pathname)).replace(/[^\w.\-]+/g, '-')
}

const mediaByName = new Map()

const uploadImage = async ({ url, alt }) => {
  if (!url) {
    return null
  }

  const name = fileNameFromUrl(url)

  if (mediaByName.has(name)) {
    return mediaByName.get(name)
  }

  const existing = await adminRequest(`${strapiUrl}/upload/files?page=1&pageSize=1&filters[name][$eq]=${encodeURIComponent(name)}`)
  if (existing?.results?.[0]) {
    mediaByName.set(name, existing.results[0])
    return existing.results[0]
  }

  const imageResponse = await fetch(url)
  if (!imageResponse.ok) {
    console.warn(`[pdp-seed] Could not download ${url}: ${imageResponse.status}`)
    return null
  }

  const arrayBuffer = await imageResponse.arrayBuffer()
  const file = new File([arrayBuffer], name, {
    type: imageResponse.headers.get('content-type') || 'image/jpeg',
  })
  const form = new FormData()
  form.append('files', file)
  form.append('fileInfo', JSON.stringify({
    alternativeText: alt || '',
  }))

  const uploaded = await adminRequest(`${strapiUrl}/upload`, {
    method: 'POST',
    body: form,
  })
  const media = uploaded?.[0] || null

  if (media) {
    mediaByName.set(name, media)
  }

  return media
}

const firstMatch = (html, regex) => html.match(regex)?.[1] || ''

const getMeta = (html, name) => {
  return firstMatch(html, new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i'))
}

const parseImageTags = (html) => {
  return [...html.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*>/gi)]
    .map((match) => {
      const tag = match[0]
      const url = toAbsoluteAssetUrl(match[1])
      const alt = cleanText(tag.match(/\salt="([^"]*)"/i)?.[1] || '')
      return { url, alt }
    })
    .filter((image) => image.url)
}

const getProductCartSection = (html) => {
  const start = html.search(/<section[^>]+class="[^"]*product-cart[^"]*/i)
  if (start < 0) {
    return ''
  }

  const afterStart = html.slice(start + 20)
  const marker = afterStart.search(/<section[^>]+class="(?:product-actions|how-use|ingredients|more-product|reviews-user|why-particle|premium-block|banner-section)"/i)
  return marker > 0 ? html.slice(start, start + 20 + marker) : html.slice(start)
}

const parseTitle = (html) => {
  const titleHtml = firstMatch(html, /<h1[^>]+class="[^"]*title-2accent[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)
  const brand = cleanText(firstMatch(titleHtml, /<span[^>]*>([\s\S]*?)<\/span>/i))
  const fullTitle = cleanText(titleHtml || getMeta(html, 'og:title') || firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i))
  const productTitle = brand ? fullTitle.replace(new RegExp(`^${brand}\\s*`, 'i'), '').trim() : fullTitle

  return {
    brandLabel: brand || undefined,
    productTitle: productTitle || fullTitle,
    fullTitle,
  }
}

const parseRegularSection = (html) => {
  const section = getProductCartSection(html) || html
  const content = firstMatch(section, /<div[^>]+class="product-cart__content"[^>]*>([\s\S]*)/i) || section
  const title = parseTitle(section || html)
  const beforeContent = section.split(/<div[^>]+class="product-cart__content"/i)[0] || section
  const gallery = uniqueBy(parseImageTags(beforeContent), (image) => image.url)
    .filter((image) => !/favicon|flag|logo|icon/i.test(image.url))
    .slice(0, 8)
  const guaranteesHtml = firstMatch(content, /<div[^>]+class="guarantee"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i)
  const guarantees = [...guaranteesHtml.matchAll(/<div[^>]+class="guarantee__item"[^>]*>([\s\S]*?)<\/div>/gi)]
    .map((match) => {
      const item = match[1]
      const image = parseImageTags(item)[0]
      return {
        label: cleanText(firstMatch(item, /<p[^>]*>([\s\S]*?)<\/p>/i)),
        icon: image,
        alt: image?.alt,
      }
    })
    .filter((item) => item.label && item.icon?.url)

  return {
    __component: 'pdp.add-to-cart-regular',
    enabled: true,
    brand_label: title.brandLabel || 'Particle',
    product_title: title.productTitle,
    review_count: Number(cleanText(firstMatch(content, /product-cart__reviews[\s\S]*?<span[^>]+class="text"[^>]*>([\s\S]*?)<\/span>/i)).replace(/[^\d]/g, '')) || undefined,
    rating_percent: Number(firstMatch(content, /stars-rating[\s\S]*?width:\s*([\d.]+)%/i)) || 100,
    headline: cleanText(firstMatch(content, /<h2[^>]*>([\s\S]*?)<\/h2>/i)) || title.fullTitle,
    excerpt: stripAttributes(firstMatch(content, /<div[^>]+class="excerpt"[^>]*>([\s\S]*?)<\/div>/i)),
    stock_text: stripAttributes(firstMatch(content, /<span[^>]+class="stock-count"[^>]*>([\s\S]*?)<\/span>\s*<\/div>/i)),
    add_to_cart_label: cleanText(firstMatch(content, /single_add_to_cart_button[\s\S]*?>([\s\S]*?)<\/button>/i)) || 'Add To Cart',
    gallery,
    guarantees,
    purchase_options: parsePurchaseOptions(section),
  }
}

const parseTabs = (html) => {
  const labels = [...html.matchAll(/<button[^>]+id="tab-([^"]+)"[^>]*>([\s\S]*?)<\/button>/gi)]
    .map((match) => ({
      key: match[1],
      label: cleanText(match[2]),
    }))

  return labels.map(({ key, label }) => {
    const panel = firstMatch(html, new RegExp(`<div[^>]+id=["']panel-${key}["'][^>]*>([\\s\\S]*?)(?=<div[^>]+class=["']tab["'][^>]+role=["']tabpanel["']|<\\/div>\\s*<\\/div>\\s*<!--|<\\/div>\\s*<\\/div>\\s*<form)`, 'i'))
    const stepsHtml = firstMatch(panel, /<div[^>]+class="how-to-use-items"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i)
    const steps = [...stepsHtml.matchAll(/<div[^>]+class="item"[^>]*>([\s\S]*?)<\/div>/gi)]
      .map((match) => ({
        title: cleanText(firstMatch(match[1], /<div[^>]+class="title"[^>]*>([\s\S]*?)<\/div>/i)),
        text: cleanText(firstMatch(match[1], /<div[^>]+class="text"[^>]*>([\s\S]*?)<\/div>/i)),
      }))
      .filter((step) => step.title || step.text)

    return {
      label,
      content: steps.length ? undefined : stripAttributes(firstMatch(panel, /<div[^>]+class="content"[^>]*>([\s\S]*?)<\/div>/i)),
      steps,
    }
  })
}

const parseTabsSection = (html) => {
  const title = parseTitle(html)
  const mediaHtml = firstMatch(html, /<div[^>]+class="part slider-story-container"[^>]*>([\s\S]*?)<\/div>\s*<div[^>]+class="part text"/i)
  const content = firstMatch(html, /<div[^>]+class="part text"[^>]*>([\s\S]*?)<form/i)

  return {
    __component: 'pdp.add-to-cart-tabs',
    enabled: true,
    brand_label: title.brandLabel || 'Particle',
    product_title: title.productTitle,
    headline: cleanText(firstMatch(content || html, /<h2[^>]*>([\s\S]*?)<\/h2>/i)) || title.fullTitle,
    review_count: Number(cleanText(firstMatch(content || html, /product-cart__reviews[\s\S]*?<span[^>]+class="text"[^>]*>([\s\S]*?)<\/span>/i)).replace(/[^\d]/g, '')) || undefined,
    rating_percent: Number(firstMatch(content || html, /stars-rating[\s\S]*?width:\s*([\d.]+)%/i)) || 100,
    add_to_cart_label: cleanText(firstMatch(html, /single_add_to_cart_button[\s\S]*?>([\s\S]*?)<\/button>/i)) || 'Add To Cart',
    hurry_label: cleanText(firstMatch(html, /<p[^>]+class="message"[^>]*>([\s\S]*?)(?:<span|<\/p>)/i)).replace(/^⚡\s*/, '') || 'HURRY! Selling out fast!',
    hurry_stock_count: Number(firstMatch(html, /<p[^>]+class="message"[^>]*>[\s\S]*?<span>(\d+)<\/span>/i)) || undefined,
    hurry_stock_suffix: cleanText(firstMatch(html, /<p[^>]+class="message"[^>]*>[\s\S]*?<\/span>([\s\S]*?)<\/p>/i)) || 'left in stock.',
    hurry_bar_percent: Number(firstMatch(html, /<p[^>]+class="message"[^>]*>[\s\S]*?<span>(\d+)<\/span>/i)) || 41,
    autoplay_ms: 4500,
    gallery: uniqueBy(parseImageTags(mediaHtml), (image) => image.url),
    tabs: parseTabs(html),
    purchase_options: parsePurchaseOptions(html),
  }
}

const parsePurchaseOptions = (html) => {
  return [...html.matchAll(/<button\b(?=[^>]*data-qty=)[\s\S]*?<\/button>/gi)]
    .map((match, index) => {
      const button = match[0]
      const quantity = Number(button.match(/data-qty="(\d+)"/)?.[1] || 0)
      const image = parseImageTags(button)[0]
      const unitLabel = cleanText(
        firstMatch(button, /<div[^>]+class="(?:th-products__unit|products-unit)"[^>]*>([\s\S]*?)<\/div>/i),
      ) || `${quantity} ${quantity === 1 ? 'Unit' : 'Units'}`
      const unitPrice = cleanText(firstMatch(button, /<span[^>]+class="price-num"[^>]*>([\s\S]*?)<\/span>/i))
        || cleanText(firstMatch(button, /<strong>\$?([\d,.]+)<\/strong>/i))
      const total = cleanText(firstMatch(button, /(?:th-products__total|products-total)[\s\S]*?(\$[\d,.]+)/i))
      const save = cleanText(firstMatch(button, /(?:th-products__save|products-save)[\s\S]*?You Save:\s*(\$[\d,.]+)/i))

      return {
        quantity,
        unit_label: unitLabel,
        price_per_unit: unitPrice.replace(/[^\d.]/g, ''),
        total_label: total,
        save_label: save,
        badge_label: cleanText(firstMatch(button, /<div[^>]+class="th-products__popular"[^>]*>([\s\S]*?)<\/div>/i)),
        default_selected: /active/.test(button.match(/class="([^"]*)"/)?.[1] || '') || index === 0,
        image,
        alt: image?.alt || unitLabel,
      }
    })
    .filter((option) => option.quantity && option.image?.url)
}

const getHandleFromFileName = (fileName) => {
  return fileName
    .replace(/^product-/, '')
    .replace(/\.html$/, '')
    .replace(/-cart-drawer-open$/, '')
}

const buildProductData = async (fileName, product) => {
  const html = fs.readFileSync(path.join(scrapeHtmlDir, fileName), 'utf8')
  const isTabsLayout = /<section[^>]+class="[^"]*tabs-layout/i.test(html)
  const parsedSection = isTabsLayout ? parseTabsSection(html) : parseRegularSection(html)
  const galleryMedia = await Promise.all((parsedSection.gallery || []).slice(0, 8).map(uploadImage))
  const optionMedia = await Promise.all((parsedSection.purchase_options || []).map((option) => uploadImage(option.image)))
  const guaranteeMedia = await Promise.all((parsedSection.guarantees || []).map((guarantee) => uploadImage(guarantee.icon)))
  const title = parseTitle(html)
  const ogImage = await uploadImage({
    url: toAbsoluteAssetUrl(getMeta(html, 'og:image')) || galleryMedia.find(Boolean)?.url,
    alt: title.fullTitle,
  })

  const section = {
    ...parsedSection,
    gallery: (parsedSection.gallery || [])
      .map((item, index) => ({
        image: galleryMedia[index]?.id,
        alt: item.alt,
      }))
      .filter((item) => item.image),
    purchase_options: (parsedSection.purchase_options || [])
      .map((option, index) => ({
        quantity: option.quantity,
        unit_label: option.unit_label,
        price_per_unit: option.price_per_unit,
        total_label: option.total_label,
        save_label: option.save_label,
        badge_label: option.badge_label,
        default_selected: option.default_selected,
        image: optionMedia[index]?.id,
        alt: option.alt,
      }))
      .filter((option) => option.image),
  }

  if (section.__component === 'pdp.add-to-cart-regular') {
    section.guarantees = (parsedSection.guarantees || [])
      .map((guarantee, index) => ({
        label: guarantee.label,
        icon: guaranteeMedia[index]?.id,
        alt: guarantee.alt,
      }))
      .filter((guarantee) => guarantee.icon)
  }

  return {
    title: product.title || title.fullTitle,
    description: getMeta(html, 'description') || product.description || '',
    handle: product.handle,
    thumbnail: galleryMedia.find(Boolean)?.id || product.thumbnail?.id,
    images: galleryMedia.filter(Boolean).map((media) => media.id),
    seo: {
      metaTitle: cleanText(firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i)) || product.seo?.metaTitle || product.title,
      metaDescription: getMeta(html, 'description') || product.seo?.metaDescription || product.description || '',
      canonicalURL: firstMatch(html, /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i) || product.seo?.canonicalURL || '',
      noIndex: false,
      ogImage: ogImage?.id || galleryMedia.find(Boolean)?.id,
    },
    sections: [section],
  }
}

const productResponse = await request(`${strapiUrl}/api/products?pagination[pageSize]=100&populate[thumbnail]=true&populate[seo][populate][ogImage]=true`)
const productsByHandle = new Map((productResponse.data || []).map((product) => [product.handle, product]))
const htmlFiles = fs.readdirSync(scrapeHtmlDir)
  .filter((fileName) => /^product-.*\.html$/.test(fileName))
  .filter((fileName) => !fileName.includes('cart-drawer-open'))

let updatedCount = 0
const skipped = []

for (const fileName of htmlFiles) {
  const handle = getHandleFromFileName(fileName)
  const product = productsByHandle.get(handle)

  if (!product?.documentId) {
    skipped.push(`${handle} (missing Strapi product)`)
    continue
  }

  try {
    const data = await buildProductData(fileName, product)
    await adminRequest(`${strapiUrl}/content-manager/collection-types/api::product.product/${product.documentId}`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    updatedCount += 1
    console.log(`[pdp-seed] Updated ${handle}`)
  } catch (error) {
    skipped.push(`${handle} (${error.message})`)
  }
}

console.log(`[pdp-seed] Updated ${updatedCount} products.`)
if (skipped.length) {
  console.log(`[pdp-seed] Skipped ${skipped.length}:`)
  for (const item of skipped) {
    console.log(`- ${item}`)
  }
}
