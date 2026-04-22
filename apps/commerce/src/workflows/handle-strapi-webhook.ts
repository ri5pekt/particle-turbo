/**
 * Handles an incoming webhook from Strapi (Strapi → Medusa direction).
 * Updates the Medusa product's metadata with the latest Strapi document ID.
 */
import {
  createWorkflow,
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type StrapiWebhookInput = {
  event: string
  uid: string
  entry: {
    id: number
    documentId: string
    medusaId?: string
    [key: string]: any
  }
}

type WebhookStepResult = {
  skipped: boolean
  processed: boolean
  medusaId?: string
}

const processStrapiWebhookStep = createStep(
  "process-strapi-webhook",
  async (input: StrapiWebhookInput, { container }): Promise<StepResponse<WebhookStepResult>> => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const { entry, uid } = input

    const supportedUids = [
      "api::product.product",
      "api::product-variant.product-variant",
      "api::product-option.product-option",
      "api::product-option-value.product-option-value",
    ]

    if (!supportedUids.includes(uid)) {
      logger.debug(`[strapi-webhook] Skipping unsupported uid: ${uid}`)
      return new StepResponse({ skipped: true, processed: false })
    }

    const medusaId = entry?.medusaId
    if (!medusaId) {
      logger.debug("[strapi-webhook] Entry has no medusaId, skipping")
      return new StepResponse({ skipped: true, processed: false })
    }

    if (uid === "api::product.product") {
      const productService = container.resolve(Modules.PRODUCT)

      const [product] = await productService.listProducts({ id: [medusaId] })

      if (!product) {
        logger.warn(`[strapi-webhook] Product ${medusaId} not found in Medusa`)
        return new StepResponse({ skipped: true, processed: false })
      }

      await productService.updateProducts(medusaId, {
        metadata: {
          ...(product.metadata ?? {}),
          strapi_document_id: entry.documentId,
        },
      })

      logger.info(
        `[strapi-webhook] Updated product ${medusaId} strapi_document_id → ${entry.documentId}`
      )
    }

    return new StepResponse({ skipped: false, processed: true, medusaId })
  }
)

export const handleStrapiWebhookWorkflow = createWorkflow(
  "handle-strapi-webhook",
  (input: StrapiWebhookInput) => {
    const result = processStrapiWebhookStep(input)
    return new WorkflowResponse(result)
  }
)
