import type { SiteSettings } from '~/types/content'

interface StrapiSingleResponse<T> {
  data: T | null
}

export default defineEventHandler(async () => {
  const strapi = useStrapiServer()

  const response = await strapi<StrapiSingleResponse<SiteSettings>>('/api/site-setting', {
    query: {
      populate: {
        logo: true,
        logo_dark: true,
        favicon: true,
        announcement_bar_link: true,
        social_links: true,
        default_seo: {
          populate: {
            ogImage: true,
          },
        },
        header: {
          populate: {
            nav: {
              populate: {
                mega_menu: {
                  populate: {
                    image: true,
                  },
                },
              },
            },
          },
        },
        footer: {
          populate: {
            payment_icons: true,
            skin_cancer_badge: true,
            columns: {
              populate: {
                links: true,
              },
            },
            legal_links: true,
          },
        },
      },
    },
  })

  if (!response.data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Site settings were not found in Strapi.',
    })
  }

  return response.data
})
