import type { MedusaCart } from '~/types/commerce'

interface CartResponse {
  cart: MedusaCart
}

interface UpdateLineItemBody {
  quantity?: number
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const lineId = getRouterParam(event, 'lineId')
  const body = await readBody<UpdateLineItemBody>(event)

  if (!id || !lineId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cart id and line item id are required.',
    })
  }

  const quantity = Math.max(1, Number(body.quantity || 1))
  const medusa = useMedusaServer()
  const response = await medusa<CartResponse>(`/store/carts/${id}/line-items/${lineId}`, {
    method: 'POST',
    body: {
      quantity,
    },
  })

  return response.cart
})

