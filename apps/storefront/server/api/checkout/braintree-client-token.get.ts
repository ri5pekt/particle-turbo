interface BraintreeClientTokenResponse {
  client_token: string
  provider_id: string
  environment: 'sandbox' | 'production'
}

export default defineEventHandler(async () => {
  const medusa = useMedusaServer()

  return await medusa<BraintreeClientTokenResponse>('/store/braintree/client-token')
})
