import type { ProductData, PdpPurchaseOption } from '~/types/content'

export interface PricedPdpPurchaseOption extends PdpPurchaseOption {
  priceSymbol: string
  priceAmount: string
  pricePerUnitLabel: string
  totalDisplay: string
  saveDisplay: string
}

const getCurrencyParts = (amount: number, currencyCode = 'usd') => {
  const parts = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).formatToParts(amount)

  return {
    symbol: parts.find((part) => part.type === 'currency')?.value || '$',
    amount: parts
      .filter((part) => part.type !== 'currency')
      .map((part) => part.value)
      .join('')
      .trim(),
  }
}

const formatCurrency = (amount: number, currencyCode = 'usd') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount)
}

export const getPricedPdpPurchaseOptions = (
  options: PdpPurchaseOption[] | undefined,
  product?: ProductData | null,
): PricedPdpPurchaseOption[] => {
  const variant = product?.commerce?.variants?.[0]
  const variantPrice = variant?.calculated_price
  const currencyCode = variantPrice?.currency_code || 'usd'
  const prices = (variant?.prices || [])
    .filter((price) => price.currency_code === currencyCode && !price.price_list_id)
  const basePrice = prices.find((price) => !price.min_quantity && !price.max_quantity)
  const fallbackAmount = Number(variantPrice?.calculated_amount ?? variantPrice?.original_amount ?? 0)
  const baseUnitAmount = Number(basePrice?.amount ?? variantPrice?.original_amount ?? fallbackAmount)

  const findUnitAmount = (quantity: number) => {
    const tier = prices
      .filter((price) => {
        const amount = Number(price.amount)
        const minQuantity = Number(price.min_quantity || 0)
        const maxQuantity = Number(price.max_quantity || 0)

        return Number.isFinite(amount)
          && quantity >= Math.max(1, minQuantity || 1)
          && (!maxQuantity || quantity <= maxQuantity)
      })
      .sort((a, b) => Number(b.min_quantity || 0) - Number(a.min_quantity || 0))[0]

    return Number(tier?.amount ?? fallbackAmount)
  }

  return (options || [])
    .filter((option) => option.image?.url)
    .map((option) => {
      const quantity = Math.max(1, Number(option.quantity || 1))
      const unitAmount = findUnitAmount(quantity)
      const priceParts = getCurrencyParts(unitAmount, currencyCode)
      const saveAmount = Math.max(0, (baseUnitAmount - unitAmount) * quantity)

      return {
        ...option,
        priceSymbol: priceParts.symbol,
        priceAmount: priceParts.amount,
        pricePerUnitLabel: ' /Per Unit',
        totalDisplay: formatCurrency(unitAmount * quantity, currencyCode),
        saveDisplay: saveAmount > 0 ? formatCurrency(saveAmount, currencyCode) : '',
      }
    })
}
