interface AddBasBody {
  cart_id: string
  rule_id: string
  offer_variant_id: string
  special_price: number
}

export default defineEventHandler(async (event): Promise<unknown> => {
  const body = await readBody<AddBasBody>(event)

  if (!body?.cart_id || !body?.rule_id || !body?.offer_variant_id || body?.special_price == null) {
    throw createError({
      statusCode: 400,
      statusMessage: 'cart_id, rule_id, offer_variant_id and special_price are required.',
    })
  }

  const medusa = useMedusaServer()
  return medusa('/store/bas', {
    method: 'POST',
    body: {
      cart_id: body.cart_id,
      rule_id: body.rule_id,
      offer_variant_id: body.offer_variant_id,
      special_price: body.special_price,
    },
  })
})
