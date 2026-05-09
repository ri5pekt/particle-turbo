import { dbQuery } from "./ppu"

export type BasRule = {
  id: string
  name: string
  status: "active" | "draft"
  priority: number
  trigger_variant_ids: string[]
  excluded_variant_ids: string[]
  offer_variant_id: string
  special_price: number
  description: string
}

export type BasOffer = BasRule & {
  product_id: string
  product_title: string
  product_handle: string
  thumbnail?: string | null
  regular_price: number
  currency_code: string
}

const newId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`

const jsonAmount = (amount: number | string) => ({
  value: String(amount),
  precision: 20,
})

const asStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((e) => typeof e === "string") : []

const mapRule = (row: Record<string, unknown>): BasRule => ({
  id: String(row.id),
  name: String(row.name || ""),
  status: row.status === "active" ? "active" : "draft",
  priority: Number(row.priority || 0),
  trigger_variant_ids: asStringArray(row.trigger_variant_ids),
  excluded_variant_ids: asStringArray(row.excluded_variant_ids),
  offer_variant_id: String(row.offer_variant_id),
  special_price: Number(row.special_price || 0),
  description: String(row.description || ""),
})

export const ensureBasTables = async (scope: { resolve: (key: string) => unknown }) => {
  await dbQuery(scope, `
    create table if not exists bas_rule (
      id text primary key,
      name text not null,
      status text not null default 'draft',
      priority integer not null default 0,
      trigger_variant_ids jsonb not null default '[]'::jsonb,
      excluded_variant_ids jsonb not null default '[]'::jsonb,
      offer_variant_id text not null,
      special_price numeric not null default 0,
      description text not null default '',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `)
}

export const listBasRules = async (scope: { resolve: (key: string) => unknown }) => {
  await ensureBasTables(scope)
  const result = await dbQuery(scope, `
    select * from bas_rule
    order by priority desc, created_at asc
  `)
  return result.rows.map(mapRule)
}

export const upsertBasRule = async (
  scope: { resolve: (key: string) => unknown },
  input: Partial<BasRule>
) => {
  await ensureBasTables(scope)
  const id = input.id || newId("basrule")
  const result = await dbQuery(scope, `
    insert into bas_rule (
      id, name, status, priority,
      trigger_variant_ids, excluded_variant_ids,
      offer_variant_id, special_price, description, updated_at
    )
    values ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, $9, now())
    on conflict (id) do update set
      name = excluded.name,
      status = excluded.status,
      priority = excluded.priority,
      trigger_variant_ids = excluded.trigger_variant_ids,
      excluded_variant_ids = excluded.excluded_variant_ids,
      offer_variant_id = excluded.offer_variant_id,
      special_price = excluded.special_price,
      description = excluded.description,
      updated_at = now()
    returning *
  `, [
    id,
    input.name || "Bundle and Save",
    input.status || "draft",
    Number(input.priority || 0),
    JSON.stringify(input.trigger_variant_ids || []),
    JSON.stringify(input.excluded_variant_ids || []),
    input.offer_variant_id,
    Number(input.special_price || 0),
    input.description || "",
  ])
  return mapRule(result.rows[0])
}

export const deleteBasRule = async (
  scope: { resolve: (key: string) => unknown },
  id: string
) => {
  await dbQuery(scope, `delete from bas_rule where id = $1`, [id])
}

export const getCartVariantIds = async (
  scope: { resolve: (key: string) => unknown },
  cartId: string
) => {
  const result = await dbQuery<{
    variant_id: string
    line_item_id: string
    metadata: Record<string, unknown> | null
  }>(scope, `
    select id as line_item_id, variant_id, metadata
    from cart_line_item
    where cart_id = $1
      and deleted_at is null
  `, [cartId])
  return result.rows
}

export const findMatchingBasOffers = async (
  scope: { resolve: (key: string) => unknown },
  cartId: string
): Promise<BasOffer[]> => {
  await ensureBasTables(scope)

  const lineItems = await getCartVariantIds(scope, cartId)
  const cartVariantIds = lineItems.map((r) => r.variant_id).filter(Boolean)
  const basVariantIds = new Set(
    lineItems
      .filter((r) => r.metadata && (r.metadata as Record<string, unknown>).is_bas)
      .map((r) => r.variant_id)
  )

  const rules = await listBasRules(scope)

  const currencyResult = await dbQuery<{ currency_code: string }>(scope, `
    select r.currency_code
    from cart c
    join region r on r.id = c.region_id
    where c.id = $1 and c.deleted_at is null
    limit 1
  `, [cartId])
  const currencyCode = currencyResult.rows[0]?.currency_code || "usd"

  const offers: BasOffer[] = []

  for (const rule of rules.filter((r) => r.status === "active")) {
    // Skip if the offer is already in the cart as a BAS item
    if (basVariantIds.has(rule.offer_variant_id)) continue

    const hasTrigger =
      rule.trigger_variant_ids.length === 0 ||
      rule.trigger_variant_ids.some((vid) => cartVariantIds.includes(vid))
    const hasExcluded = rule.excluded_variant_ids.some((vid) => cartVariantIds.includes(vid))

    if (!hasTrigger || hasExcluded) continue

    const productResult = await dbQuery<{
      product_id: string
      product_title: string
      product_handle: string
      thumbnail: string | null
      regular_price: number
    }>(scope, `
      select
        pv.product_id,
        p.title as product_title,
        p.handle as product_handle,
        coalesce(pv.thumbnail, p.thumbnail) as thumbnail,
        coalesce(
          (select pr.amount from price pr
           join product_variant_price_set pvps on pvps.price_set_id = pr.price_set_id
           where pvps.variant_id = pv.id
             and pr.currency_code = $2
             and pr.min_quantity is null
             and pr.price_list_id is null
           limit 1),
          0
        ) as regular_price
      from product_variant pv
      join product p on p.id = pv.product_id
      where pv.id = $1
        and pv.deleted_at is null
        and p.deleted_at is null
      limit 1
    `, [rule.offer_variant_id, currencyCode])

    const product = productResult.rows[0]
    if (!product) continue

    offers.push({
      ...rule,
      product_id: product.product_id,
      product_title: product.product_title,
      product_handle: product.product_handle,
      thumbnail: product.thumbnail,
      regular_price: Number(product.regular_price),
      currency_code: currencyCode,
    })
  }

  return offers
}

export const addBasItemToCart = async (
  scope: { resolve: (key: string) => unknown },
  cartId: string,
  ruleId: string,
  offerVariantId: string,
  specialPrice: number
) => {
  const productResult = await dbQuery<{
    product_id: string
    product_title: string
    product_handle: string
    thumbnail: string | null
    requires_shipping: boolean
    is_discountable: boolean
    variant_title: string
    variant_sku: string | null
  }>(scope, `
    select
      pv.product_id,
      p.title as product_title,
      p.handle as product_handle,
      coalesce(pv.thumbnail, p.thumbnail) as thumbnail,
      true as requires_shipping,
      coalesce(p.discountable, true) as is_discountable,
      pv.title as variant_title,
      pv.sku as variant_sku
    from product_variant pv
    join product p on p.id = pv.product_id
    where pv.id = $1
      and pv.deleted_at is null
      and p.deleted_at is null
    limit 1
  `, [offerVariantId])

  const product = productResult.rows[0]
  if (!product) throw new Error("Offer product variant not found.")

  const lineItemId = newId("cli")

  await dbQuery(scope, `
    insert into cart_line_item (
      id, cart_id, title, thumbnail,
      variant_id, product_id, product_title, product_handle,
      variant_title, variant_sku, variant_option_values,
      quantity, requires_shipping, is_discountable, is_tax_inclusive,
      unit_price, raw_unit_price,
      is_custom_price, metadata,
      created_at, updated_at
    ) values (
      $1, $2, $3, $4,
      $5, $6, $7, $8,
      $9, $10, '{}'::jsonb,
      1, $11, $12, false,
      $13, $14::jsonb,
      true, $15::jsonb,
      now(), now()
    )
  `, [
    lineItemId,
    cartId,
    product.product_title,
    product.thumbnail,
    offerVariantId,
    product.product_id,
    product.product_title,
    product.product_handle,
    product.variant_title,
    product.variant_sku,
    product.requires_shipping,
    product.is_discountable,
    specialPrice,
    JSON.stringify(jsonAmount(specialPrice)),
    JSON.stringify({ is_bas: true, rule_id: ruleId, special_price: specialPrice }),
  ])

  return lineItemId
}

export const demoteBasItems = async (
  scope: { resolve: (key: string) => unknown },
  cartId: string,
  removedVariantId: string
) => {
  // Find active BAS rules triggered by the removed variant
  const rules = await listBasRules(scope)
  const triggeredRules = rules.filter(
    (r) => r.status === "active" && r.trigger_variant_ids.includes(removedVariantId)
  )
  if (!triggeredRules.length) return []

  const offerVariantIds = triggeredRules.map((r) => r.offer_variant_id)

  // All cart lines for offer variants tied to rules triggered by what was removed
  // (include rows without is_bas — fixes carts demoted by older code that cleared metadata but not price)
  const result = await dbQuery<{ id: string; variant_id: string; unit_price: number }>(scope, `
    select id, variant_id, unit_price
    from cart_line_item
    where cart_id = $1
      and deleted_at is null
      and variant_id = any($2::text[])
  `, [cartId, `{${offerVariantIds.map((v) => `"${v}"`).join(",")}}`])

  if (!result.rows.length) return []

  const cartCurrencyResult = await dbQuery<{ currency_code: string }>(scope, `
    select r.currency_code
    from cart c
    join region r on r.id = c.region_id
    where c.id = $1 and c.deleted_at is null
    limit 1
  `, [cartId])
  const currency = cartCurrencyResult.rows[0]?.currency_code || "usd"

  const regularPriceByVariant = new Map<string, number>()
  const getRegularPrice = async (variantId: string) => {
    if (regularPriceByVariant.has(variantId)) {
      return regularPriceByVariant.get(variantId)!
    }
    const regularPriceResult = await dbQuery<{ amount: number }>(scope, `
      select pr.amount
      from price pr
      join product_variant_price_set pvps on pvps.price_set_id = pr.price_set_id
      where pvps.variant_id = $1
        and pr.currency_code = $2
        and pr.min_quantity is null
        and pr.price_list_id is null
      limit 1
    `, [variantId, currency])
    const amount = Number(regularPriceResult.rows[0]?.amount ?? 0)
    regularPriceByVariant.set(variantId, amount)
    return amount
  }

  // Check if ANY other trigger still in cart (not the removed one)
  const remainingItems = await getCartVariantIds(scope, cartId)
  const remainingVariantIds = remainingItems
    .map((r) => r.variant_id)
    .filter((vid) => vid !== removedVariantId)

  const demotedIds: string[] = []

  for (const lineItem of result.rows) {
    const rule = triggeredRules.find((r) => r.offer_variant_id === lineItem.variant_id)
    if (!rule) continue

    const stillTriggered = rule.trigger_variant_ids.some((vid) =>
      vid !== removedVariantId && remainingVariantIds.includes(vid)
    )

    if (!stillTriggered) {
      const regularPrice = await getRegularPrice(lineItem.variant_id)
      const nextPrice = regularPrice > 0 ? regularPrice : lineItem.unit_price

      await dbQuery(scope, `
        update cart_line_item
        set
          unit_price = $2,
          raw_unit_price = $3::jsonb,
          is_custom_price = false,
          metadata = coalesce(metadata, '{}'::jsonb) - 'is_bas' - 'rule_id' - 'special_price',
          updated_at = now()
        where id = $1
      `, [
        lineItem.id,
        nextPrice,
        JSON.stringify({ value: String(nextPrice), precision: 20 }),
      ])
      demotedIds.push(lineItem.id)
    }
  }

  return demotedIds
}
