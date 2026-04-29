import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { dbQuery } from "../../../../lib/ppu"
import { createCustomerSessionForEmail } from "../../../../lib/account-session"

type CheckoutSessionBody = {
  order_id?: string
  email?: string
}

export async function POST(req: MedusaRequest<CheckoutSessionBody>, res: MedusaResponse) {
  const orderId = req.body?.order_id
  const email = req.body?.email?.trim().toLowerCase()

  if (!orderId || !email) {
    res.status(400).json({ message: "Order id and email are required." })
    return
  }

  const orderResult = await dbQuery<{ customer_id: string | null, email: string, created_at: string }>(req.scope, `
    select customer_id, email, created_at::text
    from "order"
    where id = $1
      and lower(email) = lower($2)
      and deleted_at is null
      and created_at >= now() - interval '30 minutes'
    limit 1
  `, [orderId, email])
  const order = orderResult.rows[0]

  if (!order) {
    res.status(404).json({ message: "Recent checkout order was not found." })
    return
  }

  const session = await createCustomerSessionForEmail(req, email)

  res.json({
    token: session.token,
    customer_id: session.customer_id,
  })
}
