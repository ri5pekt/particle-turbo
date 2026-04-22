# Development Dockerfile for apps/content (Strapi v5)
# Source is mounted via Docker Compose volume — this image only installs deps.

FROM node:20-alpine

# Enable corepack for pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Strapi build requires Python and build tools for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install dependencies
# node_modules is a named Docker volume so it persists across source mounts
COPY package.json ./
RUN pnpm install --no-frozen-lockfile

EXPOSE 1337

# Run Strapi dev server
CMD ["pnpm", "dev"]
