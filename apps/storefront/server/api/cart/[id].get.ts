import type { MedusaCart } from '~/types/commerce'

interface CartResponse {
  cart: MedusaCart
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cart id is required.',
    })
  }

  const medusa = useMedusaServer()
  const response = await medusa<CartResponse>(`/store/carts/${id}`)

  return response.cart
})

