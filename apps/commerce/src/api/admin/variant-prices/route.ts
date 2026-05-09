import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { IPricingModuleService } from "@medusajs/framework/types"

type UpdateBody = {
  priceId?: string
  variantId?: string
  currencyCode?: string
  minQuantity?: number | null
  amount: number
}

type DeleteBody = {
  priceId: string
}

type PriceRecord = {
  id: string
  price_set_id: string
  currency_code: string
  min_quantity?: number | null
  max_quantity?: number | null
  amount: number
}

async function lookupPrice(req: MedusaRequest, priceId: string): Promise<PriceRecord | null> {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "price",
    filters: { id: [priceId] },
    fields: ["id", "price_set_id", "currency_code", "min_quantity", "max_quantity", "amount"],
  })
  return (data[0] as PriceRecord) ?? null
}

async function lookupPriceSetId(req: MedusaRequest, variantId: string): Promise<string | null> {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product_variant",
    filters: { id: [variantId] },
    fields: ["price_set.id"],
  })
  const variant = data[0] as { price_set?: { id: string } } | undefined
  return variant?.price_set?.id ?? null
}

export async function POST(req: MedusaRequest<UpdateBody>, res: MedusaResponse) {
  const { priceId, variantId, currencyCode, minQuantity, amount } = req.body ?? {}

  if (amount == null) {
    res.status(400).json({ message: "amount is required." })
    return
  }

  const pricingService = req.scope.resolve<IPricingModuleService>(Modules.PRICING)

  try {
    // Create new tier price
    if (!priceId) {
      if (!variantId || !currencyCode || minQuantity == null) {
        res.status(400).json({ message: "variantId, currencyCode and minQuantity are required when creating a new price." })
        return
      }
      const priceSetId = await lookupPriceSetId(req, variantId)
      if (!priceSetId) {
        res.status(404).json({ message: "Price set not found for this variant." })
        return
      }
      const priceSet = await pricingService.addPrices({
        priceSetId,
        prices: [{ amount: Number(amount), currency_code: currencyCode, min_quantity: minQuantity }],
      })
      const newPrice = priceSet.prices?.find(
        (p) => p.currency_code === currencyCode && Number(p.min_quantity) === Number(minQuantity)
      )
      res.json({ ok: true, newPriceId: newPrice?.id ?? null })
      return
    }

    // Update existing price
    const existing = await lookupPrice(req, priceId)
    if (!existing) {
      res.status(404).json({ message: "Price not found." })
      return
    }

    await pricingService.removePrices([priceId])
    const priceSet = await pricingService.addPrices({
      priceSetId: existing.price_set_id,
      prices: [
        {
          amount: Number(amount),
          currency_code: existing.currency_code,
          ...(existing.min_quantity != null ? { min_quantity: existing.min_quantity } : {}),
          ...(existing.max_quantity != null ? { max_quantity: existing.max_quantity } : {}),
        },
      ],
    })
    const newPrice = priceSet.prices?.find(
      (p) =>
        p.currency_code === existing.currency_code &&
        (p.min_quantity ?? null) === (existing.min_quantity ?? null)
    )
    res.json({ ok: true, newPriceId: newPrice?.id ?? null })
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Could not update price.",
    })
  }
}

export async function DELETE(req: MedusaRequest<DeleteBody>, res: MedusaResponse) {
  const { priceId } = req.body ?? {}

  if (!priceId) {
    res.status(400).json({ message: "priceId is required." })
    return
  }

  const pricingService = req.scope.resolve<IPricingModuleService>(Modules.PRICING)

  try {
    await pricingService.removePrices([priceId])
    res.json({ ok: true })
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Could not delete price.",
    })
  }
}
