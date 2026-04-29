import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { releasePpuOrder, skipPpuOffer } from "../../../../../../lib/ppu"

type SkipBody = {
  rule_id?: string
}

export async function POST(req: MedusaRequest<SkipBody>, res: MedusaResponse) {
  const orderId = req.params.id
  const ruleId = req.body?.rule_id

  try {
    if (ruleId) {
      await skipPpuOffer(req.scope, orderId, ruleId)
    }

    await releasePpuOrder(req.scope, orderId, "skipped")

    res.json({
      skipped: true,
    })
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Could not skip post-purchase offer.",
    })
  }
}
