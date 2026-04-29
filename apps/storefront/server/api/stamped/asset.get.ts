interface StampedAssetCacheEntry {
  body: string
  contentType: string
}

const getAssetUrl = (value: unknown) => {
  const rawUrl = Array.isArray(value) ? String(value[0] || '') : String(value || '')
  const normalizedUrl = rawUrl.startsWith('//') ? `https:${rawUrl}` : rawUrl

  try {
    const url = new URL(normalizedUrl)

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return null
    }

    if (url.hostname !== 'stamped.io' && !url.hostname.endsWith('.stamped.io')) {
      return null
    }

    return url
  } catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = getAssetUrl(query.url)
  const ttlSeconds = getStampedAssetCacheTtl()

  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A valid Stamped asset URL is required.',
    })
  }

  const asset = await cachedResponse(event, {
    key: cacheKey('stamped-asset', url.toString()),
    ttlSeconds,
  }, async (): Promise<StampedAssetCacheEntry> => {
    const response = await fetch(url, {
      headers: {
        accept: '*/*',
      },
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `Stamped asset request failed: ${response.statusText}`,
      })
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const buffer = Buffer.from(await response.arrayBuffer())
    const body = contentType.includes('text/css')
      ? Buffer.from(rewriteStampedAssetUrls(buffer.toString('utf8')), 'utf8').toString('base64')
      : buffer.toString('base64')

    return {
      body,
      contentType,
    }
  })

  setHeader(event, 'content-type', asset.contentType)
  setHeader(event, 'cache-control', `public, max-age=${ttlSeconds}, immutable`)

  return Buffer.from(asset.body, 'base64')
})
