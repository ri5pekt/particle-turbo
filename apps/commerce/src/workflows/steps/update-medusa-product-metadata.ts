import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { StrapiProductResult } from "./upsert-product-in-strapi"

type Input = {
  product_id: string
  strapiResult: StrapiProductResult
}

export const updateMedusaProductMetadataStep = createStep(
  "update-medusa-product-metadata",
  async ({ product_id, strapiResult }: Input, { container }) => {
    const productService = container.resolve(Modules.PRODUCT)

    await productService.updateProducts(product_id, {
      metadata: {
        strapi_document_id: strapiResult.productDocumentId,
      },
    })

    return new StepResponse({ product_id, strapiResult })
  }
)
