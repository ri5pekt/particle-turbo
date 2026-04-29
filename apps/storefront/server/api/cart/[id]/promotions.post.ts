import type { MedusaCart } from '~/types/commerce'

interface CartResponse {
  cart: MedusaCart
}

interface ApplyPromotionBody {
  promo_code?: string
}

const getMedusaErrorMessage = (error: unknown) => {
  const errorLike = error as {
    data?: { message?: string }
    response?: { _data?: { message?: string } }
    statusMessage?: string
    message?: string
  }

  return errorLike.data?.message
    || errorLike.response?._data?.message
    || errorLike.statusMessage
    || errorLike.message
    || 'Coupon could not be applied.'
}

const getMedusaErrorStatus = (error: unknown) => {
  const errorLike = error as {
    statusCode?: number
    status?: number
    response?: { status?: number }
  }

  return errorLike.statusCode || errorLike.status || errorLike.response?.status || 400
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody<ApplyPromotionBody>(event)
  const promoCode = body.promo_code?.trim()

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cart id is required.',
    })
  }

  if (!promoCode) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Coupon code is required.',
    })
  }

  try {
    const medusa = useMedusaServer()
    const response = await medusa<CartResponse>(`/store/carts/${id}/promotions`, {
      method: 'POST',
      body: {
        promo_codes: [promoCode],
      },
    })

    return response.cart
  } catch (error) {
    throw createError({
      statusCode: getMedusaErrorStatus(error),
      statusMessage: getMedusaErrorMessage(error),
    })
  }
})
