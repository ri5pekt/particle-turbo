import { defineMiddlewares } from "@medusajs/framework"
import { authenticate } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      method: ["GET"],
      matcher: "/store/account/orders",
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
      ],
    },
  ],
})
