import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  BRAINTREE_PAYMENT_PROVIDER_ID,
  createBraintreeGateway,
  getBraintreeOptionsFromEnv,
  normalizeBraintreeOptions,
} from "../../../../modules/braintree-payment/config"

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const options = getBraintreeOptionsFromEnv()
  const normalized = normalizeBraintreeOptions(options)

  if (!normalized.ready) {
    res.status(400).json({
      message: normalized.enabled
        ? `Missing Braintree configuration: ${normalized.missing.join(", ")}`
        : "Braintree is disabled.",
    })
    return
  }

  try {
    const gateway = createBraintreeGateway(options)
    const response = await gateway.clientToken.generate({
      merchantAccountId: normalized.merchantAccountId || undefined,
    })

    res.json({
      client_token: response.clientToken,
      provider_id: BRAINTREE_PAYMENT_PROVIDER_ID,
      environment: normalized.environment,
    })
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Could not generate Braintree client token.",
    })
  }
}
