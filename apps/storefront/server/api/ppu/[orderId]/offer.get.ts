export default defineEventHandler(async (event): Promise<unknown> => {
  const orderId = getRouterParam(event, 'orderId')

  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order id is required.',
    })
  }

  const medusa = useMedusaServer()

  return medusa(`/store/ppu/orders/${orderId}/offer`)
})
