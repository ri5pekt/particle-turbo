import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export type FetchedProduct = {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  handle: string | null
  metadata: Record<string, any> | null
}

export const fetchProductFromMedusaStep = createStep(
  "fetch-product-from-medusa",
  async ({ product_id }: { product_id: string }, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "title", "subtitle", "description", "handle", "metadata"],
      filters: { id: product_id },
    })

    const product = products?.[0] as FetchedProduct | undefined

    if (!product) {
      throw new Error(`Product ${product_id} not found in Medusa`)
    }

    return new StepResponse(product)
  }
)
