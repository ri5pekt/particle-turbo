import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Text, toast } from "@medusajs/ui"
import type { ReactElement } from "react"
import { useEffect, useState } from "react"
import { VariantAutocomplete, type VariantOption } from "../../../components/VariantAutocomplete"

type BasRule = {
  id: string
  name: string
  status: "active" | "draft"
  priority: number
  trigger_variant_ids: string[]
  excluded_variant_ids: string[]
  offer_variant_id: string
  special_price: number
  description: string
}

type RulesResponse = {
  rules: BasRule[]
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

const emptyForm = {
  id: "",
  name: "",
  status: "draft" as "active" | "draft",
  priority: 0,
  trigger_variant_ids: [] as string[],
  excluded_variant_ids: [] as string[],
  offer_variant_id: "",
  special_price: "",
  description: "",
}

const inputClass = "w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 text-ui-fg-base"
const labelClass = "grid gap-1 text-ui-fg-subtle"

const buildVariantOptions = (products: AdminProduct[]): VariantOption[] =>
  products.flatMap((p) =>
    (p.variants || []).map((v) => ({
      id: v.id,
      label: [
        p.title,
        v.title && v.title !== "Default variant" ? v.title : "",
        v.sku ? `SKU: ${v.sku}` : "",
      ].filter(Boolean).join(" – "),
    }))
  )

const BasSettingsPage = (): ReactElement => {
  const [rules, setRules] = useState<BasRule[]>([])
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([])
  const [form, setForm] = useState(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadRules = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/admin/bas-rules", { credentials: "include" })
      const data = await res.json() as RulesResponse
      setRules(data.rules || [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load BAS rules.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadProducts = async () => {
    setIsLoadingProducts(true)
    try {
      const res = await fetch("/admin/products?fields=id,title,handle,*variants&limit=200", {
        credentials: "include",
      })
      const data = await res.json() as ProductsResponse
      setVariantOptions(buildVariantOptions(data.products || []))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load product variants.")
    } finally {
      setIsLoadingProducts(false)
    }
  }

  useEffect(() => {
    void loadRules()
    void loadProducts()
  }, [])

  const getVariantLabel = (id: string) =>
    variantOptions.find((o) => o.id === id)?.label || id

  const startEdit = (rule: BasRule) => {
    setForm({
      id: rule.id,
      name: rule.name,
      status: rule.status,
      priority: rule.priority,
      trigger_variant_ids: rule.trigger_variant_ids || [],
      excluded_variant_ids: rule.excluded_variant_ids || [],
      offer_variant_id: rule.offer_variant_id,
      special_price: String(rule.special_price || ""),
      description: rule.description || "",
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const saveRule = async () => {
    if (!form.offer_variant_id) {
      toast.error("Please select an offer product.")
      return
    }
    if (!form.special_price || isNaN(Number(form.special_price))) {
      toast.error("Please enter a valid special price.")
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch("/admin/bas-rules", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id || undefined,
          name: form.name || "Bundle and Save",
          status: form.status,
          priority: Number(form.priority || 0),
          trigger_variant_ids: form.trigger_variant_ids,
          excluded_variant_ids: form.excluded_variant_ids,
          offer_variant_id: form.offer_variant_id,
          special_price: Number(form.special_price),
          description: form.description,
        }),
      })
      const data = await res.json() as { message?: string }
      if (!res.ok) {
        toast.error(data.message || "Could not save BAS rule.")
        return
      }
      toast.success(form.id ? "Rule updated." : "Rule created.")
      setForm(emptyForm)
      await loadRules()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save BAS rule.")
    } finally {
      setIsSaving(false)
    }
  }

  const deleteRule = async (id: string) => {
    if (!confirm("Delete this Bundle and Save rule?")) return
    setDeletingId(id)
    try {
      const res = await fetch("/admin/bas-rules", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const data = await res.json() as { message?: string }
        toast.error(data.message || "Could not delete rule.")
        return
      }
      toast.success("Rule deleted.")
      if (form.id === id) setForm(emptyForm)
      await loadRules()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete rule.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="grid gap-6">
      <Container className="p-0">
        <div className="border-b border-ui-border-base px-6 py-4">
          <h1 className="text-ui-fg-base text-xl font-semibold">
            {form.id ? "Edit Bundle and Save rule" : "Bundle and Save"}
          </h1>
          <Text className="text-ui-fg-subtle">
            {form.id
              ? `Editing rule ${form.id}`
              : "Add products at a special price when specific items are in the cart. Offer is removed if the trigger product is removed."}
          </Text>
        </div>

        <div className="grid gap-4 px-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <label className={labelClass}>
              Rule name
              <input
                className={inputClass}
                placeholder="e.g. Face Cream bundle"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className={labelClass}>
              Status
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "draft" })}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </label>
          </div>

          <label className={labelClass}>
            Description (shown in cart)
            <input
              className={inputClass}
              placeholder="Engineered to combat eyebags, dark spots and wrinkles..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>

          <VariantAutocomplete
            label="Trigger products (cart must contain at least one)"
            helperText="Leave empty to show for all carts. Search by product name, variant, SKU, or ID."
            options={variantOptions}
            selectedIds={form.trigger_variant_ids}
            multiple
            disabled={isLoadingProducts}
            onChange={(trigger_variant_ids) => setForm({ ...form, trigger_variant_ids })}
          />

          <VariantAutocomplete
            label="Excluded products"
            helperText="Skip this offer if the cart already contains these products."
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
            <label className={labelClass}>
              Special price (USD, e.g. 25 = $25.00)
              <input
                className={inputClass}
                type="number"
                min="0"
                step="0.01"
                placeholder="25.00"
                value={form.special_price}
                onChange={(e) => setForm({ ...form, special_price: e.target.value })}
              />
            </label>
            <label className={labelClass}>
              Priority
              <input
                className={inputClass}
                type="number"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
              />
            </label>
          </div>

          <div className="flex gap-2">
            <Button type="button" disabled={isSaving} onClick={saveRule}>
              {isSaving ? "Saving..." : form.id ? "Update rule" : "Create rule"}
            </Button>
            {form.id && (
              <Button
                type="button"
                variant="secondary"
                disabled={isSaving}
                onClick={() => setForm(emptyForm)}
              >
                Cancel
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
          {isLoading && <Text className="text-ui-fg-subtle">Loading…</Text>}
          {!isLoading && !rules.length && (
            <Text className="text-ui-fg-subtle">No Bundle and Save rules yet.</Text>
          )}
          {rules.map((rule) => (
            <div key={rule.id} className="rounded-lg border border-ui-border-base p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Text className="font-semibold text-ui-fg-base">{rule.name}</Text>
                  <Text className="text-ui-fg-subtle">
                    {rule.status} · offer {getVariantLabel(rule.offer_variant_id)} · $
                    {Number(rule.special_price).toFixed(2)} · priority {rule.priority}
                  </Text>
                  {!!rule.description && (
                    <Text className="text-ui-fg-muted text-sm">{rule.description}</Text>
                  )}
                  {!!rule.trigger_variant_ids.length && (
                    <Text className="text-ui-fg-subtle text-sm">
                      Triggers: {rule.trigger_variant_ids.map(getVariantLabel).join(", ")}
                    </Text>
                  )}
                  {!!rule.excluded_variant_ids.length && (
                    <Text className="text-ui-fg-subtle text-sm">
                      Excluded: {rule.excluded_variant_ids.map(getVariantLabel).join(", ")}
                    </Text>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" size="small" onClick={() => startEdit(rule)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="small"
                    disabled={deletingId === rule.id}
                    onClick={() => void deleteRule(rule.id)}
                  >
                    {deletingId === rule.id ? "…" : "Delete"}
                  </Button>
                </div>
              </div>
              <Text className="text-ui-fg-muted text-xs mt-1">{rule.id}</Text>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Bundle and Save",
})

export default BasSettingsPage
