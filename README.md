# MongoCamp Server Management

A designed admin console on top of `@sfxcode/nuxt-ui-mongocamp`: everything the module's playground can do, in a
sidebar shell with its own theme, English and German.

This folder is **unmanaged**: it is listed in `.git/info/exclude`, is not a pnpm workspace member and has no
dependencies of its own. It imports the module from the repository root (`import NuxtUIMongocamp from '../..'`) and
resolves every package from the root `node_modules`.

## Run

From the repository root:

```bash
pnpm run dev:prepare                                         # once, and after module source changes
pnpm exec nuxt dev .work/mongocamp-server-management         # http://localhost:3000
pnpm exec nuxt typecheck .work/mongocamp-server-management
(cd .work/mongocamp-server-management && pnpm exec eslint .)
pnpm exec nuxt build .work/mongocamp-server-management
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

## Where things are

| Path | What |
|---|---|
| `app/assets/css/main.css` | Design tokens: the lake / ember / stone scales, fonts, surfaces, chart colours |
| `app/app.config.ts` | Maps the scales onto Nuxt UI's colours and restyles tables, cards, modals |
| `app/layouts/default.vue`, `collection.vue`, `auth.vue` | Sidebar shell, shell plus collection panel, signed-out screens |
| `app/components/AppPage.vue`, `CollectionPage.vue` | Page frames: breadcrumb, actions, tabs |
| `app/components/ServerStatusRail.vue` | Server name, versions, connections and uptime in the sidebar |
| `app/components/TestDataPanel.vue`, `app/composables/useTestData.ts` | Demo data reset and drop |
| `i18n/locales/` | The console's own strings (`serverManagement.*`); the module brings its own |
| `scripts/shots.mjs` | Screenshots through the installed Chrome: `node scripts/shots.mjs <outDir> [--dark] [--width=390] <route>…` |


