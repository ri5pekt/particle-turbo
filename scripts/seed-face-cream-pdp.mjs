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
  throw new Error('NUXT_STRAPI_API_TOKEN is required to seed Face Cream PDP content.')
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
    throw new Error('STRAPI_ADMIN_EMAIL and STRAPI_ADMIN_INITIAL_PASSWORD are required to upload Face Cream media.')
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

const uploadImage = async ({ url, name, alt }) => {
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
    throw new Error(`Could not download ${url}: ${imageResponse.status}`)
  }

  const arrayBuffer = await imageResponse.arrayBuffer()
  const file = new File([arrayBuffer], name, {
    type: imageResponse.headers.get('content-type') || 'image/png',
  })
  const form = new FormData()
  form.append('files', file)
  form.append('fileInfo', JSON.stringify({
    alternativeText: alt,
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
const gallery = [
  {
    name: 'face-cream-story-product.png',
    url: `${imageBase}/2019/02/V2a-website-1380x1500-F1F1F1-FC-for-web.png`,
    alt: 'Particle for Men face cream in a silver pump bottle with blue label, front view.',
  },
  {
    name: 'face-cream-story-apply-eye.png',
    url: `${imageBase}/2019/02/Untitled-design-63.png`,
    alt: 'Person applying Particle for Men face cream to the under-eye area.',
  },
  {
    name: 'face-cream-story-pump.png',
    url: `${imageBase}/2019/02/Untitled-design-64.png`,
    alt: 'Close-up of hands dispensing Particle for Men face cream from a silver pump bottle.',
  },
  {
    name: 'face-cream-story-cheek.png',
    url: `${imageBase}/2019/02/Untitled-design-65.png`,
    alt: 'Man applying face cream to his cheek while holding a Particle for Men skincare bottle.',
  },
]
const options = [
  {
    quantity: 3,
    unit_label: '3 Units',
    price_per_unit: '49',
    total_label: '$147',
    save_label: '$60',
    badge_label: 'Most Popular',
    default_selected: true,
    name: 'face-cream-3-units.png',
    url: `${imageBase}/2019/02/FC-3-units.png`,
    alt: 'Three bottles of Particle for Men face cream.',
  },
  {
    quantity: 2,
    unit_label: '2 Units',
    price_per_unit: '55',
    total_label: '$110',
    save_label: '$28',
    default_selected: false,
    name: 'face-cream-2-units.png',
    url: `${imageBase}/2019/02/FC-2-units.png`,
    alt: 'Two bottles of Particle for Men face cream.',
  },
  {
    quantity: 1,
    unit_label: '1 Unit',
    price_per_unit: '69',
    total_label: '',
    default_selected: false,
    name: 'face-cream-1-unit.png',
    url: `${imageBase}/2019/02/FC-1-unit.png`,
    alt: 'Single bottle of Particle for Men face cream.',
  },
]
const ingredientsImage = {
  name: 'face-cream-ingredients-accordion.png',
  url: `${imageBase}/2025/02/image-8.png`,
  alt: 'Man applying face cream to his face.',
}
const customerReviews = [
  {
    video_url: `${imageBase}/2019/02/Face-Cream-Mike-Provenzano-Testimonial-4x5-English-Compressed.mp4`,
    quote: '<p>“I’m looking better and younger every single day. I could tell the difference in less than 2 weeks.”</p>',
    name: 'Mike Provenzano',
    about: '53, Columbus, OH',
  },
  {
    video_url: `${imageBase}/2019/02/Face-Cream-Lee-Nelson-Testimonial-4x5-English-Compressed.mp4`,
    quote: '<p>“Incredible face moisturizer.<br>I’ve been using the face cream and have seen a noticeable improvement in my facial skin. I am very happy!”</p>',
    name: 'Lee Nelson',
    about: '63, Portland, ME',
  },
  {
    video_url: `${imageBase}/2019/02/Face-Cream-Glen-Testimonial-4x5-English-Compressed.mp4`,
    quote: '<p>“Amazing. This is the first product of its kind that I have used and it really works. I look and feel better!!”</p>',
    name: 'Glenn Mainwaring',
    about: '40 London, UK',
  },
  {
    video_url: `${imageBase}/2019/02/Face-Cream-Clayton-Paterson-Testimonial-4x5-English_1-Compressed.mp4`,
    quote: '<p>”I was pleasantly surprised when I started using the face cream. It feels good and makes my skin look more alive. People have commented on how good I’m looking.”</p>',
    name: 'Clayton Paterson',
    about: '56, Miami, FL',
  },
  {
    video_url: `${imageBase}/2019/02/Face-Cream-Mike-Jones-Testimonial-4x5-English.mp4`,
    quote: '<p>”I’ve been using your face cream for a while now, and it’s amazing! My extremely dry skin was hard to manage, but applying it twice daily has completely resolved the dryness. Even my wife says my skin looks fantastic!”</p>',
    name: 'Mike Jones',
    about: '52, Sacramento, CA',
  },
  {
    name: 'face-cream-review-richard-h.jpeg',
    url: `${imageBase}/2022/08/Richard-H-Final.jpeg`,
    alt: 'Man shows Particle Men’s Formula Daily Care Face Cream.',
    quote: '<p>“After only a short period of time you will be extremely impressed by the results - a better complexion and fewer lines. Awesome product.”</p>',
    reviewer_name: 'Richard H.',
    about: '62, Orlando, FL',
  },
  {
    name: 'face-cream-review-romain-j.jpeg',
    url: `${imageBase}/2022/08/Romaine-Johnson-Final-scaled-1.jpeg`,
    alt: 'A man holds a bottle of Particle Daily Care Face Cream, aesthetic science for men.',
    quote: '<p>“Excellent product,<br>great quality. Best face cream I’ve ever tried. Worth the price.”</p>',
    reviewer_name: 'Romain J.',
    about: '42, New Orleans, LA',
  },
  {
    name: 'face-cream-review-carlos-s.jpg',
    url: `${imageBase}/2019/02/Carlos-Lopez-3_1080x1920-1.jpg`,
    alt: 'A close-up of a bottle of Particle Men’s Formula Face Cream held by a man.',
    quote: '<p>”I think I look 10 years younger. Great product, easily applied and we all see a difference!”</p>',
    reviewer_name: 'Carlos S.',
    about: '45, Providence, RI',
  },
  {
    name: 'face-cream-review-graham-g.jpg',
    url: `${imageBase}/2019/02/Graham-Cream-3_1200x1200-1-1.jpg`,
    alt: 'Middle-aged man applying Particle face cream from a pump bottle.',
    quote: '<p>”Particle face cream is soft and smooth going on and definitely reduces puffy eyes. You can’t beat it!”</p>',
    reviewer_name: 'Graham G.',
    about: '57, Burlington, V',
  },
  {
    name: 'face-cream-review-matteo-b.jpg',
    url: `${imageBase}/2019/02/IMG_2455_corrected_1200x1200-1.jpg`,
    alt: 'Particle Men’s Formula face wash cleanser pump bottle with light lid.',
    quote: '<p>“People swear that I can’t be 50! Been using for a couple of months now and my face is so clear and feels great!”</p>',
    reviewer_name: 'Matteo B.',
    about: '50, Boston, MA',
  },
]

const galleryMedia = await Promise.all(gallery.map(uploadImage))
const optionMedia = await Promise.all(options.map(uploadImage))
const ingredientsMedia = await uploadImage(ingredientsImage)
const reviewMediaByName = new Map(
  await Promise.all(
    customerReviews
      .filter((review) => review.url)
      .map(async (review) => [review.name, await uploadImage(review)]),
  ),
)

const productResponse = await request(`${strapiUrl}/api/products?filters[handle][$eq]=particle-face-cream`)
const product = productResponse.data?.[0]

if (!product?.documentId) {
  throw new Error('Could not find Strapi product with handle particle-face-cream.')
}

const data = {
  title: 'Particle Face Cream',
  description: 'Combat signs of aging with our advanced men\'s formula. Scientifically developed to reduce fine lines, improve skin texture, and restore youthful vitality.',
  handle: 'particle-face-cream',
  thumbnail: galleryMedia[0].id,
  images: galleryMedia.map((media) => media.id),
  seo: {
    metaTitle: 'Advanced Anti-Aging Cream for Men | Particle Skincare',
    metaDescription: 'Combat signs of aging with our advanced men\'s formula. Scientifically developed to reduce fine lines, improve skin texture, and restore youthful vitality.',
    canonicalURL: 'https://www.particleformen.com/product/particle-face-cream/',
    noIndex: false,
    ogImage: galleryMedia[0].id,
  },
  sections: [
    {
      __component: 'pdp.add-to-cart-tabs',
      enabled: true,
      brand_label: 'Particle',
      product_title: 'Face Cream',
      headline: 'The 6-in-1 anti-aging cream for men that fixes eye bags, dark spots and wrinkles',
      review_count: 11381,
      rating_percent: 96.3606010017,
      add_to_cart_label: 'Add To Cart',
      hurry_label: 'HURRY! Selling out fast!',
      hurry_stock_count: 41,
      hurry_stock_suffix: 'left in stock.',
      hurry_bar_percent: 41,
      autoplay_ms: 4500,
      gallery: galleryMedia.map((media, index) => ({
        image: media.id,
        alt: gallery[index].alt,
      })),
      tabs: [
        {
          label: 'Description',
          content: '<p>Based on advanced dermatological research, this anti-aging cream is engineered to combat the signs of aging. Formulated for daily use, Particle Face Cream is the ultimate solution for men who want to look healthy and youthful.</p>',
        },
        {
          label: 'Actions',
          content: '<ul><li>Diminishes Eye Bags</li><li>Moisturizes</li><li>Fends Off Dark Spots</li><li>Soothes Skin After Shaving</li><li>Reduces Wrinkles</li><li>Nourishes Skin with Dead Sea Minerals</li></ul>',
        },
        {
          label: 'Benefits',
          content: '<ul><li>It’s engineered specifically for men</li><li>It saves you more than $200</li><li>Notice a difference immediately</li><li>Premium ingredients are handpicked</li><li>Look better in real life AND in photos</li><li>Get a 30 day money back guarantee</li></ul>',
        },
        {
          label: 'How to use',
          steps: [
            {
              title: 'Cleanse',
              text: 'Clean and pat your face dry',
            },
            {
              title: 'Apply',
              text: 'Apply the cream on your face',
            },
            {
              title: 'Spread',
              text: 'Allow the cream to absorb',
            },
          ],
        },
      ],
      purchase_options: options.map((option, index) => ({
        quantity: option.quantity,
        unit_label: option.unit_label,
        price_per_unit: option.price_per_unit,
        total_label: option.total_label,
        save_label: option.save_label,
        badge_label: option.badge_label,
        default_selected: option.default_selected,
        image: optionMedia[index].id,
        alt: option.alt,
      })),
    },
    {
      __component: 'pdp.ingredients-accordion',
      enabled: true,
      image: ingredientsMedia.id,
      image_alt: ingredientsImage.alt,
      ingredients_title: 'Premium Ingredients',
      ingredients: [
        'Hyaluronic Acid',
        'Coffee Seed Extract',
        'Jojoba Oil',
        'Ascorbyl Tetraisopalmitate',
        'Vitamin E',
        'Shea Butter',
        'Allantoin',
        'Lactic Acid',
        'Glycerin',
        'Pentavitin®',
        'Squalane Oil',
        'SymWhite®',
      ].map((label) => ({ label })),
      comparison_title: 'Particle Face Cream VS Competitors',
      particle_heading: 'Particle Face Cream',
      competitor_heading: 'Competitors',
      comparison_rows: [
        ['Number Of Product Actions', '6', '1-2'],
        ['Premium Ingredients', '12', '1-2'],
        ['Engineered For Men', 'Yes', 'No'],
        ['Price', '$$', '$$$$$'],
        ['Verified Results', 'Yes', '?'],
        ['Free Shipping', 'Yes', 'No'],
        ['Money Back Guarantee', '30 days', 'No'],
      ].map(([feature, particle_value, competitor_value]) => ({
        feature,
        particle_value,
        competitor_value,
      })),
      faq_title: 'Frequently Asked Questions',
      faq_items: [
        {
          question: 'Who was Particle’s Face Cream designed for?',
          answer: 'Particle’s Face Cream is made with the highest quality ingredients and is safe and effective for use on all skin types, tones, and sensitivity levels. If you want to take a few years off your appearance and maintain a healthy youthful look, then our Face Cream is for you!',
        },
        {
          question: 'When should I start seeing results from using Particle Face Cream?',
          answer: 'Whilst typically most people see a change within 2-3 weeks of daily use (both morning and evening), we acknowledge that everyone’s skin type is different and for some, it may take longer.',
        },
        {
          question: 'Does the Face Cream leave behind a residue?',
          answer: 'Everyone will be able to see the difference in your skin as soon as you begin using Particle. But the most exciting part? They’ll see the big benefits but won’t be able to tell you’re using anything on your face. Particle gets completely absorbed into the skin. It doesn’t leave behind any noticeable sheen or residue.',
        },
      ],
      guarantee_title: '30 Day Money Back Guarantee',
      guarantee_body: 'If you didn’t enjoy your experience with our products for any reason, send them back within 30 days for a refund.',
    },
    {
      __component: 'pdp.reviews-carousel',
      enabled: true,
      title_html: 'Reviews of <span>Particle men</span>',
      autoplay_ms: 5500,
      reviews: customerReviews.map((review) => {
        const media = review.name ? reviewMediaByName.get(review.name) : null

        return {
          quote: review.quote,
          name: review.reviewer_name || review.name,
          about: review.about,
          image: media?.id,
          image_alt: review.alt,
          video_url: review.video_url,
        }
      }),
    },
    {
      __component: 'pdp.stamped-reviews',
      enabled: true,
      anchor_id: 'stampedcreambot',
      product_id: '7',
      product_sku: '751889384926',
      product_name: 'Particle Face Cream',
      product_url: 'https://www.particleformen.com/product/particle-face-cream/',
      image_url: `${imageBase}/2019/02/Untitled-design-71.png`,
    },
    {
      __component: 'pdp.more-products',
      enabled: true,
      title: 'More Products For You',
      limit: 4,
      button_label: 'Shop Now',
    },
  ],
}

await adminRequest(`${strapiUrl}/content-manager/collection-types/api::product.product/${product.documentId}`, {
  method: 'PUT',
  headers: {
    'content-type': 'application/json',
  },
  body: JSON.stringify(data),
})

console.log(`Seeded Face Cream PDP content for ${product.documentId}`)
