import type { MedusaCart } from '~/types/commerce'

interface CartResponse {
  cart: MedusaCart
}

interface AddLineItemBody {
  variant_id?: string
  quantity?: number
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody<AddLineItemBody>(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cart id is required.',
    })
  }

  if (!body.variant_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Variant id is required.',
    })
  }

  const quantity = Math.max(1, Number(body.quantity || 1))
  const medusa = useMedusaServer()
  const response = await medusa<CartResponse>(`/store/carts/${id}/line-items`, {
    method: 'POST',
    body: {
      variant_id: body.variant_id,
      quantity,
    },
  })

  return response.cart
})

