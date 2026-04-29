import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import BraintreePaymentProviderService from "./service"

export default ModuleProvider(Modules.PAYMENT, {
  services: [BraintreePaymentProviderService],
})
