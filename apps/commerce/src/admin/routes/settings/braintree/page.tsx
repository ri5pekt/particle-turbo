import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Badge, Button, Container, Text, toast } from "@medusajs/ui"
import type { ReactElement } from "react"
import { useEffect, useState } from "react"

type BraintreeConfig = {
  enabled: boolean
  environment: "sandbox" | "production"
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

type StatusResponse = {
  config: BraintreeConfig
}

type TestResponse = {
  ok: boolean
  config: BraintreeConfig
  message: string
}

const ConfigRow = ({
  label,
  value,
}: {
  label: string
  value: string
}): ReactElement => (
  <div className="grid grid-cols-2 gap-4 border-b border-ui-border-base px-6 py-4 last:border-b-0">
    <Text className="text-ui-fg-subtle">{label}</Text>
    <Text className="text-ui-fg-base">{value}</Text>
  </div>
)

const maskBoolean = (value: boolean) => value ? "Configured" : "Missing"

const BraintreeSettingsPage = (): ReactElement => {
  const [config, setConfig] = useState<BraintreeConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTesting, setIsTesting] = useState(false)

  const loadStatus = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/admin/braintree-settings", {
        credentials: "include",
      })
      const payload = await response.json() as StatusResponse
      setConfig(payload.config)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load Braintree settings.")
    } finally {
      setIsLoading(false)
    }
  }

  const testConnection = async () => {
    setIsTesting(true)

    try {
      const response = await fetch("/admin/braintree-settings/test", {
        method: "POST",
        credentials: "include",
      })
      const payload = await response.json() as TestResponse

      setConfig(payload.config)

      if (!response.ok || !payload.ok) {
        toast.error(payload.message || "Braintree connection test failed.")
        return
      }

      toast.success(payload.message || "Braintree credentials are valid.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Braintree connection test failed.")
    } finally {
      setIsTesting(false)
    }
  }

  useEffect(() => {
    void loadStatus()
  }, [])

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-ui-fg-base text-xl font-semibold">Braintree</h1>
          <Text className="text-ui-fg-subtle">
            Provider configuration is loaded from commerce environment variables.
          </Text>
        </div>
        <Button
          variant="secondary"
          size="small"
          type="button"
          disabled={isLoading || isTesting}
          onClick={testConnection}
        >
          {isTesting ? "Testing..." : "Test connection"}
        </Button>
      </div>

      <div className="px-6 py-4">
        {isLoading && (
          <Text className="text-ui-fg-subtle">Loading Braintree status...</Text>
        )}

        {!isLoading && config && (
          <div className="flex gap-2">
            <Badge color={config.enabled ? "green" : "grey"}>
              {config.enabled ? "Enabled" : "Disabled"}
            </Badge>
            <Badge color={config.ready ? "green" : "orange"}>
              {config.ready ? "Ready" : "Needs configuration"}
            </Badge>
            <Badge color={config.environment === "production" ? "red" : "blue"}>
              {config.environment}
            </Badge>
          </div>
        )}
      </div>

      {!isLoading && config && (
        <div>
          <ConfigRow label="Provider ID" value={config.provider_id} />
          <ConfigRow label="Merchant ID" value={config.merchant_id || maskBoolean(config.merchant_id_configured)} />
          <ConfigRow label="Public key" value={config.public_key_suffix ? `••••••${config.public_key_suffix}` : maskBoolean(config.public_key_configured)} />
          <ConfigRow label="Private key" value={maskBoolean(config.private_key_configured)} />
          <ConfigRow label="Merchant account ID" value={config.merchant_account_id || maskBoolean(config.merchant_account_id_configured)} />
          <ConfigRow label="Submit for settlement" value={config.submit_for_settlement ? "Yes" : "No"} />
          <ConfigRow label="Missing values" value={config.missing.length ? config.missing.join(", ") : "None"} />
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Braintree",
})

export default BraintreeSettingsPage
