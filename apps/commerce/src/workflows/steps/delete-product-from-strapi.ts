import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService from "../../modules/strapi/service"

export const deleteProductFromStrapiStep = createStep(
  "delete-product-from-strapi",
  async ({ product_id }: { product_id: string }, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)
    await strapiService.deleteProduct(product_id)
    return new StepResponse({ deleted: product_id })
  }
)
