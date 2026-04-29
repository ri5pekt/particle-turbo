import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { listPpuRules, upsertPpuRule, type PpuRule } from "../../../lib/ppu"

type RuleBody = Partial<PpuRule>

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const rules = await listPpuRules(req.scope)
    res.json({ rules })
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Could not load PPU rules.",
    })
  }
}

export async function POST(req: MedusaRequest<RuleBody>, res: MedusaResponse) {
  if (!req.body?.offer_variant_id) {
    res.status(400).json({ message: "offer_variant_id is required." })
    return
  }

  try {
    const rule = await upsertPpuRule(req.scope, req.body)
    res.json({ rule })
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Could not save PPU rule.",
    })
  }
}
