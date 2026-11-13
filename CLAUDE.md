# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

MongoCamp Server Management: an admin console for a [MongoCamp](https://github.com/MongoCamp) server
(collections, documents, buckets, users, roles, jobs, server info). It is a thin, designed shell around the
published Nuxt module `@sfxcode/nuxt-ui-mongocamp`: the module supplies the feature components, API client,
auth and route guards; this app supplies the layout, theme, navigation additions and English/German strings.

Stack: Nuxt 4 (`app/` directory), SPA only (`ssr: false`), Nuxt UI dashboard components, Tailwind, `@nuxtjs/i18n`,
pnpm. Nuxt UI, i18n, fonts and FormKit all arrive through the module; `package.json` lists only the module and `nuxt`.

## Commands

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build
pnpm preview
```

- Port 3000 is required: the development MongoCamp server only allows that origin (CORS).
- There is no test suite and no `lint` or `typecheck` script. `eslint.config.mjs` and `scripts/shots.mjs` need
  `eslint` + `@nuxt/eslint-config` and `playwright-core`, which are not in `package.json`; install them before
  relying on either.
- Screenshots for visual checks (dev server running, admin login in `.env`):
  `node scripts/shots.mjs <outDir> [--dark] [--width=390] [--no-login] <route>…`

## Configuration

Copy `.env.example` to `.env`. Never commit `.env`.

| Variable | Purpose |
|---|---|
| `MONGOCAMP_URL` | The MongoCamp server |
| `MONGOCAMP_ADMIN_USER`, `MONGOCAMP_ADMIN_PASSWORD` | Only for `scripts/shots.mjs` |
| `MONGOCAMP_USE_SERVER_PROXY` | `true` = API key mode: no login, requests go through `/api/_mongocamp` |
| `MONGOCAMP_API_KEY` | Key for API key mode; server-side only |
| `MONGOCAMP_PROXY_SHARED_SECRET` | If set, proxy callers must send it as `x-mongocamp-proxy-secret` |

Two auth modes, switched in `nuxt.config.ts`:

- **Login mode** (default): the module's global auth middleware guards `/secured/**`; `/secured/manager/**` needs the
  `manager` role, `/secured/admin/**` needs admin.
- **Server proxy mode**: no login and no global middleware; the Nitro proxy uses the API key.
  `server/plugins/mongocamp-proxy-guard.ts` hooks `mongocamp-proxy:authorize` to enforce the shared secret.

## Architecture

- `nuxt.config.ts` — module options (`mongocamp`, `nuxtUiMongocamp`), i18n with `strategy: 'no_prefix'` (the route
  guards match on the plain path, so do not add locale prefixes).
- `app/layouts/` — `default.vue` (sidebar shell), `collection.vue` (shell plus the collection panel, a drawer below
  `xl`), `auth.vue` (signed-out screens).
- `app/components/AppPage.vue` — frame of every signed-in page: breadcrumb navbar, `#actions`, optional `#toolbar`,
  body at `narrow` / `default` / `full` width. `CollectionPage.vue` wraps it for the collection workspace and adds
  the Data / Overview / Aggregate tabs.
- `app/pages/secured/**` — pages are deliberately thin (about 20 lines): `AppPage` or `CollectionPage` around one
  `Mongocamp*` component, usually with `hide-heading` / `hide-refresh` and a `PageReload` in `#actions`.
- `app/composables/useNavItems.ts`, `useBreadcrumbs.ts` — the module's navigation and breadcrumbs plus the console's
  manager area.
- `app/composables/useTestData.ts`, `app/components/TestDataPanel.vue` — seed and drop the demo data set
  (`public/data/*.json`, collections `test_*`, bucket `test_images`) through the client API.
- `app/assets/css/main.css` — design tokens: the `lake` / `ember` / `stone` colour scales, fonts, surfaces, chart
  colours. `app/app.config.ts` maps them onto Nuxt UI (`primary` / `secondary` / `neutral`) and restyles tables,
  cards, modals.
- `i18n/locales/{en,de}.json` — the console's own strings under `serverManagement.*`; the module registers its own.

## Conventions

- **Use the module first.** Do not re-implement what `@sfxcode/nuxt-ui-mongocamp` provides: `useMongocampNavigation()`,
  `useMongocampBreadcrumbs()`, `useMongocampPaths()`, `useMongocampCollectionNames()`, `useMongocampRoles()`,
  `useMongocampProxyMode()`, `useMongocampClientApi()`, `MongocampServerStatus`, `MongocampUserAccess`. Build links
  from `useMongocampPaths()` rather than hard-coding `/secured/...`.
- Every user-visible string goes through `t('serverManagement.…')` and is added to **both** `en.json` and `de.json`.
  Collection and bucket names are not translated.
- Style with the semantic Nuxt UI tokens (`text-muted`, `border-default`, `bg-muted`, `color="primary"`), not raw
  palette classes; global component styling belongs in `app.config.ts`.
- One `h1` per page: `AppPage` renders it when `heading` is set, otherwise the module component brings its own.
- Icons are Lucide (`i-lucide-*`).
- Code style follows `@nuxt/eslint-config` with stylistic rules: 2 spaces, single quotes, no semicolons.
  `<script setup lang="ts">` first, then `<template>`. Comments explain why, not what.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<optional scope>): <description>`

- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Description in the imperative, lower case, no trailing period, at most about 72 characters.
- Optional scope names the area, e.g. `collections`, `sidebar`, `i18n`, `theme`, `proxy`, `deps`.
- Breaking changes: `!` after the type/scope and a `BREAKING CHANGE:` footer.
- One logical change per commit; explain the why in the body when it is not obvious.

```
feat(collections): add aggregate tab to the collection workspace
fix(i18n): add missing German label for the manager area
chore(deps): bump @sfxcode/nuxt-ui-mongocamp to 1.5.3
```
