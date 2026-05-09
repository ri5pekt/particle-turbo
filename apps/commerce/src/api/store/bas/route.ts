import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { addBasItemToCart, demoteBasItems, findMatchingBasOffers } from "../../../lib/bas"

interface OffersQuery {
  cart_id?: string
}

interface AddBody {
  cart_id: string
  rule_id: string
  offer_variant_id: string
  special_price: number
}

interface DemoteBody {
  cart_id: string
  removed_variant_id: string
}

// GET /store/bas?cart_id=xxx → list eligible BAS offers for the cart
export async function GET(req: MedusaRequest<never, OffersQuery>, res: MedusaResponse) {
  const { cart_id } = req.query ?? {}
  if (!cart_id) {
    res.status(400).json({ message: "cart_id is required." })
    return
  }
  try {
    const offers = await findMatchingBasOffers(req.scope, String(cart_id))
    res.json({ offers })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Could not load BAS offers.",
    })
  }
}

// POST /store/bas  body: AddBody → add BAS item to cart
export async function POST(req: MedusaRequest<AddBody>, res: MedusaResponse) {
  const { cart_id, rule_id, offer_variant_id, special_price } = req.body ?? {}
  if (!cart_id || !rule_id || !offer_variant_id || special_price == null) {
    res.status(400).json({ message: "cart_id, rule_id, offer_variant_id and special_price are required." })
    return
  }
  try {
    const lineItemId = await addBasItemToCart(
      req.scope,
      String(cart_id),
      String(rule_id),
      String(offer_variant_id),
      Number(special_price)
    )
    res.json({ ok: true, line_item_id: lineItemId })
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Could not add BAS item.",
    })
  }
}

// DELETE /store/bas  body: DemoteBody → demote BAS items when trigger is removed
export async function DELETE(req: MedusaRequest<DemoteBody>, res: MedusaResponse) {
  const { cart_id, removed_variant_id } = req.body ?? {}
  if (!cart_id || !removed_variant_id) {
    res.status(400).json({ message: "cart_id and removed_variant_id are required." })
    return
  }
  try {
    const demotedIds = await demoteBasItems(
      req.scope,
      String(cart_id),
      String(removed_variant_id)
    )
    res.json({ ok: true, demoted_line_item_ids: demotedIds })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Could not demote BAS items.",
    })
  }
}
