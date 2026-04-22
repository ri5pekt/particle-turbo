# Onboarding — setting up on a new machine

Follow these steps in order. Do not skip steps.

---

## Prerequisites

Install these on the new machine before anything else:

| Tool | Version | Install |
|---|---|---|
| Git | any | https://git-scm.com |
| Docker Desktop | latest | https://www.docker.com/products/docker-desktop |
| Node.js | 20 LTS | https://nodejs.org |
| pnpm | 9.x | `npm install -g pnpm@9` |

Make sure Docker Desktop is **running** before proceeding.

---

## Step 1 — Clone the repo

```powershell
git clone https://github.com/ri5pekt/particle-turbo.git
cd particle-turbo
```

---

## Step 2 — Create your `.env` file

```powershell
Copy-Item .env.example .env
```

Then open `.env` and fill in all the values. Get these from the person who set up the project (or from the shared secrets store — do not commit `.env` to git).

Key values you need:
- All `POSTGRES_*` credentials
- All `MEDUSA_*` secrets
- All `STRAPI_*` secrets and app keys
- `STRAPI_SYNC_TOKEN` and `MEDUSA_STRAPI_WEBHOOK_KEY`
- `NUXT_MEDUSA_API_KEY` and `NUXT_STRAPI_API_TOKEN`

---

## Step 3 — Start infrastructure

```powershell
docker compose up -d
```

This starts Postgres (×2) and Redis. Wait until all three containers are healthy:

```powershell
docker compose ps
```

All should show `healthy` in the Status column.

---

## Step 4 — Restore databases (if you have a backup)

Copy the `backups/` folder from the source machine to this machine's project root, then run:

```powershell
# List available backup tags
Get-ChildItem backups/ -Filter "*.sql"

# Restore using the tag shown (e.g. 2026-04-22_14-30)
.\scripts\db-import.ps1 -Tag 2026-04-22_14-30
```

This restores both the Medusa and Strapi databases, and copies the media uploads back into the Strapi container.

**If you have no backup** (fresh start): skip this step. The apps will run migrations on first boot.

---

## Step 5 — Start app services

```powershell
docker compose --profile apps up -d
```

This builds and starts:
- `commerce` — Medusa v2 at http://localhost:9000
- `content` — Strapi v5 at http://localhost:1337
- `storefront` — Nuxt 3 at http://localhost:3000

First boot takes 2–5 minutes (building Docker images + installing pnpm packages). Watch progress:

```powershell
docker compose logs -f
```

Wait until you see:
- `Strapi started successfully` in the `content` container logs
- `Medusa ready` (or similar) in the `commerce` container logs

---

## Step 6 — Verify admin panels

| Panel | URL | Credentials |
|---|---|---|
| Medusa admin | http://localhost:9000/app | `denis@particleformen.com` / from `.env` `MEDUSA_ADMIN_PASSWORD` |
| Strapi admin | http://localhost:1337/admin | `denis@particleformen.com` / from `.env` `STRAPI_ADMIN_INITIAL_PASSWORD` |
| Storefront | http://localhost:3000 | — |

---

## Step 7 — Set Strapi public permissions (fresh install only)

If you restored a database dump, permissions are already set — skip this.

If this is a fresh install:
1. Go to Strapi admin → Settings → Users & Permissions plugin → Roles → Public
2. Grant `find` + `findOne` on: Article, Article Category, Landing Page, Navigation, Page, Product Page Content
3. Grant `find` on: Site Settings
4. Click Save

---

## Exporting data from the current machine

Before switching machines, run this on the **source machine**:

```powershell
.\scripts\db-export.ps1
```

This creates timestamped `.sql` dumps and a copy of the media uploads in `backups/`. Copy the entire `backups/` folder to the new machine before running Step 4 above.

For a quick **media-only** sync (no DB):

```powershell
# On source machine
.\scripts\media-sync.ps1 -Direction export

# On new machine (after copying backups/strapi-uploads-latest/)
.\scripts\media-sync.ps1 -Direction import
```

---

## Common issues

| Problem | Fix |
|---|---|
| Docker containers not starting | Make sure Docker Desktop is running first |
| `pg_isready` health check failing | Wait 30s and run `docker compose ps` again |
| Strapi crashes on boot | Run `docker compose logs content` — usually a missing env var |
| `Cannot find module` errors in Medusa | Run `docker compose build --no-cache commerce` then restart |
| Vite HMR WebSocket errors in Medusa admin | Expected in Docker — harmless. See `docs/TROUBLESHOOTING.md` |
| 403 on Strapi API calls from Nuxt | Public permissions not set — see Step 7 |

For deeper debugging see `docs/TROUBLESHOOTING.md`.

---

## Useful commands

```powershell
# Start everything
docker compose --profile apps up -d

# Stop everything
docker compose --profile apps down

# View logs for one service
docker compose logs -f content
docker compose logs -f commerce
docker compose logs -f storefront

# Restart one service
docker compose restart content

# Shell into a container
docker compose exec content sh
docker compose exec commerce sh

# Export DB before switching machines
.\scripts\db-export.ps1

# Import DB on new machine
.\scripts\db-import.ps1 -Tag <timestamp>

# Force rebuild (after Dockerfile or .npmrc changes)
docker compose build --no-cache
docker compose --profile apps up -d
```
