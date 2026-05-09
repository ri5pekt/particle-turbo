interface DemoteBody {
  cart_id: string
  removed_variant_id: string
}

export default defineEventHandler(async (event): Promise<unknown> => {
  const body = await readBody<DemoteBody>(event)

  if (!body?.cart_id || !body?.removed_variant_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'cart_id and removed_variant_id are required.',
    })
  }

  const medusa = useMedusaServer()
  return medusa('/store/bas', {
    method: 'DELETE',
    body: {
      cart_id: body.cart_id,
      removed_variant_id: body.removed_variant_id,
    },
  })
})
