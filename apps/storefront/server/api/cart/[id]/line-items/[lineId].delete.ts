import type { MedusaCart } from '~/types/commerce'

interface CartResponse {
  cart: MedusaCart
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const lineId = getRouterParam(event, 'lineId')

  if (!id || !lineId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cart id and line item id are required.',
    })
  }

  const medusa = useMedusaServer()
  await medusa<void>(`/store/carts/${id}/line-items/${lineId}`, {
    method: 'DELETE',
  })
  const response = await medusa<CartResponse>(`/store/carts/${id}`)

  return response.cart
})

