/**
 * Sync a Medusa product to Strapi (create or update).
 * Used by both product.created and product.updated subscribers.
 */
import {
  createWorkflow,
  WorkflowResponse,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { fetchProductFromMedusaStep } from "./steps/fetch-product-from-medusa"
import { upsertProductInStrapiStep } from "./steps/upsert-product-in-strapi"
import { updateMedusaProductMetadataStep } from "./steps/update-medusa-product-metadata"

type Input = { product_id: string }

export const syncProductToStrapiWorkflow = createWorkflow(
  "sync-product-to-strapi",
  (input: Input) => {
    const product = fetchProductFromMedusaStep({ product_id: input.product_id })

    const strapiResult = upsertProductInStrapiStep(product)

    const metadataInput = transform(
      { product_id: input.product_id, strapiResult },
      (ctx) => ({
        product_id: ctx.product_id,
        strapiResult: ctx.strapiResult,
      })
    )

    updateMedusaProductMetadataStep(metadataInput)

    return new WorkflowResponse(strapiResult)
  }
)
