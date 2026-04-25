import type { PageData } from '~/types/content'

interface StrapiListResponse<T> {
  data: T[]
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Page slug is required.',
    })
  }

  const strapi = useStrapiServer()

  const response = await strapi<StrapiListResponse<PageData>>('/api/pages', {
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
        hero: {
          populate: {
            cta: true,
            background_image: true,
            background_video: true,
            mobile_video: true,
          },
        },
        sections: {
          on: {
            'sections.logos-slider': {
              populate: {
                logos: {
                  populate: {
                    image: true,
                  },
                },
              },
            },
            'sections.best-sellers': {
              populate: {
                items: {
                  populate: {
                    back_image: true,
                    main_image: true,
                    front_image: true,
                    mobile_image: true,
                  },
                },
              },
            },
            'sections.all-products': {
              populate: {
                categories: {
                  populate: {
                    icon: true,
                  },
                },
                items: {
                  populate: {
                    image: true,
                  },
                },
              },
            },
            'sections.insta-block': {
              populate: {
                video: true,
                molecule_one: true,
                molecule_two: true,
              },
            },
            'sections.cart-main': {
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
      statusMessage: `Page "${slug}" was not found in Strapi.`,
    })
  }

  return page
})
