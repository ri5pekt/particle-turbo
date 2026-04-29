import braintree from "braintree"

export const BRAINTREE_PROVIDER_ID = "braintree"
export const BRAINTREE_PAYMENT_PROVIDER_ID = `pp_${BRAINTREE_PROVIDER_ID}_${BRAINTREE_PROVIDER_ID}`

export type BraintreeEnvironment = "sandbox" | "production"

export type BraintreeProviderOptions = {
  enabled?: boolean | string
  environment?: BraintreeEnvironment
  merchantId?: string
  publicKey?: string
  privateKey?: string
  merchantAccountId?: string
  submitForSettlement?: boolean | string
}

export type BraintreeMaskedConfig = {
  enabled: boolean
  environment: BraintreeEnvironment
  merchant_id_configured: boolean
  merchant_id?: string
  public_key_configured: boolean
  public_key_suffix?: string
  private_key_configured: boolean
  merchant_account_id_configured: boolean
  merchant_account_id?: string
  submit_for_settlement: boolean
  provider_id: string
  ready: boolean
  missing: string[]
}

const boolValue = (value: boolean | string | undefined, fallback = false) => {
  if (typeof value === "boolean") {
    return value
  }

  if (typeof value === "string") {
    return ["1", "true", "yes", "on"].includes(value.toLowerCase())
  }

  return fallback
}

export const getBraintreeOptionsFromEnv = (): BraintreeProviderOptions => ({
  enabled: process.env.BRAINTREE_ENABLED,
  environment: (process.env.BRAINTREE_ENVIRONMENT as BraintreeEnvironment) || "sandbox",
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
  merchantAccountId: process.env.BRAINTREE_MERCHANT_ACCOUNT_ID,
  submitForSettlement: process.env.BRAINTREE_SUBMIT_FOR_SETTLEMENT,
})

export const normalizeBraintreeOptions = (
  options: BraintreeProviderOptions = {}
) => {
  const enabled = boolValue(options.enabled)
  const environment: BraintreeEnvironment = options.environment === "production" ? "production" : "sandbox"
  const submitForSettlement = boolValue(options.submitForSettlement)
  const missing: string[] = []

  if (!options.merchantId) {
    missing.push("BRAINTREE_MERCHANT_ID")
  }

  if (!options.publicKey) {
    missing.push("BRAINTREE_PUBLIC_KEY")
  }

  if (!options.privateKey) {
    missing.push("BRAINTREE_PRIVATE_KEY")
  }

  return {
    enabled,
    environment,
    merchantId: options.merchantId || "",
    publicKey: options.publicKey || "",
    privateKey: options.privateKey || "",
    merchantAccountId: options.merchantAccountId || "",
    submitForSettlement,
    missing,
    ready: enabled && missing.length === 0,
  }
}

export const getMaskedBraintreeConfig = (
  options: BraintreeProviderOptions = {}
): BraintreeMaskedConfig => {
  const normalized = normalizeBraintreeOptions(options)

  return {
    enabled: normalized.enabled,
    environment: normalized.environment,
    merchant_id_configured: Boolean(normalized.merchantId),
    merchant_id: normalized.merchantId || undefined,
    public_key_configured: Boolean(normalized.publicKey),
    public_key_suffix: normalized.publicKey ? normalized.publicKey.slice(-6) : undefined,
    private_key_configured: Boolean(normalized.privateKey),
    merchant_account_id_configured: Boolean(normalized.merchantAccountId),
    merchant_account_id: normalized.merchantAccountId || undefined,
    submit_for_settlement: normalized.submitForSettlement,
    provider_id: BRAINTREE_PAYMENT_PROVIDER_ID,
    ready: normalized.ready,
    missing: normalized.missing,
  }
}

export const assertBraintreeReady = (options: BraintreeProviderOptions = {}) => {
  const normalized = normalizeBraintreeOptions(options)

  if (!normalized.enabled) {
    throw new Error("Braintree is disabled.")
  }

  if (normalized.missing.length) {
    throw new Error(`Missing Braintree configuration: ${normalized.missing.join(", ")}`)
  }

  return normalized
}

export const createBraintreeGateway = (options: BraintreeProviderOptions = {}) => {
  const normalized = assertBraintreeReady(options)

  return new braintree.BraintreeGateway({
    environment: normalized.environment === "production"
      ? braintree.Environment.Production
      : braintree.Environment.Sandbox,
    merchantId: normalized.merchantId,
    publicKey: normalized.publicKey,
    privateKey: normalized.privateKey,
  })
}
