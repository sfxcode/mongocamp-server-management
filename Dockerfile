# syntax=docker/dockerfile:1

# MongoCamp Server Management as a container: the Nuxt build is a self-contained Node server
# (static SPA files plus the API key proxy), so the final image holds only `.output`.
#
#   docker build -t mongocamp-server-management .
#   docker run -p 3000:3000 -e NUXT_PUBLIC_MONGOCAMP_URL=https://mongocamp.example.com mongocamp-server-management
#
# API key mode (no login, requests go through /api/_mongocamp) is decided when the app is built,
# because it switches the route guards:
#
#   docker build --build-arg MONGOCAMP_USE_SERVER_PROXY=true -t mongocamp-server-management:proxy .
#   docker run -p 3000:3000 \
#     -e NUXT_PUBLIC_MONGOCAMP_URL=https://mongocamp.example.com \
#     -e NUXT_MONGOCAMP_API_KEY=... -e MONGOCAMP_PROXY_SHARED_SECRET=... mongocamp-server-management:proxy

ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-alpine AS build
RUN npm install --global pnpm@12.15.0
WORKDIR /app

# Dependencies first, so a source change does not reinstall them
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

# Read by nuxt.config.ts while building. The URL is only a default: the container takes its own through
# NUXT_PUBLIC_MONGOCAMP_URL. No API key here, it must never end up in an image layer.
ARG MONGOCAMP_URL=http://localhost:8080
ARG MONGOCAMP_USE_SERVER_PROXY=false
ENV MONGOCAMP_URL=${MONGOCAMP_URL} \
    MONGOCAMP_USE_SERVER_PROXY=${MONGOCAMP_USE_SERVER_PROXY}
RUN pnpm build

FROM node:${NODE_VERSION}-alpine AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000
WORKDIR /app
COPY --from=build --chown=node:node /app/.output ./.output

USER node
EXPOSE 3000

# Nuxt answers on / as soon as the server is up
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:${PORT}/ || exit 1

CMD ["node", ".output/server/index.mjs"]
