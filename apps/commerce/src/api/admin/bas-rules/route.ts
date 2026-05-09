import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { deleteBasRule, listBasRules, upsertBasRule } from "../../../lib/bas"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const rules = await listBasRules(req.scope)
    res.json({ rules })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Could not load BAS rules.",
    })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const rule = await upsertBasRule(req.scope, req.body as Record<string, unknown>)
    res.json({ rule })
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Could not save BAS rule.",
    })
  }
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.body as { id: string }
  if (!id) {
    res.status(400).json({ message: "id is required." })
    return
  }
  try {
    await deleteBasRule(req.scope, id)
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Could not delete BAS rule.",
    })
  }
}
