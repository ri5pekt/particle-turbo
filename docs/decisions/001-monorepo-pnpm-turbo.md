# ADR 001 — Monorepo with pnpm workspaces and Turborepo

**Status:** Accepted

## Decision
Use a single pnpm workspace monorepo with Turborepo for task orchestration across all apps and shared packages.

## Reasons
- Single repo eliminates cross-repo coordination overhead for a tightly coupled system
- pnpm workspaces provide efficient dependency hoisting and deduplication
- Turborepo handles parallel task execution and build caching across the workspace
- Shared packages (`sdk-commerce`, `sdk-content`, `types-shared`) are first-class workspace members

## Consequences
- All engineers work in one repository
- `turbo dev` / `turbo build` coordinate all apps in dependency order
- New apps go under `apps/`, new shared libraries under `packages/`
