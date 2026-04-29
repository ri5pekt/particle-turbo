const STAMPED_ASSET_TTL_SECONDS = 604800

const getStampedAssetProxyUrl = (rawUrl: string) => {
  const normalizedUrl = rawUrl.startsWith('//') ? `https:${rawUrl}` : rawUrl

  try {
    const url = new URL(normalizedUrl)

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return rawUrl
    }

    if (url.hostname !== 'stamped.io' && !url.hostname.endsWith('.stamped.io')) {
      return rawUrl
    }

    return `/api/stamped/asset?url=${encodeURIComponent(url.toString())}`
  } catch {
    return rawUrl
  }
}

export const getStampedAssetCacheTtl = () => STAMPED_ASSET_TTL_SECONDS

export const rewriteStampedAssetUrls = (content: string) => {
  return content.replace(
    /(["'(])(https?:\/\/(?:[^"'()]*\.)?stamped\.io\/[^"'()]+|\/\/(?:[^"'()]*\.)?stamped\.io\/[^"'()]+)(["')])/g,
    (match, before: string, url: string, after: string) => {
      return `${before}${getStampedAssetProxyUrl(url)}${after}`
    },
  )
}
