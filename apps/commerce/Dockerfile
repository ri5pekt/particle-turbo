# Development Dockerfile for apps/commerce (Medusa v2)
# Source is mounted via Docker Compose volume — this image only installs deps.

FROM node:20-alpine

# Enable corepack for pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Install dependencies
# node_modules is a named Docker volume so it persists across source mounts
COPY package.json ./
RUN pnpm install --no-frozen-lockfile

EXPOSE 9000

# Run Medusa dev server
CMD ["pnpm", "dev"]
