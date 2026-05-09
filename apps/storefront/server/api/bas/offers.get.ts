export default defineEventHandler(async (event): Promise<unknown> => {
  const query = getQuery(event)
  const cartId = query.cart_id as string | undefined

  if (!cartId) {
    throw createError({ statusCode: 400, statusMessage: 'cart_id is required.' })
  }

  const medusa = useMedusaServer()
  return medusa(`/store/bas`, { query: { cart_id: cartId } })
})
