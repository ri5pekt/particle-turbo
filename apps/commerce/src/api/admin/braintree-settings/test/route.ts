import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  createBraintreeGateway,
  getBraintreeOptionsFromEnv,
  getMaskedBraintreeConfig,
  normalizeBraintreeOptions,
} from "../../../../modules/braintree-payment/config"

export async function POST(_req: MedusaRequest, res: MedusaResponse) {
  const options = getBraintreeOptionsFromEnv()
  const config = getMaskedBraintreeConfig(options)
  const normalized = normalizeBraintreeOptions(options)

  if (!normalized.ready) {
    res.status(400).json({
      ok: false,
      config,
      message: normalized.enabled
        ? `Missing Braintree configuration: ${normalized.missing.join(", ")}`
        : "Braintree is disabled.",
    })
    return
  }

  try {
    const gateway = createBraintreeGateway(options)
    await gateway.clientToken.generate({
      merchantAccountId: normalized.merchantAccountId || undefined,
    })

    res.json({
      ok: true,
      config,
      message: "Braintree credentials are valid.",
    })
  } catch (error) {
    res.status(400).json({
      ok: false,
      config,
      message: error instanceof Error ? error.message : "Braintree connection test failed.",
    })
  }
}
