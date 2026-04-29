import type { MedusaProductSummary } from '~/types/commerce'

interface ProductsResponse {
  products?: MedusaProductSummary[]
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const excludeHandle = String(query.exclude_handle || '')
  const limit = Math.max(1, Math.min(12, Number(query.limit || 5)))

  return cachedResponse(event, {
    key: cacheKey('recommendations', excludeHandle || 'all', limit),
    ttlSeconds: 600,
  }, async () => {
    const medusa = useMedusaServer()
    const regionId = await getDefaultMedusaRegionId()

    const response = await medusa<ProductsResponse>('/store/products', {
      query: {
        limit: limit + 3,
        region_id: regionId,
        fields: '*variants,*variants.calculated_price,*variants.prices',
      },
    })

    return (response.products || [])
      .filter((product) => product.handle !== excludeHandle)
      .slice(0, limit)
  })
})

