import type { PdpStampedReviewsSectionData, ProductData } from '~/types/content'

interface StampedWidgetCacheResponse {
  rating?: string | number
  count?: string | number
}

const toNumber = (value: string | number | undefined) => {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : undefined
}

const formatReviewsText = (count?: number) => {
  if (!count) {
    return ''
  }

  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(count)} Reviews`
}

export const useStampedReviewsSummary = (
  getProduct: () => ProductData | null | undefined,
  getFallbackProductName: () => string | undefined = () => undefined,
) => {
  const stampedSection = computed(() => {
    return getProduct()?.sections?.find((section): section is PdpStampedReviewsSectionData => {
      return section.__component === 'pdp.stamped-reviews'
    }) || null
  })

  const productId = computed(() => stampedSection.value?.product_id || '')
  const productName = computed(() => stampedSection.value?.product_name || getFallbackProductName() || getProduct()?.title || '')

  const { data, pending } = useAsyncData(
    () => `stamped-summary-${productId.value || 'missing'}`,
    async () => {
      if (!productId.value) {
        return {} satisfies StampedWidgetCacheResponse
      }

      return $fetch<StampedWidgetCacheResponse>('/api/stamped/widget', {
        query: {
          product_id: productId.value,
          product_name: productName.value,
        },
      })
    },
    {
      watch: [productId, productName],
      default: (): StampedWidgetCacheResponse => ({}),
    },
  )

  const rating = computed(() => toNumber(data.value?.rating))
  const count = computed(() => toNumber(data.value?.count))
  const ratingPercent = computed(() => {
    if (!rating.value) {
      return undefined
    }

    return Math.min(100, Math.max(0, (rating.value / 5) * 100))
  })

  return {
    count,
    pending,
    rating,
    ratingPercent,
    reviewText: computed(() => formatReviewsText(count.value)),
  }
}
