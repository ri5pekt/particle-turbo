# Development Dockerfile for apps/storefront (Nuxt 3)
# Build context: project root (required for pnpm workspace resolution)

FROM node:20-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && pnpm config set store-dir /pnpm/store --global

WORKDIR /workspace

# Copy workspace manifests (cached layer)
COPY package.json pnpm-workspace.yaml .npmrc ./
COPY packages/config-typescript/package.json    packages/config-typescript/
COPY packages/config-eslint/package.json        packages/config-eslint/
COPY packages/config-eslint/index.js            packages/config-eslint/
COPY packages/types-shared/package.json         packages/types-shared/
COPY packages/sdk-commerce/package.json         packages/sdk-commerce/
COPY packages/sdk-content/package.json          packages/sdk-content/
COPY packages/utils/package.json                packages/utils/
COPY apps/storefront/package.json               apps/storefront/

# Install workspace deps for the storefront app and its workspace dependencies
RUN pnpm install --filter @particle-turbo/storefront... --no-frozen-lockfile

WORKDIR /workspace/apps/storefront

EXPOSE 3000

# Bind to 0.0.0.0 so Nuxt is reachable from outside the container
CMD ["pnpm", "exec", "nuxt", "dev", "--host", "0.0.0.0"]
