import type { MedusaProductSummary } from '~/types/commerce'

interface ProductsResponse {
  products?: MedusaProductSummary[]
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const excludeHandle = String(query.exclude_handle || '')
  const medusa = useMedusaServer()

  const response = await medusa<ProductsResponse>('/store/products', {
    query: {
      limit: 8,
    },
  })

  return (response.products || [])
    .filter((product) => product.handle !== excludeHandle)
    .slice(0, 5)
})

