# Development Dockerfile for apps/content (Strapi v5)
# Build context: project root (required for pnpm workspace resolution)

FROM node:20-alpine

# Strapi requires native build tools for some dependencies
RUN apk add --no-cache python3 make g++

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && pnpm config set store-dir /pnpm/store --global

WORKDIR /workspace

# Copy workspace manifests (cached layer)
COPY package.json pnpm-workspace.yaml ./
COPY packages/config-typescript/package.json    packages/config-typescript/
COPY packages/config-eslint/package.json        packages/config-eslint/
COPY packages/config-eslint/index.js            packages/config-eslint/
COPY packages/types-shared/package.json         packages/types-shared/
COPY packages/sdk-commerce/package.json         packages/sdk-commerce/
COPY packages/sdk-content/package.json          packages/sdk-content/
COPY packages/utils/package.json                packages/utils/
COPY apps/content/package.json                  apps/content/

# Install workspace deps for the content app
RUN pnpm install --filter @particle-turbo/content... --no-frozen-lockfile

WORKDIR /workspace/apps/content

EXPOSE 1337

CMD ["pnpm", "dev"]
