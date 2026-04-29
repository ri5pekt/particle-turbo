export default defineEventHandler(async (event): Promise<unknown> => {
  const orderId = getRouterParam(event, 'orderId')
  const body = await readBody<{ rule_id?: string }>(event)

  if (!orderId || !body.rule_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order id and rule id are required.',
    })
  }

  const medusa = useMedusaServer()

  try {
    return await medusa(`/store/ppu/orders/${orderId}/accept`, {
      method: 'POST',
      body,
    })
  } catch (error) {
    const errorLike = error as {
      data?: { message?: string }
      response?: { _data?: { message?: string }, status?: number }
      status?: number
      statusCode?: number
      message?: string
    }

    throw createError({
      statusCode: errorLike.statusCode || errorLike.status || errorLike.response?.status || 400,
      statusMessage: errorLike.data?.message
        || errorLike.response?._data?.message
        || errorLike.message
        || 'Could not accept post-purchase offer.',
    })
  }
})
