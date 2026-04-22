# Development Dockerfile for apps/commerce (Medusa v2)
# Build context: project root (required for pnpm workspace resolution)

FROM node:20-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && pnpm config set store-dir /pnpm/store --global

WORKDIR /workspace

# Copy workspace manifests (cached layer — only invalidated when manifests change)
COPY package.json pnpm-workspace.yaml ./
COPY packages/config-typescript/package.json    packages/config-typescript/
COPY packages/config-eslint/package.json        packages/config-eslint/
COPY packages/config-eslint/index.js            packages/config-eslint/
COPY packages/types-shared/package.json         packages/types-shared/
COPY packages/sdk-commerce/package.json         packages/sdk-commerce/
COPY packages/sdk-content/package.json          packages/sdk-content/
COPY packages/utils/package.json                packages/utils/
COPY apps/commerce/package.json                 apps/commerce/

# Install workspace deps for the commerce app and its workspace dependencies
RUN pnpm install --filter @particle-turbo/commerce... --no-frozen-lockfile

WORKDIR /workspace/apps/commerce

EXPOSE 9000

CMD ["pnpm", "dev"]
