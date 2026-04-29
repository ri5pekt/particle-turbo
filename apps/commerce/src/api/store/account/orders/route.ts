import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { dbQuery } from "../../../../lib/ppu"

type OrderRow = {
  id: string
  display_id: number
  status: string
  email: string
  currency_code: string
  created_at: string
  total: string | null
  item_id: string | null
  title: string | null
  quantity: string | null
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const authContext = (req as unknown as { auth_context?: { actor_id?: string } }).auth_context
  const customerId = authContext?.actor_id

  if (!customerId) {
    res.status(401).json({ message: "Customer authentication is required." })
    return
  }

  const customerResult = await dbQuery<{ email: string }>(req.scope, `
    select email
    from customer
    where id = $1 and deleted_at is null
    limit 1
  `, [customerId])
  const email = customerResult.rows[0]?.email

  if (!email) {
    res.status(404).json({ message: "Customer was not found." })
    return
  }

  const result = await dbQuery<OrderRow>(req.scope, `
    select
      o.id,
      o.display_id,
      o.status,
      o.email,
      o.currency_code,
      o.created_at::text,
      os.totals->>'current_order_total' as total,
      oli.id as item_id,
      oli.title,
      oi.quantity::text
    from "order" o
    left join order_summary os on os.order_id = o.id and os.deleted_at is null
    left join order_item oi on oi.order_id = o.id and oi.deleted_at is null
    left join order_line_item oli on oli.id = oi.item_id and oli.deleted_at is null
    where lower(o.email) = lower($1)
      and o.deleted_at is null
      and o.is_draft_order = false
    order by o.created_at desc
    limit 200
  `, [email])

  const orders = Array.from(result.rows.reduce((map, row) => {
    const order = map.get(row.id) || {
      id: row.id,
      display_id: row.display_id,
      status: row.status,
      email: row.email,
      currency_code: row.currency_code,
      created_at: row.created_at,
      total: Number(row.total || 0),
      items: [] as Array<{ id: string, title: string | null, quantity: number }>,
    }

    if (row.item_id) {
      order.items.push({
        id: row.item_id,
        title: row.title,
        quantity: Number(row.quantity || 1),
      })
    }

    map.set(row.id, order)
    return map
  }, new Map<string, {
    id: string
    display_id: number
    status: string
    email: string
    currency_code: string
    created_at: string
    total: number
    items: Array<{ id: string, title: string | null, quantity: number }>
  }>()).values())

  res.json({
    orders,
    count: orders.length,
  })
}
