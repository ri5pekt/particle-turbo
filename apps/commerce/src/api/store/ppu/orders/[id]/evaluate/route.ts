import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { markOrderPpuHold } from "../../../../../../lib/ppu"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id

  try {
    const offer = await markOrderPpuHold(req.scope, orderId)

    res.json({
      eligible: Boolean(offer),
      offer,
    })
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Could not evaluate post-purchase offer.",
    })
  }
}
