import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { findMatchingPpuOffer } from "../../../../../../lib/ppu"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id

  try {
    const offer = await findMatchingPpuOffer(req.scope, orderId)

    res.json({
      offer,
    })
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Could not load post-purchase offer.",
    })
  }
}
