# Development Dockerfile for apps/storefront (Nuxt 3)
# Source is mounted via Docker Compose volume — this image only installs deps.

FROM node:20-alpine

# Enable corepack for pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Install dependencies
# node_modules and .nuxt are named Docker volumes so they persist across source mounts
COPY package.json ./
RUN pnpm install --no-frozen-lockfile

EXPOSE 3000

# Nuxt dev server — bind to 0.0.0.0 so it's accessible from outside the container
CMD ["pnpm", "exec", "nuxt", "dev", "--host", "0.0.0.0"]
