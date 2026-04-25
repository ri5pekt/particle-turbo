import type { MedusaCart } from '~/types/commerce'

interface CartResponse {
  cart: MedusaCart
}

export default defineEventHandler(async () => {
  const medusa = useMedusaServer()
  const regionId = await getDefaultMedusaRegionId()

  const response = await medusa<CartResponse>('/store/carts', {
    method: 'POST',
    body: {
      region_id: regionId,
    },
  })

  return response.cart
})

