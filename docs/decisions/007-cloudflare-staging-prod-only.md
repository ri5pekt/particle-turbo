# ADR 007 — Cloudflare edge cache from staging/production

**Status:** Accepted

## Decision
Cloudflare edge caching is not part of the local development environment. It is added only when a staging or production environment is provisioned.

Cloudflare R2 Object Storage is the exception: media files are stored externally in R2 for local development, staging, and production.

## Reasons
- Local dev does not benefit from edge caching
- Adding Cloudflare edge caching locally adds complexity with no return
- The app is designed to be cache-friendly from day one so Cloudflare can be dropped in front without code changes
- External object storage avoids copying upload folders between machines and keeps media behavior closer to production

## Consequences
- Local dev uses Nuxt SWR route rules and Redis for caching — no Cloudflare edge cache
- Strapi uploads and migrated product images resolve through Cloudflare R2 public URLs
- Staging is the first environment with Cloudflare in front
- Cache purge/invalidation hooks are designed with Cloudflare in mind but not wired until staging
