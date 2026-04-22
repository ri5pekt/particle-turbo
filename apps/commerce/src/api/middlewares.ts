import { defineMiddlewares, MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework"

/**
 * Validates the Authorization: Bearer <secret-api-key> header on
 * the /webhooks/strapi endpoint. The key must match MEDUSA_STRAPI_WEBHOOK_KEY.
 */
async function validateStrapiWebhookAuth(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const authHeader = req.headers["authorization"]
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim()
  const expected = process.env.MEDUSA_STRAPI_WEBHOOK_KEY

  if (!expected) {
    // Key not configured — reject to prevent accidental open endpoints
    return res.status(500).json({ error: "Webhook key not configured" })
  }

  if (!token || token !== expected) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  next()
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/webhooks/strapi",
      middlewares: [validateStrapiWebhookAuth],
    },
  ],
})
