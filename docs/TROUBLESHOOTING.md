# Troubleshooting — Known Issues and Fixes

This file documents every real problem encountered during Phase 0–2 setup of this project.
Each entry includes: what broke, why it broke, and the exact fix applied.
Use this as a first-stop reference before searching the internet.

---

## Table of contents

1. [Vite: `Failed to load module script` (MIME type error)](#1-vite-failed-to-load-module-script-mime-type-error)
2. [Vite: `WebSocket connection refused` on random port](#2-vite-websocket-connection-refused-on-random-port)
3. [Vite: `Failed to fetch dynamically imported module` (404)](#3-vite-failed-to-fetch-dynamically-imported-module-404)
4. [Medusa: `Cannot find module` for custom module at startup](#4-medusa-cannot-find-module-for-custom-module-at-startup)
5. [Medusa: `SyntaxError: Unexpected identifier 'Input'`](#5-medusa-syntaxerror-unexpected-identifier-input)
6. [TypeScript: `Cannot find module '@medusajs/framework/workflows-sdk'`](#6-typescript-cannot-find-module-medusajsframeworkworkflows-sdk)
7. [TypeScript: `Property 'logger' does not exist on type StepExecutionContext`](#7-typescript-property-logger-does-not-exist-on-type-stepexecutioncontext)
8. [TypeScript: Inconsistent `StepResponse` return types in a step](#8-typescript-inconsistent-stepresponse-return-types-in-a-step)
9. [TypeScript: Type mismatch on `req.body.entry` in webhook route](#9-typescript-type-mismatch-on-reqbodyentry-in-webhook-route)
10. [Strapi: 403 Forbidden when Medusa calls Strapi API from inside Docker](#10-strapi-403-forbidden-when-medusa-calls-strapi-api-from-inside-docker)
11. [Docker: `.env` variables not available inside container](#11-docker-env-variables-not-available-inside-container)
12. [pnpm: Packages not resolving in nested monorepo workspace](#12-pnpm-packages-not-resolving-in-nested-monorepo-workspace)

---

## 1. Vite: `Failed to load module script` (MIME type error)

**Symptom**
```
Failed to load module script: Expected a JavaScript-or-Wasm module script but
the server responded with a MIME type of "text/html".
```
Appeared in browser console when opening `http://localhost:9000/app` (Medusa admin).

**Root cause**
pnpm's strict symlinking means packages installed in a nested workspace (`apps/commerce/node_modules`) are not visible to Vite's dev server unless they are hoisted to the root `node_modules`. Vite could not resolve `react/jsx-dev-runtime` and `@medusajs/dashboard/css` — it returned an HTML 404 page instead, which the browser rejected as a non-JS module.

**Fix**
1. Add the problem packages as direct `devDependencies` in `apps/commerce/package.json`:
   ```json
   "react": "^18",
   "react-dom": "^18",
   "@medusajs/dashboard": "..."
   ```
2. Create a root `.npmrc` with hoisting rules:
   ```ini
   public-hoist-pattern[]=@medusajs/*
   public-hoist-pattern[]=react
   public-hoist-pattern[]=react-dom
   public-hoist-pattern[]=react-router-dom
   public-hoist-pattern[]=react-router
   ```
3. Update all `Dockerfile`s to copy `.npmrc` before `pnpm install`:
   ```dockerfile
   COPY .npmrc ./
   ```
4. Rebuild Docker images: `docker compose build --no-cache`

---

## 2. Vite: `WebSocket connection refused` on random port

**Symptom**
```
WebSocket connection to 'ws://localhost:45105/app/?token=...' failed
GET http://localhost:45105/app/ net::ERR_CONNECTION_REFUSED
[vite] server connection lost. Polling for restart...
```
The port number was random on every restart (e.g. `43813`, `45105`, `24678`).

**Root cause (stage 1 — random port)**
Vite's HMR server picks a random available port. The browser tries to connect to that port on the host machine, but the Docker container only exposes port `9000`. The random port is never exposed.

**Fix (stage 1)**
Configure Medusa admin's Vite to use a fixed HMR port in `medusa-config.js`:
```js
admin: {
  vite: () => ({
    server: {
      hmr: {
        port: 24678,
        host: "localhost",
      },
    },
  }),
}
```

**Root cause (stage 2 — fixed port still refused)**
Even with `port: 24678` set, the port was not exposed from the Docker container to the host.

**Fix (stage 2)**
Add the port mapping to `compose.yml` for the `commerce` service:
```yaml
ports:
  - "9000:9000"
  - "24678:24678"   # Vite HMR WebSocket
```
Then recreate the container: `docker compose up --force-recreate commerce`

---

## 3. Vite: `Failed to fetch dynamically imported module` (404)

**Symptom**
```
TypeError: Failed to fetch dynamically imported module:
http://localhost:9000/app/@fs/workspace/apps/commerce/node_modules/.vite/deps/store-detail-RGUJF7T2-ABMPCLOD.js
```

**Root cause**
Vite's dependency cache was built before `.npmrc` hoisting rules were applied. The cached chunk referenced a file path that no longer existed after the rebuild.

**Fix**
Hard-refresh the browser (`Ctrl+Shift+R` / `Cmd+Shift+R`) to bypass the module cache. Vite will rebuild the dependency graph. If that does not work, delete `.vite` inside the container:
```bash
docker compose exec commerce rm -rf /workspace/apps/commerce/node_modules/.vite
```
Then restart the container.

---

## 4. Medusa: `Cannot find module` for custom module at startup

**Symptom**
```
Error: Cannot find module '/workspace/apps/commerce/src/modules/strapi'
```
Appears during `docker compose up` before Medusa's dev server starts.

**Root cause**
Medusa's `defineConfig` is executed by Node.js at process start, before `ts-node` registers its TypeScript hooks. At that point, Node can only `require()` `.js` files. If your custom module only has `index.ts`, the `require()` call fails.

**Fix**
Create a parallel CommonJS `.js` file alongside every `.ts` file that Medusa needs at startup:

`apps/commerce/src/modules/strapi/index.js`:
```js
"use strict"
const StrapiModuleService = require("./service")
const STRAPI_MODULE = "strapiModuleService"
module.exports = {
  Module: { key: STRAPI_MODULE, isQueryable: false },
  STRAPI_MODULE,
}
```

`apps/commerce/src/modules/strapi/service.js`:
```js
"use strict"
class StrapiModuleService { /* ... */ }
module.exports = StrapiModuleService
```

The `.ts` files remain authoritative for types and IDE support. The `.js` files mirror the runtime logic and are what Node actually executes at startup.

---

## 5. Medusa: `SyntaxError: Unexpected identifier 'Input'`

**Symptom**
```
SyntaxError: Unexpected identifier 'Input'
    at wrapSafe (internal/modules/cjs/loader.js:...)
```
Occurs after Medusa boots, when it tries to load a workflow step or subscriber.

**Root cause**
Medusa's internal `dynamicImport` function uses `require()` to load TypeScript source files (`.ts`) at runtime. Without `ts-node` installed, Node.js treats them as plain JS and chokes on TypeScript-only syntax (`type`, `interface`, generics).

**Fix**
Add `ts-node` as a direct `devDependency` in `apps/commerce/package.json`:
```json
"devDependencies": {
  "ts-node": "^10.9.2"
}
```
Then run `pnpm install` (inside the container or with a rebuild). Medusa registers `ts-node` before calling `dynamicImport`, so all `.ts` files load correctly.

---

## 6. TypeScript: `Cannot find module '@medusajs/framework/workflows-sdk'`

**Symptom**
```
error TS2307: Cannot find module '@medusajs/framework/workflows-sdk'
or its corresponding type declarations.
```

**Root cause**
`@medusajs/framework` uses `package.json` `exports` sub-paths to expose sub-entry points like `/workflows-sdk`. This only works with `"moduleResolution": "node16"` (or `"bundler"`). The default `"moduleResolution": "Node"` does not read `exports` fields and cannot resolve sub-path imports.

**Fix**
Update `apps/commerce/tsconfig.json`:
```json
{
  "compilerOptions": {
    "module": "node16",
    "moduleResolution": "node16"
  }
}
```
Both settings must be changed together — `node16` module resolution requires `node16` module mode.

---

## 7. TypeScript: `Property 'logger' does not exist on type StepExecutionContext`

**Symptom**
```
error TS2339: Property 'logger' does not exist on type 'StepExecutionContext'
```
Occurred in a workflow step that tried to use `context.logger`.

**Root cause**
`StepExecutionContext` does not expose `logger` as a direct property. It is available via the DI container.

**Fix**
Resolve `logger` from the container instead:
```typescript
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// inside the step function:
const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
logger.error("something went wrong")
```

---

## 8. TypeScript: Inconsistent `StepResponse` return types in a step

**Symptom**
```
error TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'.
```
Or the compiler complained about different `StepResponse` generic types returned in different code paths.

**Root cause**
A step had two return paths — one inside a `try` block and one in an `else` branch — that returned `new StepResponse(...)` with different generic shapes. TypeScript infers the return type from all paths and fails if they differ.

**Fix**
Define the return type explicitly at the top of the step and use a single consistent `StepResponse<ReturnType, CompensationInput>` shape across all code paths:
```typescript
type StepOutput = { productDocumentId: string }

export const myStep = createStep(
  "my-step",
  async (input, { container }): Promise<StepResponse<StepOutput>> => {
    // always return the same shape
    return new StepResponse({ productDocumentId: "..." })
  }
)
```

---

## 9. TypeScript: Type mismatch on `req.body.entry` in webhook route

**Symptom**
```
error TS2345: Type 'Record<string, any>' is missing the following properties
from type '{ id: string; documentId: string; medusaId: string; }': id, documentId, medusaId
```
Occurred in `apps/commerce/src/api/webhooks/strapi/route.ts`.

**Root cause**
The webhook handler workflow expected a typed `entry` object with specific fields. The route was casting `req.body.entry` as a generic `Record<string, any>` which is incompatible with the explicit type.

**Fix**
Define the exact expected shape in the route file and use it:
```typescript
type StrapiWebhookEntry = {
  id: string
  documentId: string
  medusaId: string
}

const entry = req.body.entry as StrapiWebhookEntry
```
If `ts-node` appears to be using a stale compiled version of the file despite edits, force a container recreation:
```bash
docker compose up --force-recreate commerce
```

---

## 10. Strapi: 403 Forbidden when Medusa calls Strapi API from inside Docker

**Symptom**
```
Error: Strapi API GET /products?filters[medusaId][$eq]=... failed [403]:
{"status":403,"name":"ForbiddenError","message":"Forbidden","details":{}}
```
Occurred when Medusa's sync workflow ran after a product was created/updated.

**Root cause (incorrect assumption)**
First guess was that the API token was wrong or the content type permissions in Strapi were not set. But the token worked fine when called from the host machine with `curl`.

**Root cause (actual)**
The environment variables `STRAPI_API_URL` and `STRAPI_SYNC_TOKEN` were defined in `.env` on the host but were **not listed in the `compose.yml` `environment` block** for the `commerce` service. Docker Compose does not automatically inject every `.env` key into every container — it only injects keys that are explicitly declared in `environment:`.

The `commerce` container was therefore running with both variables unset (`undefined`). The Strapi module fell back to an empty string for the token, which produced an anonymous (unauthenticated) request — hence 403.

**Fix**
Add the missing variables to the `commerce` service in `compose.yml`:
```yaml
services:
  commerce:
    environment:
      STRAPI_API_URL: ${STRAPI_API_URL:-http://content:1337/api}
      STRAPI_SYNC_TOKEN: ${STRAPI_SYNC_TOKEN}
      MEDUSA_STRAPI_WEBHOOK_KEY: ${MEDUSA_STRAPI_WEBHOOK_KEY}
```
Then recreate the container:
```bash
docker compose up --force-recreate commerce
```

**Rule to remember:** Every environment variable your app needs must appear in both `.env` (value) **and** `compose.yml` `environment:` block (declaration). Presence in `.env` alone is not enough.

---

## 11. Docker: `.env` variables not available inside container

*(See also issue #10 — this is the general pattern.)*

**Symptom**
App code reads `process.env.MY_VAR` and gets `undefined` inside the container, even though `MY_VAR` is set in `.env`.

**Root cause**
Docker Compose reads `.env` to perform variable substitution in `compose.yml` (e.g. `${MY_VAR}`), but does not automatically inject all keys into the running container's environment. The container only receives variables that are explicitly listed under `environment:` in `compose.yml`.

**How Docker Compose handles `.env`:**
- `compose.yml` value: `MY_VAR: ${MY_VAR}` → reads from `.env` and injects into container ✅
- `compose.yml` value: absent → variable is NOT in container ❌
- `.env` alone, no `compose.yml` entry → variable is NOT in container ❌

**Fix pattern**
For every app environment variable:
1. Add value to `.env`: `MY_VAR=secret`
2. Add to `.env.example` with empty value and comment: `MY_VAR=`
3. Add to `compose.yml` under the relevant service's `environment:`: `MY_VAR: ${MY_VAR}`

---

## 12. pnpm: Packages not resolving in nested monorepo workspace

**Symptom**
Various `Cannot find module` or `Failed to resolve import` errors where a package is installed but not visible to the tool that needs it (Vite, ts-node, etc.).

**Root cause**
pnpm uses strict symlinking by default. A package installed in `apps/commerce/node_modules` is not automatically visible to tools running in the root workspace, and vice versa. Vite in particular expects packages to be in the same `node_modules` tree it is scanning.

**Fix options**

Option A — Hoist packages to root via `.npmrc` (used in this project):
```ini
# .npmrc at workspace root
public-hoist-pattern[]=@medusajs/*
public-hoist-pattern[]=react
public-hoist-pattern[]=react-dom
public-hoist-pattern[]=react-router-dom
public-hoist-pattern[]=react-router
```
After changing `.npmrc`, always rebuild Docker images (`docker compose build --no-cache`) so `pnpm install` runs again with the new config.

Option B — Add the package as a direct dependency of the app that needs it (`apps/commerce/package.json`), even if it is already a transitive dep.

Option C — Use `shamefully-hoist=true` in `.npmrc` to hoist everything (not recommended — loses the isolation benefits of pnpm, but useful for debugging to confirm the root cause).

**Debugging tip**
To confirm a package is the root cause, exec into the container and check where it resolves:
```bash
docker compose exec commerce node -e "console.log(require.resolve('react'))"
```
If it throws, the package is not visible from that context.

---

*Last updated: 2026-04-22 — Phase 0–2*
