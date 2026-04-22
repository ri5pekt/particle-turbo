import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { handleStrapiWebhookWorkflow } from "../../../workflows/handle-strapi-webhook"

/**
 * POST /webhooks/strapi
 *
 * Receives event notifications from Strapi and syncs the data back to Medusa.
 * Authentication is validated by the middleware in src/api/middlewares.ts.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as {
    event: string
    uid: string
    entry: {
      id: number
      documentId: string
      medusaId?: string
      [key: string]: any
    }
  }

  if (!body?.event || !body?.uid || !body?.entry) {
    return res.status(400).json({ error: "Invalid webhook payload" })
  }

  try {
    await handleStrapiWebhookWorkflow(req.scope).run({
      input: {
        event: body.event,
        uid: body.uid,
        entry: body.entry,
      },
    })

    res.status(200).json({ received: true })
  } catch (err: any) {
    req.scope.resolve("logger").error("[strapi-webhook] Error processing webhook", err)
    res.status(500).json({ error: "Webhook processing failed" })
  }
}
