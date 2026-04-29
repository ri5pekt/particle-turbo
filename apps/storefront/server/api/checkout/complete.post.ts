import type { H3Event } from 'h3'

interface CheckoutAddress {
  first_name?: string
  last_name?: string
  address_1?: string
  address_2?: string
  city?: string
  province?: string
  postal_code?: string
  phone?: string
  country_code?: string
}

interface CompleteCheckoutBody {
  cart_id?: string
  email?: string
  billing_address?: CheckoutAddress
  shipping_address?: CheckoutAddress
  provider_id?: string
  payment_method_nonce?: string
}

interface PaymentCollectionResponse {
  payment_collection: {
    id: string
    payment_sessions?: Array<{
      id: string
      provider_id: string
    }>
  }
}

interface CartResponse {
  cart: {
    id: string
    shipping_methods?: Array<{ id: string }>
  }
}

interface ShippingOptionsResponse {
  shipping_options?: Array<{
    id: string
    name?: string
  }>
}

interface CompleteCartResponse {
  type: 'cart' | 'order'
  cart?: unknown
  order?: {
    id?: string
    display_id?: number
  }
  ppu?: {
    eligible: boolean
    offer?: unknown
  }
  error?: unknown
}

interface AuthResponse {
  token?: string
}

const requireField = (value: unknown, message: string) => {
  if (!value || typeof value !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: message,
    })
  }

  return value
}

const getMedusaErrorMessage = (error: unknown) => {
  const errorLike = error as {
    data?: { message?: string }
    response?: { _data?: { message?: string } }
    statusMessage?: string
    message?: string
    statusCode?: number
    status?: number
  }

  return errorLike.data?.message
    || errorLike.response?._data?.message
    || errorLike.statusMessage
    || errorLike.message
    || 'Checkout could not be completed.'
}

const getMedusaErrorStatus = (error: unknown) => {
  const errorLike = error as {
    statusCode?: number
    status?: number
    response?: { status?: number }
  }

  return errorLike.statusCode || errorLike.status || errorLike.response?.status || 400
}

const createAccountSessionAfterCheckout = async (
  event: H3Event,
  medusa: ReturnType<typeof useMedusaServer>,
  body: CompleteCheckoutBody,
  orderId: string,
) => {
  const email = body.email?.trim().toLowerCase()

  if (!email || getAccountToken(event)) {
    return
  }

  try {
    const session = await medusa<AuthResponse>('/store/account/checkout-session', {
      method: 'POST',
      body: {
        order_id: orderId,
        email,
      },
    })

    if (session.token) {
      setAccountToken(event, session.token)
    }
  } catch (error) {
    console.warn('Could not create checkout account session.', error)
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CompleteCheckoutBody>(event)
    const cartId = requireField(body.cart_id, 'Cart id is required.')
    const providerId = requireField(body.provider_id, 'Payment provider id is required.')
    const nonce = requireField(body.payment_method_nonce, 'Braintree payment nonce is required.')
    const medusa = useMedusaServer()

    const updatedCart = await medusa<CartResponse>(`/store/carts/${cartId}`, {
      method: 'POST',
      body: {
        email: body.email,
        billing_address: body.billing_address,
        shipping_address: body.shipping_address || body.billing_address,
      },
    })

    if (!updatedCart.cart.shipping_methods?.length) {
      const shippingOptions = await medusa<ShippingOptionsResponse>('/store/shipping-options', {
        query: {
          cart_id: cartId,
        },
      })
      const shippingOption = shippingOptions.shipping_options?.[0]

      if (!shippingOption?.id) {
        throw createError({
          statusCode: 400,
          statusMessage: 'No shipping options are available for this cart.',
        })
      }

      await medusa(`/store/carts/${cartId}/shipping-methods`, {
        method: 'POST',
        body: {
          option_id: shippingOption.id,
          data: {},
        },
      })
    }

    const paymentCollection = await medusa<PaymentCollectionResponse>('/store/payment-collections', {
      method: 'POST',
      body: {
        cart_id: cartId,
      },
    })

    const initialized = await medusa<PaymentCollectionResponse>(
      `/store/payment-collections/${paymentCollection.payment_collection.id}/payment-sessions`,
      {
        method: 'POST',
        body: {
          provider_id: providerId,
          data: {
            payment_method_nonce: nonce,
            email: body.email,
            billing_address: body.billing_address,
            shipping_address: body.shipping_address || body.billing_address,
          },
        },
      },
    )

    const paymentSession = initialized.payment_collection.payment_sessions?.find((session) => {
      return session.provider_id === providerId
    }) || initialized.payment_collection.payment_sessions?.[0]

    if (!paymentSession?.id) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Could not initialize Braintree payment session.',
      })
    }

    const completed = await medusa<CompleteCartResponse>(`/store/carts/${cartId}/complete`, {
      method: 'POST',
    })

    if (completed.type === 'order' && completed.order?.id) {
      await createAccountSessionAfterCheckout(event, medusa, body, completed.order.id)

      try {
        completed.ppu = await medusa<CompleteCartResponse['ppu']>(
          `/store/ppu/orders/${completed.order.id}/evaluate`,
          {
            method: 'POST',
          },
        )
      } catch (error) {
        console.warn('Could not evaluate post-purchase upsell offer.', error)
      }
    }

    return completed
  } catch (error) {
    throw createError({
      statusCode: getMedusaErrorStatus(error),
      statusMessage: getMedusaErrorMessage(error),
    })
  }
})
