import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Text, toast, Badge } from "@medusajs/ui"
import { useState, type ReactElement } from "react"

type Price = {
  id: string
  amount?: number
  currency_code?: string
  min_quantity?: number | null
  max_quantity?: number | null
  price_list_id?: string | null
}

type VariantData = {
  id: string
  title?: string
  prices?: Price[]
}

const formatAmount = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(amount)

const qtyLabel = (price: Price): string => {
  const min = price.min_quantity
  const max = price.max_quantity
  if (!min && !max) return "1 unit"
  if (min && max) return `${min}–${max} units`
  if (min) return `${min}+ units`
  return `up to ${max} units`
}

const VariantTierPricesWidget = ({ data }: { data: VariantData }): ReactElement => {
  const basePrices = (data.prices ?? []).filter((p) => !p.price_list_id)
  const [prices, setPrices] = useState<Price[]>(basePrices)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState("")
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newQty, setNewQty] = useState("")
  const [newCurrency, setNewCurrency] = useState("usd")
  const [newAmount, setNewAmount] = useState("")
  const [addSaving, setAddSaving] = useState(false)

  const existingCurrencies = [...new Set(prices.map((p) => p.currency_code ?? "usd"))]

  const sorted = [...prices].sort((a, b) => {
    const aMin = a.min_quantity ?? 0
    const bMin = b.min_quantity ?? 0
    return aMin - bMin
  })

  const startEdit = (price: Price) => {
    setEditingId(price.id)
    setEditAmount(String(price.amount ?? ""))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditAmount("")
  }

  const saveEdit = async (price: Price) => {
    const newAmount = parseFloat(editAmount)
    if (isNaN(newAmount) || newAmount < 0) {
      toast.error("Enter a valid amount.")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/admin/variant-prices", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: price.id, amount: newAmount }),
      })

      const payload = await res.json() as { message?: string; newPriceId?: string | null }

      if (!res.ok) {
        toast.error(payload.message ?? "Could not save price.")
        return
      }

      setPrices((prev) =>
        prev.map((p) =>
          p.id === price.id
            ? { ...p, amount: newAmount, id: payload.newPriceId ?? p.id }
            : p
        )
      )
      toast.success("Price updated.")
      cancelEdit()
    } catch {
      toast.error("Could not save price.")
    } finally {
      setSaving(false)
    }
  }

  const deletePrice = async (priceId: string) => {
    setDeletingId(priceId)
    try {
      const res = await fetch("/admin/variant-prices", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      })

      if (!res.ok) {
        const payload = await res.json() as { message?: string }
        toast.error(payload.message ?? "Could not delete price.")
        return
      }

      setPrices((prev) => prev.filter((p) => p.id !== priceId))
      toast.success("Price removed.")
    } catch {
      toast.error("Could not delete price.")
    } finally {
      setDeletingId(null)
    }
  }

  const saveNewTier = async () => {
    const qty = parseInt(newQty, 10)
    const amt = parseFloat(newAmount)
    if (!qty || qty < 2 || isNaN(amt) || amt < 0) {
      toast.error("Enter a valid quantity (2 or more) and amount.")
      return
    }
    if (prices.some((p) => Number(p.min_quantity) === qty && p.currency_code === newCurrency)) {
      toast.error(`A ${newCurrency.toUpperCase()} price for ${qty}+ units already exists.`)
      return
    }

    setAddSaving(true)
    try {
      const res = await fetch("/admin/variant-prices", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: data.id, currencyCode: newCurrency, minQuantity: qty, amount: amt }),
      })
      const payload = await res.json() as { message?: string; newPriceId?: string | null }
      if (!res.ok) {
        toast.error(payload.message ?? "Could not add price.")
        return
      }
      setPrices((prev) => [
        ...prev,
        { id: payload.newPriceId ?? `temp-${qty}`, amount: amt, currency_code: newCurrency, min_quantity: qty },
      ])
      toast.success("Price tier added.")
      setIsAdding(false)
      setNewQty("")
      setNewAmount("")
    } catch {
      toast.error("Could not add price.")
    } finally {
      setAddSaving(false)
    }
  }

  if (!sorted.length && !isAdding) return <></>

  return (
    <Container className="p-0">
      <div className="border-b border-ui-border-base px-6 py-4">
        <Text className="text-ui-fg-base font-semibold text-base">Quantity pricing</Text>
        <Text className="text-ui-fg-subtle text-sm">Prices by purchase quantity. Base price applies to 1 unit.</Text>
      </div>

      <div className="divide-y divide-ui-border-base">
        {sorted.map((price) => {
          const isEditing = editingId === price.id
          const isDeleting = deletingId === price.id

          return (
            <div key={price.id} className="flex items-center gap-3 px-6 py-3">
              <Badge color="grey" className="min-w-[80px] justify-center text-center">
                {qtyLabel(price)}
              </Badge>

              <Text className="w-14 text-ui-fg-subtle uppercase text-xs font-medium">
                {price.currency_code?.toUpperCase()}
              </Text>

              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-28 rounded-md border border-ui-border-base bg-ui-bg-field px-2 py-1 text-ui-fg-base text-sm"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void saveEdit(price)
                    if (e.key === "Escape") cancelEdit()
                  }}
                  autoFocus
                />
              ) : (
                <Text className="flex-1 text-ui-fg-base font-medium">
                  {price.amount != null ? formatAmount(price.amount, price.currency_code ?? "usd") : "—"}
                </Text>
              )}

              <div className="ml-auto flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      disabled={saving}
                      onClick={() => void saveEdit(price)}
                      className="rounded px-2 py-1 text-xs font-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover disabled:opacity-50"
                    >
                      {saving ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="rounded px-2 py-1 text-xs font-medium text-ui-fg-subtle hover:text-ui-fg-base"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(price)}
                      className="rounded px-2 py-1 text-xs font-medium text-ui-fg-subtle hover:text-ui-fg-base"
                    >
                      Edit
                    </button>
                    {(price.min_quantity ?? 0) > 0 && (
                      <button
                        disabled={isDeleting}
                        onClick={() => void deletePrice(price.id)}
                        className="rounded px-2 py-1 text-xs font-medium text-ui-fg-error hover:text-ui-fg-error disabled:opacity-50"
                      >
                        {isDeleting ? "…" : "Remove"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {isAdding ? (
        <div className="flex items-center gap-3 px-6 py-3 border-t border-ui-border-base">
          <input
            type="number"
            min="2"
            step="1"
            placeholder="Min qty"
            className="w-20 rounded-md border border-ui-border-base bg-ui-bg-field px-2 py-1 text-ui-fg-base text-sm"
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            autoFocus
          />
          <select
            className="w-20 rounded-md border border-ui-border-base bg-ui-bg-field px-2 py-1 text-ui-fg-base text-sm"
            value={newCurrency}
            onChange={(e) => setNewCurrency(e.target.value)}
          >
            {existingCurrencies.map((c) => (
              <option key={c} value={c ?? "usd"}>{(c ?? "usd").toUpperCase()}</option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Amount"
            className="w-28 rounded-md border border-ui-border-base bg-ui-bg-field px-2 py-1 text-ui-fg-base text-sm"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void saveNewTier()
              if (e.key === "Escape") setIsAdding(false)
            }}
          />
          <div className="ml-auto flex items-center gap-2">
            <button
              disabled={addSaving}
              onClick={() => void saveNewTier()}
              className="rounded px-2 py-1 text-xs font-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover disabled:opacity-50"
            >
              {addSaving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="rounded px-2 py-1 text-xs font-medium text-ui-fg-subtle hover:text-ui-fg-base"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="px-6 py-3 border-t border-ui-border-base">
          <button
            onClick={() => setIsAdding(true)}
            className="text-xs font-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
          >
            + Add tier
          </button>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product_variant.details.side.before",
})

export default VariantTierPricesWidget
