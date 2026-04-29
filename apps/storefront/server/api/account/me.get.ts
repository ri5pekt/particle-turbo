interface CustomerResponse {
  customer?: {
    id: string
    email: string
    first_name?: string
    last_name?: string
  }
}

interface OrdersResponse {
  orders?: Array<{
    id: string
    display_id?: number
    status?: string
    currency_code?: string
    total?: number
    created_at?: string
    items?: Array<{
      id: string
      title?: string
      quantity?: number
      unit_price?: number
      thumbnail?: string
    }>
  }>
}

export default defineEventHandler(async (event) => {
  const headers = getMedusaAuthHeaders(event)

  if (!headers) {
    return {
      customer: null,
      orders: [],
    }
  }

  const medusa = useMedusaServer()

  try {
    const [customerResponse, ordersResponse] = await Promise.all([
      medusa<CustomerResponse>('/store/customers/me', {
        headers,
      }),
      medusa<OrdersResponse>('/store/account/orders', {
        headers,
      }),
    ])

    return {
      customer: customerResponse.customer || null,
      orders: ordersResponse.orders || [],
    }
  } catch (error) {
    clearAccountToken(event)

    throw createError({
      statusCode: getAccountErrorStatus(error),
      statusMessage: getAccountErrorMessage(error),
    })
  }
})
