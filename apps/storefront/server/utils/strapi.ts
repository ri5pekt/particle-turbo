type QueryPrimitive = string | number | boolean | null | undefined

interface QueryObject {
  [key: string]: QueryValue
}

type QueryValue = QueryPrimitive | QueryValue[] | QueryObject

interface StrapiRequestOptions {
  query?: Record<string, QueryValue>
}

const toQueryEntries = (
  value: QueryValue,
  key: string,
  entries: Array<[string, string]>,
) => {
  if (value === undefined || value === null) {
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      toQueryEntries(item, `${key}[${index}]`, entries)
    })
    return
  }

  if (typeof value === 'object') {
    Object.entries(value).forEach(([childKey, childValue]) => {
      toQueryEntries(childValue, `${key}[${childKey}]`, entries)
    })
    return
  }

  entries.push([key, String(value)])
}

const toSearchParams = (query?: Record<string, QueryValue>) => {
  if (!query) {
    return undefined
  }

  const entries: Array<[string, string]> = []

  Object.entries(query).forEach(([key, value]) => {
    toQueryEntries(value, key, entries)
  })

  return Object.fromEntries(entries)
}

export const useStrapiServer = () => {
  const config = useRuntimeConfig()
  const publicUrl = config.public.strapiUrl || 'http://localhost:1337'
  const baseURL = (process.env.NUXT_STRAPI_INTERNAL_URL || publicUrl)
    .replace('http://localhost:1337', 'http://content:1337')
    .replace('http://127.0.0.1:1337', 'http://content:1337')
  const token = config.strapiApiToken

  return <T>(path: string, options: StrapiRequestOptions = {}) => {
    return $fetch<T>(path, {
      baseURL,
      query: toSearchParams(options.query),
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    })
  }
}
