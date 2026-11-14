# MongoCamp Server Management

A designed admin console on top of `@sfxcode/nuxt-ui-mongocamp`: everything the module's playground can do, in a
sidebar shell with its own theme, English and German.

It is a normal consumer of the published package (`@sfxcode/nuxt-ui-mongocamp` from npm, listed in `modules`), with
its own dependencies.

## Run

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build
```

The app uses port 3000, the same as the playground: the development MongoCamp server only allows that origin (CORS),
so run one of the two at a time.

## Configuration

Copy `.env.example` to `.env`.

| Variable | Purpose |
|---|---|
| `MONGOCAMP_URL` | The MongoCamp server |
| `MONGOCAMP_ADMIN_USER`, `MONGOCAMP_ADMIN_PASSWORD` | Only used by `scripts/shots.mjs` to sign in |
| `MONGOCAMP_USE_SERVER_PROXY` | `true` = API key mode: no login, requests go through `/api/_mongocamp` |
| `MONGOCAMP_API_KEY` | The key for API key mode; stays on the server |
| `MONGOCAMP_PROXY_SHARED_SECRET` | If set, callers of the proxy must send it as `x-mongocamp-proxy-secret` |

## Docker

The build is a self-contained Node server (the single-page app plus the API key proxy), so the image holds only
`.output` and runs as the unprivileged `node` user on port 3000.

```bash
docker build -t mongocamp-server-management .
docker run -p 3000:3000 -e NUXT_PUBLIC_MONGOCAMP_URL=https://mongocamp.example.com mongocamp-server-management
```

In login mode the browser calls the MongoCamp server directly, so `NUXT_PUBLIC_MONGOCAMP_URL` has to be an address the
browser can reach, and that server has to allow the console's origin (CORS).

| Where | Variable | Purpose |
|---|---|---|
| build argument | `MONGOCAMP_USE_SERVER_PROXY` | `true` builds API key mode (no login, no route guards). Decided when building, because it switches the guards |
| build argument | `MONGOCAMP_URL` | Default server URL baked into the build (`http://localhost:8080`) |
| container | `NUXT_PUBLIC_MONGOCAMP_URL` | The MongoCamp server, set when the container starts |
| container | `NUXT_MONGOCAMP_API_KEY` | The key for API key mode; there is deliberately no build argument for it, so it never ends up in an image layer |
| container | `MONGOCAMP_PROXY_SHARED_SECRET` | If set, callers of the proxy must send it as `x-mongocamp-proxy-secret` |

```bash
docker build --build-arg MONGOCAMP_USE_SERVER_PROXY=true -t mongocamp-server-management:proxy .
docker run -p 3000:3000 \
  -e NUXT_PUBLIC_MONGOCAMP_URL=https://mongocamp.example.com \
  -e NUXT_MONGOCAMP_API_KEY=... -e MONGOCAMP_PROXY_SHARED_SECRET=... \
  mongocamp-server-management:proxy
```

### Published images

`.github/workflows/docker.yml` builds both variants (linux/amd64 and arm64) and pushes them to the GitHub container
registry: from `main` (`edge`) and from version tags (`v1.2.3` gives `1.2.3`, `1.2` and `latest`). The API key variant
repeats every tag with `-proxy`. A pull request only builds the image, it pushes nothing.

```bash
docker run -p 3000:3000 -e NUXT_PUBLIC_MONGOCAMP_URL=https://mongocamp.example.com ghcr.io/sfxcode/mongocamp-server-management:latest
docker run -p 3000:3000 -e NUXT_PUBLIC_MONGOCAMP_URL=... -e NUXT_MONGOCAMP_API_KEY=... ghcr.io/sfxcode/mongocamp-server-management:latest-proxy
```

A package is private after its first push; make it public once under the repository's Packages settings.

`.env` is not copied into the image (`.dockerignore`). The container has a health check on `/`. The fonts are fetched
while building, so the build needs network access.

## Where things are

| Path | What |
|---|---|
| `app/assets/css/main.css` | Design tokens: the lake / ember / stone scales, fonts, surfaces, chart colours |
| `app/app.config.ts` | Maps the scales onto Nuxt UI's colours and restyles tables, cards, modals |
| `app/layouts/default.vue`, `collection.vue`, `auth.vue` | Sidebar shell, shell plus collection panel, signed-out screens |
| `app/components/AppPage.vue`, `CollectionPage.vue` | Page frames: breadcrumb, actions, tabs |
| `app/components/AppSidebar.vue`, `CollectionPanel.vue` | Sidebar (menu, search, `MongocampServerStatus`, user menu) and the collection list |
| `app/composables/useNavItems.ts`, `useBreadcrumbs.ts` | The module's navigation and breadcrumb data, with the Buckets crumb pointed at the console's buckets list |
| `public/data/` | The demo data set the test data panel loads |
| `app/components/TestDataPanel.vue`, `app/composables/useTestData.ts` | Demo data reset and drop |
| `i18n/locales/` | The console's own strings (`serverManagement.*`); the module brings its own |
| `scripts/shots.mjs` | Screenshots through the installed Chrome: `node scripts/shots.mjs <outDir> [--dark] [--width=390] <route>…` |

## What comes from the module

Since `@sfxcode/nuxt-ui-mongocamp` 1.5.3 the console no longer carries its own copies of these:

| Need | From the module |
|---|---|
| Sidebar menu, breadcrumb | `useMongocampNavigation()`, `useMongocampBreadcrumbs()` |
| Links to the pages | `useMongocampPaths()` (module option `paths`; this app keeps the default `/secured/...` routes) |
| Collection list shared by the panel | `useMongocampCollectionNames()` — the collections table keeps it current |
| Roles for what to show, API key mode | `useMongocampRoles()` (`canSeeAdmin`, `canSeeManagement`), `useMongocampProxyMode()` |
| Server status in the sidebar | `MongocampServerStatus` |
| "Your access" for users who are not administrators | `MongocampUserAccess` |
