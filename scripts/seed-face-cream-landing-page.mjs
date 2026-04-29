import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const envPath = path.join(root, 'env')

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
  throw new Error('NUXT_STRAPI_API_TOKEN is required to seed landing page content.')
}

const headers = {
  Authorization: `Bearer ${token}`,
}

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
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
    throw new Error('STRAPI_ADMIN_EMAIL and STRAPI_ADMIN_INITIAL_PASSWORD are required to seed landing page media.')
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

const mediaByName = new Map()

const uploadRemoteFile = async ({ url, name, alt }) => {
  if (mediaByName.has(name)) {
    return mediaByName.get(name)
  }

  const existing = await adminRequest(`${strapiUrl}/upload/files?page=1&pageSize=1&filters[name][$eq]=${encodeURIComponent(name)}`)
  if (existing?.results?.[0]) {
    mediaByName.set(name, existing.results[0])
    return existing.results[0]
  }

  const fileResponse = await fetch(url)

  if (!fileResponse.ok) {
    throw new Error(`Could not download ${url}: ${fileResponse.status}`)
  }

  const arrayBuffer = await fileResponse.arrayBuffer()
  const file = new File([arrayBuffer], name, {
    type: fileResponse.headers.get('content-type') || 'application/octet-stream',
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
  const media = uploaded?.[0]

  if (!media?.id) {
    throw new Error(`Upload did not return media for ${name}`)
  }

  mediaByName.set(name, media)
  return media
}

const imageBase = 'https://www.particleformen.com/wp-content/uploads'
const mediaSources = {
  reason1: {
    name: 'landing-face-cream-6-actions.jpg',
    url: `${imageBase}/2023/06/Face-Cream-LP-1.jpg`,
    alt: 'Particle Face Cream product and 6-in-1 skincare benefits.',
  },
  reason3: {
    name: 'landing-men-using-particle.jpg',
    url: `${imageBase}/2023/06/Men-Using-Particle.jpg`,
    alt: 'Men using Particle skincare.',
  },
  reason4: {
    name: 'landing-face-cream-ingredients.jpg',
    url: `${imageBase}/2023/06/Fce-Cream-Ingredients-LP.jpg`,
    alt: 'Particle Face Cream ingredients.',
  },
  reason5: {
    name: 'landing-particle-media.jpg',
    url: `${imageBase}/2023/06/Particle-Media-LP.jpg`,
    alt: 'Particle Face Cream media recommendations.',
  },
  reason6: {
    name: 'landing-model-20.jpg',
    url: `${imageBase}/2023/06/Model-20.jpg`,
    alt: 'Man with hydrated skin after using face cream.',
  },
  reason7: {
    name: 'landing-face-cream-reviews.jpg',
    url: `${imageBase}/2023/06/Face-Cream-Reviews-LP.jpg`,
    alt: 'Particle Face Cream customer reviews.',
  },
  reason8: {
    name: 'landing-model-19.jpg',
    url: `${imageBase}/2023/06/Model-19_1200x1200.jpg`,
    alt: 'Man looking confident after skincare routine.',
  },
  reason9: {
    name: 'landing-particle-face-cream.jpg',
    url: `${imageBase}/2023/06/Particle-Face-Cream.jpg`,
    alt: 'Particle Face Cream bottle.',
  },
  reason10: {
    name: 'landing-30-day-guarantee.png',
    url: `${imageBase}/2025/08/Varros-_-Landing-Page-_-image3-1.png`,
    alt: 'Particle 30 day guarantee.',
  },
  video: {
    name: 'landing-eyebags-hit-40s.mp4',
    url: `${imageBase}/2023/06/Eyebags-Hit-40s_V4-No-Hook_No-Labels_VO_16x9_1-1.mp4`,
  },
}

const gallerySources = [
  {
    name: 'landing-before-after-s.webp',
    url: `${imageBase}/2023/06/s.webp`,
    alt: 'Particle Face Cream before and after result.',
  },
  {
    name: 'landing-before-after-6.jpg',
    url: `${imageBase}/2023/06/FC-BA-6.jpg`,
    alt: 'Particle Face Cream before and after model 6.',
  },
  {
    name: 'landing-before-after-4.jpg',
    url: `${imageBase}/2023/06/FC-BA-4.jpg`,
    alt: 'Particle Face Cream before and after model 4.',
  },
  {
    name: 'landing-before-after-3.jpg',
    url: `${imageBase}/2023/06/FC-BA-3.jpg`,
    alt: 'Particle Face Cream before and after model 3.',
  },
  {
    name: 'landing-before-after-2.jpg',
    url: `${imageBase}/2023/06/FC-BA-2.jpg`,
    alt: 'Particle Face Cream before and after model 2.',
  },
  {
    name: 'landing-before-after-7.jpg',
    url: `${imageBase}/2023/06/FC-BA-7-1.jpg`,
    alt: 'Particle Face Cream before and after model 7.',
  },
]

const uploadedMediaEntries = await Promise.all(
  Object.entries(mediaSources).map(async ([key, source]) => [key, await uploadRemoteFile(source)]),
)
const media = Object.fromEntries(uploadedMediaEntries)
const galleryMedia = await Promise.all(gallerySources.map(uploadRemoteFile))

const reasons = [
  {
    number: 1,
    title: 'It Packs 6 Actions In 1 Product',
    body_html: '<ol><li>Diminishes eyebags</li><li>Removes dark spots</li><li>Reduces wrinkles and sagging skin</li><li>Soothes the skin after shaving</li><li>Moisturizes</li><li>Deep nourishes with Dead Sea minerals</li></ol>',
    image: media.reason1.id,
    alt: mediaSources.reason1.alt,
  },
  {
    number: 2,
    title: 'You’ll See An Improvement Really Fast',
    body_html: '<p>Seriously. Within days you’ll know this isn’t like regular skincare.</p><p>Eyebags will shrink, dark spots will fade and sagging skin will become firmer.</p>',
    gallery: galleryMedia.map((item, index) => ({
      image: item.id,
      alt: gallerySources[index].alt,
    })),
  },
  {
    number: 3,
    title: 'It’s Engineered For Men’s Skin Only',
    body_html: '<p>We’re men. Our skin is thicker. More rugged. It ages differently. We need a different kind of care than women. Particle gives you that care.</p><p>Particle’s team of experts in men’s skincare did extensive research for 2 years until they found the perfect formula.</p>',
    image: media.reason3.id,
    alt: mediaSources.reason3.alt,
  },
  {
    number: 4,
    title: 'It Includes The Best Ingredients On The Planet',
    body_html: '<p>Particle includes a scientifically backed blend of ingredients which is EXACTLY what your skin needs at every minute of every day.</p>',
    image: media.reason4.id,
    alt: mediaSources.reason4.alt,
  },
  {
    number: 5,
    title: 'Magazines Like Men’s Journal And Men’s Health Recommend It',
    body_html: '<p>“Here’s How Men Can Look 10 Years Younger” <em>[Men’s Journal]</em></p><p>“The Best Cream For Firming The Skin” <em>[Men’s Health]</em></p><p>“The 6-in-1 Cream That’s Revolutionizing Men’s Skincare” <em>[Unfinished Man]</em></p>',
    image: media.reason5.id,
    alt: mediaSources.reason5.alt,
  },
  {
    number: 6,
    title: 'It Feels Ooooohhh',
    body_html: '<p>Particle doesn’t have an overpowering smell and doesn’t leave an oily residue on your face. It absorbs quickly and keeps your skin feeling hydrated without any side effects.</p>',
    image: media.reason6.id,
    alt: mediaSources.reason6.alt,
  },
  {
    number: 7,
    title: 'Exuberant Customers Are Giving It A 4.8 Rating!',
    body_html: '<p>“My skin feels great and looks great” -Steve, 45 NY</p><p>“The bags under my eyes are less noticeable” -Jeff, 54 AZ</p><p>“People have already commented that I look younger” -Gary, 65 CA</p>',
    image: media.reason7.id,
    alt: mediaSources.reason7.alt,
  },
  {
    number: 8,
    title: 'You’ll Simply Look Better',
    body_html: '<p>In real life, in photos and on Zoom. Let’s face it, we all want to look better. Here’s your chance to give your skin what it needs.</p>',
    image: media.reason8.id,
    alt: mediaSources.reason8.alt,
  },
  {
    number: 9,
    title: 'It Saves You Over $200',
    body_html: '<p>With the six-products-in-one approach, you don’t have to buy multiple skincare products. This is a huge money-saver: it would cost more than $250 to get all these benefits from multiple products.</p>',
    image: media.reason9.id,
    alt: mediaSources.reason9.alt,
  },
  {
    number: 10,
    title: 'You Get A 30 Day Guarantee',
    body_html: '<p>If your face doesn’t look and feel better after 30 days, you get your money back. No questions asked.</p>',
    image: media.reason10.id,
    alt: mediaSources.reason10.alt,
  },
]

const offerSection = (backgroundColor) => ({
  __component: 'landing.sale-offer',
  enabled: true,
  background_color: backgroundColor,
  headline_html: 'Don’t miss out on Particle’s <br><span class="accent">Spring Flash Sale!</span> <br><span>(*While stocks last)</span>',
  countdown_hours: 4,
  body_html: '<p>Get 20% Off Your Purchase!</p><p>Plus Free Shipping + Our 30-Day Money-Back Guarantee</p>',
  cta: {
    label: 'View Offer Details',
    url: '/product/particle-face-cream',
    target: '_self',
  },
})

const data = {
  title: 'Particle Face Cream - 10 Reasons',
  slug: 'particle-face-cream-el',
  template: 'advertorial',
  show_header: false,
  show_footer: false,
  publishedAt: new Date().toISOString(),
  seo: {
    metaTitle: 'Particle Face Cream - 10 Reasons',
    metaDescription: 'Particle Face Cream targets eye bags, dark spots, and other signs of aging.',
    canonicalURL: 'https://www.particleformen.com/lpage/particle-face-cream-el/',
    noIndex: true,
  },
  sections: [
    {
      __component: 'landing.advertorial-hero',
      enabled: true,
      headline: 'Deduct 12 Years Off Your Age With This Breakthrough For Men',
      author: 'Mark Sander',
      intro_html: '<p><em>“I’ve been using this face cream for a few years now, just as the ‘crows feet’ started to appear around the corners of my eyes. With this cream they never got a foothold (so to speak), and several years down the track still don’t carry any around the eyes!”</em></p><p>Easy to use and strikingly effective, it rejuvenated my look. See the evidence for yourself and understand why I swear by it.</p>',
    },
    {
      __component: 'landing.reason-list',
      enabled: true,
      items: reasons,
    },
    {
      __component: 'landing.video-block',
      enabled: true,
      title: 'See It In Action',
      video: media.video.id,
    },
    offerSection('#ECF0F4'),
    {
      __component: 'landing.reviews-anchor',
      enabled: true,
      title: 'Real Particle Face Cream Reviews',
      product_id: '7',
      body: 'Customer review integration can mount here when the external reviews widget is enabled.',
    },
    offerSection('#FFFFFF'),
  ],
}

const [publishedResponse, draftResponse] = await Promise.all([
  request(`${strapiUrl}/api/landing-pages?filters[slug][$eq]=particle-face-cream-el&status=published`),
  request(`${strapiUrl}/api/landing-pages?filters[slug][$eq]=particle-face-cream-el&status=draft`),
])
const existing = publishedResponse.data?.[0] || draftResponse.data?.[0]
const collectionUrl = `${strapiUrl}/content-manager/collection-types/api::landing-page.landing-page`
const payload = JSON.stringify(data)

let documentId = existing?.documentId

if (documentId) {
  await adminRequest(`${collectionUrl}/${documentId}`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
    },
    body: payload,
  })
} else {
  const created = await adminRequest(collectionUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: payload,
  })
  documentId = created?.documentId || created?.data?.documentId
}

if (documentId) {
  await adminRequest(`${collectionUrl}/${documentId}/actions/publish`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({}),
  })
}

console.log(`Seeded Face Cream landing page${documentId ? ` for ${documentId}` : ''}`)
