import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { deleteProductFromStrapiStep } from "./steps/delete-product-from-strapi"

type Input = { product_id: string }

export const deleteProductFromStrapiWorkflow = createWorkflow(
  "delete-product-from-strapi",
  (input: Input) => {
    const result = deleteProductFromStrapiStep({ product_id: input.product_id })
    return new WorkflowResponse(result)
  }
)
