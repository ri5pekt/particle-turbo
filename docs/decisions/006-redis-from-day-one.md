# ADR 006 — Redis included from day one

**Status:** Accepted

## Decision
Redis is part of the local Docker Compose stack from day one. It is used for infrastructure support and selective caching from the start, but not everything depends on it immediately.

## Initial uses
- Medusa v2 requires Redis for job queues and event bus
- Nuxt server-side cache store (via `unstorage` Redis driver) for selected data fetches
- Session support if needed

## Deferred uses
- Full-page cache invalidation hooks (Phase 4+)
- Rate limiting (if needed)
- Real-time pub/sub (if needed)

## Consequences
- Redis is always running locally — no feature flag needed to enable it
- Do not build Redis-dependent features speculatively; add them when a real need is identified
