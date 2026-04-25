import type { ProductData } from '~/types/content'
import type { CommerceProduct, MedusaProductSummary } from '~/types/commerce'

interface StrapiListResponse<T> {
  data: T[]
}

interface MedusaProductResponse {
  products?: MedusaProductSummary[]
}

const getCommerceProduct = async (handle: string): Promise<CommerceProduct | null> => {
  try {
    const medusa = useMedusaServer()
    const regionId = await getDefaultMedusaRegionId()
    const response = await medusa<MedusaProductResponse>('/store/products', {
      query: {
        handle,
        region_id: regionId,
        limit: 1,
      },
    })
    const product = response.products?.[0]
    const variants = product?.variants || []
    const defaultVariant = variants[0]

    if (!product) {
      return {
        id: '',
        handle,
        purchasable: false,
        unavailable_reason: `No Medusa product found for handle "${handle}".`,
      }
    }

    return {
      ...product,
      purchasable: Boolean(defaultVariant?.id),
      default_variant_id: defaultVariant?.id,
      unavailable_reason: defaultVariant?.id
        ? undefined
        : `Medusa product "${handle}" has no purchasable variants.`,
    }
  } catch (error) {
    console.error('[products] Failed to resolve Medusa product', error)

    return {
      id: '',
      handle,
      purchasable: false,
      unavailable_reason: 'Medusa product data is unavailable.',
    }
  }
}

export default defineEventHandler(async (event) => {
  const handle = getRouterParam(event, 'handle')

  if (!handle) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product handle is required.',
    })
  }

  const strapi = useStrapiServer()

  const [response, commerce] = await Promise.all([
    strapi<StrapiListResponse<ProductData>>('/api/products', {
      query: {
        filters: {
          handle: {
            $eq: handle,
          },
        },
        pagination: {
          page: 1,
          pageSize: 1,
        },
        populate: {
          thumbnail: true,
          images: true,
          seo: {
            populate: {
              ogImage: true,
            },
          },
          sections: {
            on: {
              'pdp.add-to-cart-regular': {
                populate: {
                  gallery: {
                    populate: {
                      image: true,
                      video: true,
                    },
                  },
                  guarantees: {
                    populate: {
                      icon: true,
                    },
                  },
                  purchase_options: {
                    populate: {
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
    getCommerceProduct(handle),
  ])

  const product = response.data[0]

  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: `Product "${handle}" was not found in Strapi.`,
    })
  }

  return {
    ...product,
    commerce,
  }
})
