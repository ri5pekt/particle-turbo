import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { syncProductToStrapiWorkflow } from "../workflows/sync-product-to-strapi"

export default async function productUpdatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await syncProductToStrapiWorkflow(container).run({
    input: { product_id: data.id },
  })
}

export const config: SubscriberConfig = {
  event: "product.updated",
}
