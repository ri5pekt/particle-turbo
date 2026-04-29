import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
} from "@medusajs/framework/types"
import { AbstractPaymentProvider, BigNumber, MedusaError } from "@medusajs/framework/utils"
import {
  BRAINTREE_PROVIDER_ID,
  BraintreeProviderOptions,
  assertBraintreeReady,
  createBraintreeGateway,
  getMaskedBraintreeConfig,
  normalizeBraintreeOptions,
} from "./config"

type InjectedDependencies = {
  logger?: {
    info: (message: string) => void
    warn: (message: string) => void
    error: (message: string) => void
  }
}

type PaymentData = Record<string, unknown> & {
  nonce?: string
  payment_method_nonce?: string
  payment_method_token?: string
  braintree_customer_id?: string
  merchant_account_id?: string
  transaction_id?: string
  email?: string
  billing_address?: CheckoutAddress
  shipping_address?: CheckoutAddress
}

type CheckoutAddress = {
  first_name?: string
  last_name?: string
  address_1?: string
  address_2?: string
  city?: string
  province?: string
  postal_code?: string
  phone?: string
  country_code?: string
}

const toNumberAmount = (amount: unknown) => {
  if (typeof amount === "number") {
    return amount
  }

  if (typeof amount === "string") {
    return Number(amount)
  }

  if (amount && typeof amount === "object" && "value" in amount) {
    return Number((amount as { value: unknown }).value)
  }

  return Number(amount || 0)
}

const toBraintreeAmount = (amount: unknown, currencyCode?: string) => {
  const numericAmount = toNumberAmount(amount)

  return numericAmount.toFixed(2)
}

const getNonce = (data: PaymentData) => {
  const nonce = data.payment_method_nonce || data.nonce

  if (!nonce || typeof nonce !== "string") {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Missing Braintree payment method nonce."
    )
  }

  return nonce
}

const cleanObject = <T extends Record<string, unknown>>(value: T) => {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== "")
  ) as Partial<T>
}

const toBraintreeAddress = (address?: CheckoutAddress) => {
  if (!address) {
    return undefined
  }

  return cleanObject({
    firstName: address.first_name,
    lastName: address.last_name,
    streetAddress: address.address_1,
    extendedAddress: address.address_2,
    locality: address.city,
    region: address.province,
    postalCode: address.postal_code,
    countryCodeAlpha2: address.country_code?.toUpperCase(),
  })
}

const toBraintreeCustomer = (data: PaymentData) => {
  const billingAddress = data.billing_address

  return cleanObject({
    firstName: billingAddress?.first_name,
    lastName: billingAddress?.last_name,
    email: data.email,
    phone: billingAddress?.phone,
  })
}

const getVaultedPaymentMethod = async (
  gateway: ReturnType<typeof createBraintreeGateway>,
  nonce: string,
  data: PaymentData
) => {
  const customer = await gateway.customer.create({
    ...toBraintreeCustomer(data),
    paymentMethodNonce: nonce,
  })

  if (!customer.success || !customer.customer) {
    return undefined
  }

  const paymentMethod = customer.customer.paymentMethods?.[0]

  if (!paymentMethod?.token) {
    return undefined
  }

  return {
    customerId: customer.customer.id,
    token: paymentMethod.token,
    cardType: "cardType" in paymentMethod ? paymentMethod.cardType : undefined,
    last4: "last4" in paymentMethod ? paymentMethod.last4 : undefined,
  }
}

class BraintreePaymentProviderService extends AbstractPaymentProvider<BraintreeProviderOptions> {
  static identifier = BRAINTREE_PROVIDER_ID

  protected readonly options_: BraintreeProviderOptions
  protected readonly logger_?: InjectedDependencies["logger"]

  constructor(container: InjectedDependencies, options: BraintreeProviderOptions) {
    super(container, options)
    this.options_ = options || {}
    this.logger_ = container.logger
  }

  static validateOptions(options: BraintreeProviderOptions) {
    const normalized = normalizeBraintreeOptions(options)

    if (normalized.enabled && normalized.missing.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Missing Braintree provider options: ${normalized.missing.join(", ")}`
      )
    }
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    assertBraintreeReady(this.options_)

    return {
      id: `bt_${Date.now()}`,
      data: {
        ...(input.data || {}),
        provider: BRAINTREE_PROVIDER_ID,
        amount: toNumberAmount(input.amount),
        currency_code: input.currency_code,
      },
    }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return {
      data: {
        ...(input.data || {}),
        ...((input as unknown as { data?: Record<string, unknown> }).data || {}),
      },
    }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const gateway = createBraintreeGateway(this.options_)
    const normalized = normalizeBraintreeOptions(this.options_)
    const data = (input.data || {}) as PaymentData
    const nonce = getNonce(data)
    const amount = toBraintreeAmount(
      (input as unknown as { amount?: unknown }).amount || data.amount,
      (input as unknown as { currency_code?: string }).currency_code || String(data.currency_code || "usd")
    )
    const vaultedPaymentMethod = await getVaultedPaymentMethod(gateway, nonce, data)

    const result = await gateway.transaction.sale({
      amount,
      paymentMethodToken: vaultedPaymentMethod?.token,
      paymentMethodNonce: vaultedPaymentMethod?.token ? undefined : nonce,
      merchantAccountId: normalized.merchantAccountId || undefined,
      customerId: vaultedPaymentMethod?.customerId,
      customer: vaultedPaymentMethod?.customerId ? undefined : toBraintreeCustomer(data),
      billing: toBraintreeAddress(data.billing_address),
      shipping: toBraintreeAddress(data.shipping_address),
      options: {
        submitForSettlement: normalized.submitForSettlement,
      },
    })

    if (!result.success || !result.transaction) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        result.message || "Braintree payment authorization failed."
      )
    }

    return {
      status: "authorized",
      data: {
        ...data,
        transaction_id: result.transaction.id,
        transaction_status: result.transaction.status,
        payment_method_token: vaultedPaymentMethod?.token || result.transaction.creditCardDetails?.token,
        braintree_customer_id: vaultedPaymentMethod?.customerId || result.transaction.customerDetails?.id,
        merchant_account_id: normalized.merchantAccountId,
        card_type: vaultedPaymentMethod?.cardType || result.transaction.creditCardDetails?.cardType,
        card_last_4: vaultedPaymentMethod?.last4 || result.transaction.creditCardDetails?.last4,
        amount,
        submit_for_settlement: normalized.submitForSettlement,
      },
    }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const transactionId = (input.data as PaymentData)?.transaction_id

    if (!transactionId || typeof transactionId !== "string") {
      return { data: input.data || {} }
    }

    const gateway = createBraintreeGateway(this.options_)
    const result = await gateway.transaction.submitForSettlement(transactionId)

    if (!result.success || !result.transaction) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        result.message || "Braintree capture failed."
      )
    }

    return {
      data: {
        ...(input.data || {}),
        transaction_status: result.transaction.status,
      },
    }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const transactionId = (input.data as PaymentData)?.transaction_id

    if (!transactionId || typeof transactionId !== "string") {
      return { data: input.data || {} }
    }

    const gateway = createBraintreeGateway(this.options_)
    const amount = toBraintreeAmount(
      (input as unknown as { amount?: unknown }).amount,
      String((input.data as PaymentData)?.currency_code || "usd")
    )
    const result = await gateway.transaction.refund(transactionId, amount)

    if (!result.success) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        result.message || "Braintree refund failed."
      )
    }

    return {
      data: {
        ...(input.data || {}),
        refund_id: result.transaction?.id,
      },
    }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const transactionId = (input.data as PaymentData)?.transaction_id

    if (!transactionId || typeof transactionId !== "string") {
      return { data: input.data || {} }
    }

    const gateway = createBraintreeGateway(this.options_)
    const result = await gateway.transaction.void(transactionId)

    if (!result.success) {
      this.logger_?.warn(result.message || "Braintree void failed.")
    }

    return {
      data: {
        ...(input.data || {}),
        canceled: result.success,
      },
    }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return {
      data: input.data || {},
    }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const transactionId = (input.data as PaymentData)?.transaction_id

    if (!transactionId || typeof transactionId !== "string") {
      return { data: input.data || {} }
    }

    const gateway = createBraintreeGateway(this.options_)
    const transaction = await gateway.transaction.find(transactionId)

    return {
      data: {
        ...(input.data || {}),
        transaction_status: transaction.status,
      },
    }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const transactionStatus = (input.data as PaymentData)?.transaction_status

    if (transactionStatus === "settled" || transactionStatus === "settling") {
      return { status: "captured" }
    }

    if (transactionStatus === "voided") {
      return { status: "canceled" }
    }

    if ((input.data as PaymentData)?.transaction_id) {
      return { status: "authorized" }
    }

    return { status: "pending" }
  }

  async getWebhookActionAndData() {
    return {
      action: "not_supported" as const,
      data: {
        session_id: "",
        amount: new BigNumber(0),
      },
    }
  }

  async getBraintreeStatus() {
    return getMaskedBraintreeConfig(this.options_)
  }
}

export default BraintreePaymentProviderService
