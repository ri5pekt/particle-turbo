import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { deleteProductFromStrapiWorkflow } from "../workflows/delete-product-from-strapi"

export default async function productDeletedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await deleteProductFromStrapiWorkflow(container).run({
    input: { product_id: data.id },
  })
}

export const config: SubscriberConfig = {
  event: "product.deleted",
}
