type QueryPrimitive = string | number | boolean | null | undefined

interface QueryObject {
  [key: string]: QueryValue
}

type QueryValue = QueryPrimitive | QueryValue[] | QueryObject

interface MedusaRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  query?: Record<string, QueryValue>
  body?: Record<string, unknown>
}

interface MedusaRegionResponse {
  regions?: Array<{ id: string }>
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

export const useMedusaServer = () => {
  const config = useRuntimeConfig()
  const publicUrl = config.public.medusaUrl || 'http://localhost:9000'
  const baseURL = (process.env.NUXT_MEDUSA_INTERNAL_URL || publicUrl)
    .replace('http://localhost:9000', 'http://commerce:9000')
    .replace('http://127.0.0.1:9000', 'http://commerce:9000')
  const publishableKey = config.medusaApiKey

  return <T>(path: string, options: MedusaRequestOptions = {}) => {
    return $fetch<T>(path, {
      baseURL,
      method: options.method || 'GET',
      query: toSearchParams(options.query),
      body: options.body,
      headers: publishableKey
        ? {
            'x-publishable-api-key': publishableKey,
          }
        : undefined,
    })
  }
}

export const getDefaultMedusaRegionId = async () => {
  const medusa = useMedusaServer()
  const response = await medusa<MedusaRegionResponse>('/store/regions')
  const regionId = response.regions?.[0]?.id

  if (!regionId) {
    throw createError({
      statusCode: 502,
      statusMessage: 'No Medusa region is available for cart creation.',
    })
  }

  return regionId
}

