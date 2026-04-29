import type { LandingPageData } from '~/types/content'

interface StrapiListResponse<T> {
  data: T[]
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Landing page slug is required.',
    })
  }

  return cachedResponse(event, {
    key: cacheKey('landing-page', slug),
    ttlSeconds: 300,
  }, async () => {
    const strapi = useStrapiServer()

    const response = await strapi<StrapiListResponse<LandingPageData>>('/api/landing-pages', {
      query: {
        filters: {
          slug: {
            $eq: slug,
          },
        },
        pagination: {
          page: 1,
          pageSize: 1,
        },
        populate: {
          seo: {
            populate: {
              ogImage: true,
            },
          },
          sections: {
            on: {
              'landing.advertorial-hero': {
                populate: true,
              },
              'landing.reason-list': {
                populate: {
                  items: {
                    populate: {
                      image: true,
                      gallery: {
                        populate: {
                          image: true,
                        },
                      },
                    },
                  },
                },
              },
              'landing.video-block': {
                populate: {
                  video: true,
                  poster: true,
                },
              },
              'landing.sale-offer': {
                populate: {
                  cta: true,
                },
              },
              'landing.reviews-anchor': {
                populate: true,
              },
            },
          },
        },
      },
    })

    const page = response.data[0]

    if (!page) {
      throw createError({
        statusCode: 404,
        statusMessage: `Landing page "${slug}" was not found in Strapi.`,
      })
    }

    return page
  })
})
