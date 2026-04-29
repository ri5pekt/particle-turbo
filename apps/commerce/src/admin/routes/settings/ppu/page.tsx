import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Text, toast } from "@medusajs/ui"
import type { ReactElement } from "react"
import { useEffect, useState } from "react"
import { VariantAutocomplete, type VariantOption } from "../../../components/VariantAutocomplete"

type PpuRule = {
  id: string
  name: string
  status: "active" | "draft"
  priority: number
  trigger_variant_ids: string[]
  excluded_variant_ids: string[]
  offer_variant_id: string
  special_price: string
  text_fields: Record<string, string>
  max_accepts: number
}

type RulesResponse = {
  rules: PpuRule[]
}

type AdminProductVariant = {
  id: string
  title?: string
  sku?: string | null
}

type AdminProduct = {
  id: string
  title: string
  handle?: string
  variants?: AdminProductVariant[]
}

type ProductsResponse = {
  products?: AdminProduct[]
}

const emptyRule = {
  id: "",
  name: "",
  status: "draft",
  priority: 0,
  trigger_variant_ids: [] as string[],
  excluded_variant_ids: [] as string[],
  offer_variant_id: "",
  special_price: "",
  max_accepts: 1,
  eyebrow: "",
  title: "",
  description: "",
  price_label: "",
  accept_button: "",
  skip_button: "",
}

const inputClassName = "w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 text-ui-fg-base"
const labelClassName = "grid gap-1 text-ui-fg-subtle"

const buildVariantOptions = (products: AdminProduct[]): VariantOption[] => {
  return products.flatMap((product) => {
    return (product.variants || []).map((variant) => ({
      id: variant.id,
      label: [
        product.title,
        variant.title && variant.title !== "Default variant" ? variant.title : "",
        variant.sku ? `SKU: ${variant.sku}` : "",
      ].filter(Boolean).join(" - "),
    }))
  })
}

const PpuSettingsPage = (): ReactElement => {
  const [rules, setRules] = useState<PpuRule[]>([])
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([])
  const [form, setForm] = useState(emptyRule)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const loadRules = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/admin/ppu-rules", {
        credentials: "include",
      })
      const payload = await response.json() as RulesResponse

      setRules(payload.rules || [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load PPU rules.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadProducts = async () => {
    setIsLoadingProducts(true)

    try {
      const response = await fetch("/admin/products?fields=id,title,handle,*variants&limit=200", {
        credentials: "include",
      })
      const payload = await response.json() as ProductsResponse

      setVariantOptions(buildVariantOptions(payload.products || []))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load product variants.")
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const saveRule = async () => {
    setIsSaving(true)

    try {
      const response = await fetch("/admin/ppu-rules", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: form.id || undefined,
          name: form.name || "Post-purchase upsell",
          status: form.status,
          priority: Number(form.priority || 0),
          trigger_variant_ids: form.trigger_variant_ids,
          excluded_variant_ids: form.excluded_variant_ids,
          offer_variant_id: form.offer_variant_id,
          special_price: Number(form.special_price || 0),
          max_accepts: Number(form.max_accepts || 1),
          text_fields: {
            eyebrow: form.eyebrow,
            title: form.title,
            description: form.description,
            price_label: form.price_label,
            accept_button: form.accept_button,
            skip_button: form.skip_button,
          },
        }),
      })
      const payload = await response.json() as { message?: string }

      if (!response.ok) {
        toast.error(payload.message || "Could not save PPU rule.")
        return
      }

      toast.success(form.id ? "PPU rule updated." : "PPU rule saved.")
      setForm(emptyRule)
      await loadRules()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save PPU rule.")
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    void loadRules()
    void loadProducts()
  }, [])

  const getVariantLabel = (variantId: string) => {
    return variantOptions.find((option) => option.id === variantId)?.label || variantId
  }

  const editRule = (rule: PpuRule) => {
    setForm({
      id: rule.id,
      name: rule.name,
      status: rule.status,
      priority: rule.priority,
      trigger_variant_ids: rule.trigger_variant_ids || [],
      excluded_variant_ids: rule.excluded_variant_ids || [],
      offer_variant_id: rule.offer_variant_id,
      special_price: String(rule.special_price || ""),
      max_accepts: rule.max_accepts || 1,
      eyebrow: rule.text_fields?.eyebrow || "",
      title: rule.text_fields?.title || "",
      description: rule.text_fields?.description || "",
      price_label: rule.text_fields?.price_label || "",
      accept_button: rule.text_fields?.accept_button || "",
      skip_button: rule.text_fields?.skip_button || "",
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="grid gap-6">
      <Container className="p-0">
        <div className="border-b border-ui-border-base px-6 py-4">
          <h1 className="text-ui-fg-base text-xl font-semibold">
            {form.id ? "Edit post-purchase upsell" : "Post-purchase upsells"}
          </h1>
          <Text className="text-ui-fg-subtle">
            {form.id
              ? `Editing rule ${form.id}`
              : "Rules are evaluated after checkout. Matching orders are held briefly while the offer is shown."}
          </Text>
        </div>

        <div className="grid gap-4 px-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <label className={labelClassName}>
              Rule name
              <input
                className={inputClassName}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </label>
            <label className={labelClassName}>
              Status
              <select
                className={inputClassName}
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as "active" | "draft" })}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </label>
          </div>

          <VariantAutocomplete
            label="Trigger products"
            helperText="Leave empty to match any order. Search by product name, variant, SKU, or ID."
            options={variantOptions}
            selectedIds={form.trigger_variant_ids}
            multiple
            disabled={isLoadingProducts}
            onChange={(trigger_variant_ids) => setForm({ ...form, trigger_variant_ids })}
          />

          <VariantAutocomplete
            label="Excluded products"
            helperText="Customers who already bought these products will not see this offer."
            options={variantOptions}
            selectedIds={form.excluded_variant_ids}
            multiple
            disabled={isLoadingProducts}
            onChange={(excluded_variant_ids) => setForm({ ...form, excluded_variant_ids })}
          />

          <div className="grid grid-cols-3 gap-4">
            <VariantAutocomplete
              label="Offer product"
              options={variantOptions}
              selectedIds={form.offer_variant_id ? [form.offer_variant_id] : []}
              disabled={isLoadingProducts}
              placeholder="Search offer product..."
              onChange={(ids) => setForm({ ...form, offer_variant_id: ids[0] || "" })}
            />
            <label className={labelClassName}>
              Special price
              <input
                className={inputClassName}
                type="number"
                step="0.01"
                value={form.special_price}
                onChange={(event) => setForm({ ...form, special_price: event.target.value })}
              />
            </label>
            <label className={labelClassName}>
              Priority
              <input
                className={inputClassName}
                type="number"
                value={form.priority}
                onChange={(event) => setForm({ ...form, priority: Number(event.target.value) })}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className={labelClassName}>
              Eyebrow
              <input className={inputClassName} value={form.eyebrow} onChange={(event) => setForm({ ...form, eyebrow: event.target.value })} />
            </label>
            <label className={labelClassName}>
              Title
              <input className={inputClassName} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            </label>
          </div>

          <label className={labelClassName}>
            Description
            <textarea className={inputClassName} rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </label>

          <div className="grid grid-cols-3 gap-4">
            <label className={labelClassName}>
              Price label
              <input className={inputClassName} value={form.price_label} onChange={(event) => setForm({ ...form, price_label: event.target.value })} />
            </label>
            <label className={labelClassName}>
              Accept button
              <input className={inputClassName} value={form.accept_button} onChange={(event) => setForm({ ...form, accept_button: event.target.value })} />
            </label>
            <label className={labelClassName}>
              Skip button
              <input className={inputClassName} value={form.skip_button} onChange={(event) => setForm({ ...form, skip_button: event.target.value })} />
            </label>
          </div>

          <div className="flex gap-2">
            <Button type="button" disabled={isSaving} onClick={saveRule}>
              {isSaving ? "Saving..." : form.id ? "Update rule" : "Save rule"}
            </Button>
            {form.id && (
              <Button type="button" variant="secondary" disabled={isSaving} onClick={() => setForm(emptyRule)}>
                Cancel edit
              </Button>
            )}
          </div>
        </div>
      </Container>

      <Container className="p-0">
        <div className="border-b border-ui-border-base px-6 py-4">
          <h2 className="text-ui-fg-base text-lg font-semibold">Existing rules</h2>
        </div>
        <div className="grid gap-3 px-6 py-4">
          {isLoading && <Text className="text-ui-fg-subtle">Loading rules...</Text>}
          {!isLoading && !rules.length && <Text className="text-ui-fg-subtle">No PPU rules yet.</Text>}
          {rules.map((rule) => (
            <div key={rule.id} className="rounded-lg border border-ui-border-base p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Text className="font-medium text-ui-fg-base">{rule.name}</Text>
                  <Text className="text-ui-fg-subtle">
                    {rule.status} · offer {getVariantLabel(rule.offer_variant_id)} · ${rule.special_price}
                  </Text>
                </div>
                <Button type="button" variant="secondary" size="small" onClick={() => editRule(rule)}>
                  Edit
                </Button>
              </div>
              {!!rule.trigger_variant_ids.length && (
                <Text className="text-ui-fg-subtle">
                  Triggers: {rule.trigger_variant_ids.map(getVariantLabel).join(", ")}
                </Text>
              )}
              <Text className="text-ui-fg-muted">{rule.id}</Text>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Post-purchase upsells",
})

export default PpuSettingsPage
