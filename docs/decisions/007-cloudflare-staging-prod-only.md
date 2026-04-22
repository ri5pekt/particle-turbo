# ADR 007 — Cloudflare only from staging/production

**Status:** Accepted

## Decision
Cloudflare is not part of the local development environment. It is added only when a staging or production environment is provisioned.

## Reasons
- Local dev does not benefit from edge caching
- Adding Cloudflare locally adds complexity with no return
- The app is designed to be cache-friendly from day one so Cloudflare can be dropped in front without code changes

## Consequences
- Local dev uses Nuxt SWR route rules and Redis for caching — no Cloudflare
- Staging is the first environment with Cloudflare in front
- Cache purge/invalidation hooks are designed with Cloudflare in mind but not wired until staging
