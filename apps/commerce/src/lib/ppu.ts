import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createBraintreeGateway,
  getBraintreeOptionsFromEnv,
  normalizeBraintreeOptions,
} from "../modules/braintree-payment/config"

type Scope = {
  resolve: (key: string) => unknown
}

type QueryResult<T = Record<string, unknown>> = {
  rows: T[]
}

type DbConnection = {
  query?: <T = Record<string, unknown>>(sql: string, params?: unknown[]) => Promise<QueryResult<T>>
  raw?: (sql: string, params?: unknown[]) => Promise<QueryResult>
}

export type PpuRule = {
  id: string
  name: string
  status: "active" | "draft"
  priority: number
  trigger_variant_ids: string[]
  excluded_variant_ids: string[]
  offer_variant_id: string
  special_price: string
  text_fields: Record<string, unknown>
  max_accepts: number
}

export type PpuOffer = PpuRule & {
  order_id: string
  product_id: string
  product_title: string
  product_handle: string
  thumbnail?: string | null
  currency_code: string
}

const jsonAmount = (amount: number | string) => ({
  value: String(amount),
  precision: 20,
})

const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`

const getDb = (scope: Scope): DbConnection => {
  return scope.resolve(ContainerRegistrationKeys.PG_CONNECTION) as DbConnection
}

const toKnexRaw = (sql: string, params: unknown[]) => {
  const orderedParams: unknown[] = []
  const rawSql = sql.replace(/\$(\d+)/g, (_match, index: string) => {
    orderedParams.push(params[Number(index) - 1])
    return "?"
  })

  return {
    rawSql,
    orderedParams,
  }
}

export const dbQuery = async <T = Record<string, unknown>>(
  scope: Scope,
  sql: string,
  params: unknown[] = []
) => {
  const db = getDb(scope)

  if (typeof db.query === "function") {
    return db.query<T>(sql, params)
  }

  if (typeof db.raw === "function") {
    const { rawSql, orderedParams } = toKnexRaw(sql, params)
    return db.raw(rawSql, orderedParams) as Promise<QueryResult<T>>
  }

  throw new Error("Database connection is not available.")
}

export const ensurePpuTables = async (scope: Scope) => {
  await dbQuery(scope, `
    create table if not exists ppu_rule (
      id text primary key,
      name text not null,
      status text not null default 'draft',
      priority integer not null default 0,
      trigger_variant_ids jsonb not null default '[]'::jsonb,
      excluded_variant_ids jsonb not null default '[]'::jsonb,
      offer_variant_id text not null,
      special_price numeric not null,
      text_fields jsonb not null default '{}'::jsonb,
      max_accepts integer not null default 1,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists ppu_order_offer (
      id text primary key,
      order_id text not null,
      rule_id text not null references ppu_rule(id) on delete cascade,
      offer_variant_id text not null,
      special_price numeric not null,
      status text not null default 'shown',
      braintree_transaction_id text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique(order_id, rule_id)
    );
  `)
}

const asStringArray = (value: unknown) => Array.isArray(value) ? value.filter((entry) => typeof entry === "string") : []

const mapRule = (row: Record<string, unknown>): PpuRule => ({
  id: String(row.id),
  name: String(row.name || ""),
  status: row.status === "active" ? "active" : "draft",
  priority: Number(row.priority || 0),
  trigger_variant_ids: asStringArray(row.trigger_variant_ids),
  excluded_variant_ids: asStringArray(row.excluded_variant_ids),
  offer_variant_id: String(row.offer_variant_id),
  special_price: String(row.special_price),
  text_fields: (row.text_fields && typeof row.text_fields === "object" ? row.text_fields : {}) as Record<string, unknown>,
  max_accepts: Number(row.max_accepts || 1),
})

export const listPpuRules = async (scope: Scope) => {
  await ensurePpuTables(scope)
  const result = await dbQuery(scope, `
    select *
    from ppu_rule
    order by priority desc, created_at asc
  `)

  return result.rows.map(mapRule)
}

export const upsertPpuRule = async (scope: Scope, input: Partial<PpuRule>) => {
  await ensurePpuTables(scope)

  const id = input.id || newId("ppurule")
  const result = await dbQuery(scope, `
    insert into ppu_rule (
      id,
      name,
      status,
      priority,
      trigger_variant_ids,
      excluded_variant_ids,
      offer_variant_id,
      special_price,
      text_fields,
      max_accepts,
      updated_at
    )
    values ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, $9::jsonb, $10, now())
    on conflict (id) do update
    set
      name = excluded.name,
      status = excluded.status,
      priority = excluded.priority,
      trigger_variant_ids = excluded.trigger_variant_ids,
      excluded_variant_ids = excluded.excluded_variant_ids,
      offer_variant_id = excluded.offer_variant_id,
      special_price = excluded.special_price,
      text_fields = excluded.text_fields,
      max_accepts = excluded.max_accepts,
      updated_at = now()
    returning *
  `, [
    id,
    input.name || "Post-purchase upsell",
    input.status || "draft",
    Number(input.priority || 0),
    JSON.stringify(input.trigger_variant_ids || []),
    JSON.stringify(input.excluded_variant_ids || []),
    input.offer_variant_id,
    Number(input.special_price || 0),
    JSON.stringify(input.text_fields || {}),
    Number(input.max_accepts || 1),
  ])

  return mapRule(result.rows[0])
}

export const getOrderVariantIds = async (scope: Scope, orderId: string) => {
  const result = await dbQuery<{ variant_id: string }>(scope, `
    select oli.variant_id
    from order_item oi
    join order_line_item oli on oli.id = oi.item_id
    where oi.order_id = $1
      and oi.deleted_at is null
      and oli.deleted_at is null
  `, [orderId])

  return result.rows.map((row) => row.variant_id).filter(Boolean)
}

export const findMatchingPpuOffer = async (scope: Scope, orderId: string): Promise<PpuOffer | null> => {
  await ensurePpuTables(scope)

  const orderResult = await dbQuery<{ id: string, currency_code: string }>(scope, `
    select id, currency_code
    from "order"
    where id = $1 and deleted_at is null
  `, [orderId])
  const order = orderResult.rows[0]

  if (!order) {
    return null
  }

  const orderVariantIds = await getOrderVariantIds(scope, orderId)
  const rules = await listPpuRules(scope)
  const acceptedResult = await dbQuery<{ count: string }>(scope, `
    select count(*)::text as count
    from ppu_order_offer
    where order_id = $1 and status = 'accepted'
  `, [orderId])
  const acceptedCount = Number(acceptedResult.rows[0]?.count || 0)
  const completedOffersResult = await dbQuery<{ rule_id: string }>(scope, `
    select rule_id
    from ppu_order_offer
    where order_id = $1 and status in ('accepted', 'skipped')
  `, [orderId])
  const completedRuleIds = new Set(completedOffersResult.rows.map((row) => row.rule_id))

  for (const rule of rules.filter((entry) => entry.status === "active")) {
    if (completedRuleIds.has(rule.id)) {
      continue
    }

    if (acceptedCount >= rule.max_accepts) {
      continue
    }

    const hasTrigger = rule.trigger_variant_ids.length === 0
      || rule.trigger_variant_ids.some((variantId) => orderVariantIds.includes(variantId))
    const hasExcluded = rule.excluded_variant_ids.some((variantId) => orderVariantIds.includes(variantId))

    if (!hasTrigger || hasExcluded) {
      continue
    }

    const productResult = await dbQuery<{
      product_id: string
      product_title: string
      product_handle: string
      title: string
      thumbnail: string | null
    }>(scope, `
      select
        pv.product_id,
        p.title as product_title,
        p.handle as product_handle,
        pv.title,
        p.thumbnail
      from product_variant pv
      join product p on p.id = pv.product_id
      where pv.id = $1
        and pv.deleted_at is null
        and p.deleted_at is null
      limit 1
    `, [rule.offer_variant_id])
    const product = productResult.rows[0]

    if (!product) {
      continue
    }

    return {
      ...rule,
      order_id: orderId,
      product_id: product.product_id,
      product_title: product.product_title,
      product_handle: product.product_handle,
      thumbnail: product.thumbnail,
      currency_code: order.currency_code,
    }
  }

  return null
}

export const markOrderPpuHold = async (scope: Scope, orderId: string, releaseAfterMinutes = 15) => {
  const offer = await findMatchingPpuOffer(scope, orderId)

  if (!offer) {
    return null
  }

  await dbQuery(scope, `
    update "order"
    set
      metadata = coalesce(metadata, '{}'::jsonb)
        || jsonb_build_object(
          'ppu_status', 'on_hold',
          'ppu_release_at', (now() + ($2::text || ' minutes')::interval)::text,
          'ppu_current_rule_id', $3::text
        ),
      updated_at = now()
    where id = $1
  `, [orderId, String(releaseAfterMinutes), offer.id])

  await dbQuery(scope, `
    insert into ppu_order_offer (id, order_id, rule_id, offer_variant_id, special_price)
    values ($1, $2, $3, $4, $5)
    on conflict (order_id, rule_id) do nothing
  `, [newId("ppuoffer"), orderId, offer.id, offer.offer_variant_id, Number(offer.special_price)])

  return offer
}

export const releasePpuOrder = async (scope: Scope, orderId: string, reason = "released") => {
  await dbQuery(scope, `
    update "order"
    set
      metadata = coalesce(metadata, '{}'::jsonb)
        || jsonb_build_object('ppu_status', 'processed', 'ppu_release_reason', $2::text),
      updated_at = now()
    where id = $1
  `, [orderId, reason])
}

export const releaseExpiredPpuOrders = async (scope: Scope) => {
  const result = await dbQuery<{ id: string }>(scope, `
    update "order"
    set
      metadata = coalesce(metadata, '{}'::jsonb)
        || jsonb_build_object('ppu_status', 'processed', 'ppu_release_reason', 'timeout'),
      updated_at = now()
    where metadata->>'ppu_status' = 'on_hold'
      and (metadata->>'ppu_release_at')::timestamptz <= now()
    returning id
  `)

  return result.rows.map((row) => row.id)
}

const getStoredPaymentToken = async (scope: Scope, orderId: string) => {
  const result = await dbQuery<{
    token?: string
    customer_id?: string
    merchant_account_id?: string
  }>(scope, `
    select
      pay.data->>'payment_method_token' as token,
      pay.data->>'braintree_customer_id' as customer_id,
      pay.data->>'merchant_account_id' as merchant_account_id
    from order_payment_collection opc
    join payment pay on pay.payment_collection_id = opc.payment_collection_id
    where opc.order_id = $1
      and pay.deleted_at is null
    order by pay.created_at desc
    limit 1
  `, [orderId])

  return result.rows[0]
}

const updateOrderTotals = async (scope: Scope, orderId: string, amount: number) => {
  const result = await dbQuery<{ id: string, totals: Record<string, unknown> }>(scope, `
    select id, totals
    from order_summary
    where order_id = $1 and deleted_at is null
    order by created_at desc
    limit 1
  `, [orderId])
  const summary = result.rows[0]

  if (!summary) {
    return
  }

  const totals = summary.totals || {}
  const keys = [
    "accounting_total",
    "current_order_total",
    "original_order_total",
    "pending_difference",
  ]

  for (const key of keys) {
    totals[key] = Number(totals[key] || 0) + amount
    totals[`raw_${key}`] = jsonAmount(totals[key] as number)
  }

  await dbQuery(scope, `
    update order_summary
    set totals = $2::jsonb, updated_at = now()
    where id = $1
  `, [summary.id, JSON.stringify(totals)])
}

const appendOrderItem = async (
  scope: Scope,
  orderId: string,
  variantId: string,
  unitPrice: number
) => {
  const productResult = await dbQuery<{
    product_id: string
    product_title: string
    product_description?: string
    product_subtitle?: string
    product_handle: string
    title: string
    sku?: string
    thumbnail?: string | null
    requires_shipping: boolean
    is_discountable: boolean
  }>(scope, `
    select
      pv.product_id,
      p.title as product_title,
      p.description as product_description,
      p.subtitle as product_subtitle,
      p.handle as product_handle,
      pv.title,
      pv.sku,
      coalesce(pv.thumbnail, p.thumbnail) as thumbnail,
      true as requires_shipping,
      p.discountable as is_discountable
    from product_variant pv
    join product p on p.id = pv.product_id
    where pv.id = $1
      and pv.deleted_at is null
      and p.deleted_at is null
    limit 1
  `, [variantId])
  const product = productResult.rows[0]

  if (!product) {
    throw new Error("PPU product variant was not found.")
  }

  const lineItemId = newId("ordli")
  const orderItemId = newId("orditem")

  await dbQuery(scope, `
    insert into order_line_item (
      id,
      title,
      thumbnail,
      variant_id,
      product_id,
      product_title,
      product_description,
      product_subtitle,
      product_handle,
      variant_sku,
      variant_title,
      variant_option_values,
      requires_shipping,
      is_discountable,
      is_tax_inclusive,
      unit_price,
      raw_unit_price,
      metadata,
      is_custom_price,
      created_at,
      updated_at
    )
    values (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, '{}'::jsonb, $12, $13, false, $14, $15::jsonb,
      jsonb_build_object('is_ppu', true), true, now(), now()
    )
  `, [
    lineItemId,
    product.product_title,
    product.thumbnail,
    variantId,
    product.product_id,
    product.product_title,
    product.product_description || null,
    product.product_subtitle || null,
    product.product_handle,
    product.sku || null,
    product.title,
    product.requires_shipping,
    product.is_discountable,
    unitPrice,
    JSON.stringify(jsonAmount(unitPrice)),
  ])

  await dbQuery(scope, `
    insert into order_item (
      id,
      order_id,
      version,
      item_id,
      quantity,
      raw_quantity,
      fulfilled_quantity,
      raw_fulfilled_quantity,
      shipped_quantity,
      raw_shipped_quantity,
      return_requested_quantity,
      raw_return_requested_quantity,
      return_received_quantity,
      raw_return_received_quantity,
      return_dismissed_quantity,
      raw_return_dismissed_quantity,
      written_off_quantity,
      raw_written_off_quantity,
      delivered_quantity,
      raw_delivered_quantity,
      unit_price,
      raw_unit_price,
      metadata,
      created_at,
      updated_at
    )
    values (
      $1, $2, 1, $3, 1, $4::jsonb,
      0, $5::jsonb,
      0, $5::jsonb,
      0, $5::jsonb,
      0, $5::jsonb,
      0, $5::jsonb,
      0, $5::jsonb,
      0, $5::jsonb,
      $6, $7::jsonb,
      jsonb_build_object('is_ppu', true),
      now(),
      now()
    )
  `, [
    orderItemId,
    orderId,
    lineItemId,
    JSON.stringify(jsonAmount(1)),
    JSON.stringify(jsonAmount(0)),
    unitPrice,
    JSON.stringify(jsonAmount(unitPrice)),
  ])
}

export const acceptPpuOffer = async (scope: Scope, orderId: string, ruleId: string) => {
  const offer = await findMatchingPpuOffer(scope, orderId)

  if (!offer || offer.id !== ruleId) {
    throw new Error("PPU offer is no longer available.")
  }

  const token = await getStoredPaymentToken(scope, orderId)

  if (!token?.token) {
    throw new Error("Saved payment method is not available for this order.")
  }

  const amount = Number(offer.special_price)
  const existingOfferResult = await dbQuery<{ braintree_transaction_id: string | null }>(scope, `
    select braintree_transaction_id
    from ppu_order_offer
    where order_id = $1 and rule_id = $2
    limit 1
  `, [orderId, ruleId])
  let transactionId = existingOfferResult.rows[0]?.braintree_transaction_id || ""

  if (!transactionId) {
    const gateway = createBraintreeGateway(getBraintreeOptionsFromEnv())
    const normalized = normalizeBraintreeOptions(getBraintreeOptionsFromEnv())
    const result = await gateway.transaction.sale({
      amount: amount.toFixed(2),
      paymentMethodToken: token.token,
      merchantAccountId: token.merchant_account_id || normalized.merchantAccountId || undefined,
      options: {
        submitForSettlement: true,
      },
      orderId: `${orderId}-ppu-${Date.now()}`,
    })

    if (!result.success || !result.transaction) {
      throw new Error(result.message || "Braintree PPU payment failed.")
    }

    transactionId = result.transaction.id

    await dbQuery(scope, `
      update ppu_order_offer
      set status = 'charged', braintree_transaction_id = $3, updated_at = now()
      where order_id = $1 and rule_id = $2
    `, [orderId, ruleId, transactionId])
  }

  await appendOrderItem(scope, orderId, offer.offer_variant_id, amount)
  await updateOrderTotals(scope, orderId, amount)
  await dbQuery(scope, `
    insert into order_transaction (
      id,
      order_id,
      version,
      amount,
      raw_amount,
      currency_code,
      reference,
      reference_id,
      created_at,
      updated_at
    )
    values ($1, $2, 1, $3, $4::jsonb, $5, 'braintree_ppu', $6, now(), now())
  `, [
    newId("ordtxn"),
    orderId,
    amount,
    JSON.stringify(jsonAmount(amount)),
    offer.currency_code,
    transactionId,
  ])
  await dbQuery(scope, `
    update ppu_order_offer
    set status = 'accepted', braintree_transaction_id = $3, updated_at = now()
    where order_id = $1 and rule_id = $2
  `, [orderId, ruleId, transactionId])
  await dbQuery(scope, `
    update "order"
    set
      metadata = coalesce(metadata, '{}'::jsonb)
        || jsonb_build_object(
          'ppu_products_count', coalesce((metadata->>'ppu_products_count')::int, 0) + 1,
          'ppu_products_value', coalesce((metadata->>'ppu_products_value')::numeric, 0) + $2::numeric
        ),
      updated_at = now()
    where id = $1
  `, [orderId, amount])

  return {
    ...offer,
    transaction_id: transactionId,
  }
}

export const skipPpuOffer = async (scope: Scope, orderId: string, ruleId: string) => {
  await ensurePpuTables(scope)
  await dbQuery(scope, `
    update ppu_order_offer
    set status = 'skipped', updated_at = now()
    where order_id = $1 and rule_id = $2 and status <> 'accepted'
  `, [orderId, ruleId])
}
