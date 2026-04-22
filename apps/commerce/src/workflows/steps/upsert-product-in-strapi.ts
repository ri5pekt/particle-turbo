import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService from "../../modules/strapi/service"
import { FetchedProduct } from "./fetch-product-from-medusa"

export type StrapiProductResult = {
  productDocumentId: string
}

export const upsertProductInStrapiStep = createStep(
  "upsert-product-in-strapi",
  async (product: FetchedProduct, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    const strapiProduct = await strapiService.upsertProduct({
      medusaId: product.id,
      title: product.title,
      subtitle: product.subtitle ?? undefined,
      description: product.description ?? undefined,
      handle: product.handle ?? undefined,
    })

    const result: StrapiProductResult = {
      productDocumentId: strapiProduct.documentId,
    }

    return new StepResponse(result, {
      productMedusaId: product.id,
      productDocumentId: strapiProduct.documentId,
    })
  },
  async ({ productMedusaId }: { productMedusaId: string }, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)
    await strapiService.deleteProduct(productMedusaId).catch(() => {})
  }
)
