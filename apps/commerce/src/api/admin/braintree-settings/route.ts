import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  getBraintreeOptionsFromEnv,
  getMaskedBraintreeConfig,
} from "../../../modules/braintree-payment/config"

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  res.json({
    config: getMaskedBraintreeConfig(getBraintreeOptionsFromEnv()),
  })
}
