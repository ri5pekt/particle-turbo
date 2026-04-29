import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { acceptPpuOffer, releasePpuOrder } from "../../../../../../lib/ppu"

type AcceptBody = {
  rule_id?: string
}

export async function POST(req: MedusaRequest<AcceptBody>, res: MedusaResponse) {
  const orderId = req.params.id
  const ruleId = req.body?.rule_id

  if (!ruleId) {
    res.status(400).json({ message: "Missing PPU rule id." })
    return
  }

  try {
    const offer = await acceptPpuOffer(req.scope, orderId, ruleId)
    await releasePpuOrder(req.scope, orderId, "accepted")

    res.json({
      accepted: true,
      offer,
    })
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Could not accept post-purchase offer.",
    })
  }
}
