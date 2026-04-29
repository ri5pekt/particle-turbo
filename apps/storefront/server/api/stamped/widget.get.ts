interface StampedWidgetResponse {
  product?: string
  widget?: string
  rating?: string | number
  count?: string | number
}

const getStringQuery = (value: unknown) => {
  return Array.isArray(value) ? String(value[0] || '') : String(value || '')
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const productId = getStringQuery(query.product_id)
  const productName = getStringQuery(query.product_name)

  if (!productId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Stamped product_id is required.',
    })
  }

  const config = useRuntimeConfig()
  const apiKey = config.stampedPublicKey
  const storeUrl = config.stampedStoreUrl || 'www.particleformen.com'
  const storeHash = config.stampedStoreHash || ''
  const ttlSeconds = Math.max(60, Number(config.stampedWidgetCacheTtl || 86400))

  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Stamped public key is not configured.',
    })
  }

  return cachedResponse(event, {
    key: cacheKey('stamped-widget', productId, productName || 'product', storeHash || 'legacy'),
    ttlSeconds,
  }, async () => {
    const params = new URLSearchParams({
      productId,
      apiKey,
      storeUrl,
    })

    if (productName) {
      params.set('productName', productName)
    }

    if (storeHash) {
      params.set('sId', storeHash)
    }

    const response = await $fetch<StampedWidgetResponse>(`https://stamped.io/api/widget?${params.toString()}`, {
      retry: 0,
      timeout: 8000,
    })

    const widgetHtml = response.widget || ''
    const productHtml = response.product || ''
    const html = productHtml
      ? productHtml.replace('<div class="stamped-content"> </div>', `<div class="stamped-content">${widgetHtml}</div>`)
      : widgetHtml

    return {
      html: rewriteStampedAssetUrls(html),
      rating: response.rating,
      count: response.count,
    }
  })
})
