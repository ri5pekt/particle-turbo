import { createClient } from 'redis'
import type { H3Event } from 'h3'

type RedisClient = ReturnType<typeof createClient>

interface CacheOptions {
  key: string
  ttlSeconds: number
}

const CACHE_PREFIX = 'particle:storefront:v1'

let redisClientPromise: Promise<RedisClient | null> | undefined

export const cacheKey = (...parts: Array<string | number | boolean | null | undefined>) => {
  return parts
    .filter((part) => part !== undefined && part !== null && part !== '')
    .map((part) => encodeURIComponent(String(part)))
    .join(':')
}

const getRedisClient = async () => {
  if (!redisClientPromise) {
    redisClientPromise = (async () => {
      const config = useRuntimeConfig()
      const redisUrl = config.redisUrl || process.env.NUXT_REDIS_URL

      if (!redisUrl) {
        return null
      }

      try {
        const client = createClient({ url: redisUrl })
        client.on('error', () => {
          // Cache failures should not block storefront rendering.
        })
        await client.connect()

        return client
      } catch (error) {
        console.warn('[cache] Redis unavailable; continuing without cache.', error)
        redisClientPromise = undefined

        return null
      }
    })()
  }

  return redisClientPromise
}

export const cachedResponse = async <T>(
  event: H3Event,
  { key, ttlSeconds }: CacheOptions,
  factory: () => Promise<T>,
) => {
  if (ttlSeconds <= 0) {
    setHeader(event, 'x-particle-cache', 'bypass')
    return factory()
  }

  const client = await getRedisClient()

  if (!client) {
    setHeader(event, 'x-particle-cache', 'bypass')
    return factory()
  }

  const redisKey = `${CACHE_PREFIX}:${key}`

  try {
    const cached = await client.get(redisKey)

    if (cached) {
      setHeader(event, 'x-particle-cache', 'hit')
      return JSON.parse(cached) as T
    }
  } catch (error) {
    console.warn(`[cache] Failed to read ${redisKey}.`, error)
  }

  const value = await factory()
  setHeader(event, 'x-particle-cache', 'miss')

  try {
    await client.setEx(redisKey, ttlSeconds, JSON.stringify(value))
  } catch (error) {
    console.warn(`[cache] Failed to write ${redisKey}.`, error)
  }

  return value
}
