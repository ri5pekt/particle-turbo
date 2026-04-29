import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createCustomerSessionForEmail } from "../../../../lib/account-session"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  if (process.env.NODE_ENV === "production") {
    res.status(404).json({ message: "Not found." })
    return
  }

  const email = process.env.MEDUSA_ADMIN_EMAIL?.trim().toLowerCase()

  if (!email) {
    res.status(400).json({ message: "MEDUSA_ADMIN_EMAIL is not configured." })
    return
  }

  const session = await createCustomerSessionForEmail(req, email)

  res.json(session)
}
