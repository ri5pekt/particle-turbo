import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { releaseExpiredPpuOrders } from "../../../../lib/ppu"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const released_order_ids = await releaseExpiredPpuOrders(req.scope)

    res.json({
      released_order_ids,
      released_count: released_order_ids.length,
    })
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Could not release expired PPU orders.",
    })
  }
}
