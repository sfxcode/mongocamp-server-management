# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

MongoCamp Server Management: an admin console for a [MongoCamp](https://github.com/MongoCamp) server
(collections, documents, buckets, users, roles, jobs, server info). It is a thin, designed shell around the
published Nuxt module `@sfxcode/nuxt-ui-mongocamp`: the module supplies the feature components, API client,
auth and route guards; this app supplies the layout, theme, navigation additions and English/German strings.

Stack: Nuxt 4 (`app/` directory), SPA only (`ssr: false`), Nuxt UI dashboard components, Tailwind, `@nuxtjs/i18n`,
pnpm. Nuxt UI, i18n and FormKit all arrive through the module; `package.json` lists only the module, `nuxt` and
`@nuxt/fonts` (IBM Plex Sans / IBM Plex Mono, named in `main.css`, loading options in `nuxt.config.ts`).

## Commands

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build
pnpm preview
pnpm lint       # eslint . (lint:fix to apply fixes)
pnpm typecheck  # nuxt typecheck (vue-tsc; TypeScript stays on 6.x, vue-tsc does not run on 7)
```

- Port 3000 is required: the development MongoCamp server only allows that origin (CORS).
- There is no test suite; check changes with `lint`, `typecheck` and screenshots.
- Screenshots for visual checks (dev server running, admin login in `.env`, Chrome installed):
  `pnpm shots <outDir> [--themes=light,dark] [--widths=390,1024,1440] [--no-login] <route>…`, or `--all` for
  every page in the script's `ROUTES` list; `--axe` also lists serious and critical axe-core violations. The dynamic routes there need the demo data set and the
  `adminRole` role. Keep the output outside the repository.

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

- **Login mode** (default): the module's global auth middleware guards `/secured/**`; `/secured/admin/**` needs admin.
  The `manager` role (`managerRoles`) only changes what the dashboard says.
- **Server proxy mode**: no login and no global middleware; the Nitro proxy uses the API key.
  `server/plugins/mongocamp-proxy-guard.ts` hooks `mongocamp-proxy:authorize` to enforce the shared secret.

## Architecture

- `nuxt.config.ts` — module options (`mongocamp`, `nuxtUiMongocamp`), i18n with `strategy: 'no_prefix'` (the route
  guards match on the plain path, so do not add locale prefixes).
- `app/layouts/` — `default.vue` (sidebar shell), `collection.vue` (shell plus the collection panel, a drawer below
  `xl`), `auth.vue` (signed-out screens). Both signed-in layouts wrap `AppShell.vue` (sidebar + command palette);
  the palette's open state lives in `useCommandPalette()`.
- `app/components/AppPage.vue` — frame of every signed-in page: breadcrumb navbar, `#actions`, optional `#toolbar`,
  body at `narrow` / `default` / `full` width. `CollectionPage.vue` wraps it for the collection workspace and adds
  the Data / Overview / Aggregate tabs.
- `app/pages/secured/**` — pages are deliberately thin (about 20 lines): `AppPage` or `CollectionPage` around one
  `Mongocamp*` component, usually with `hide-heading` / `hide-refresh` and a `PageReload` in `#actions`.
- `app/components/AppLogo.vue` — the mark: MongoCamp's tent on its leaf, drawn in the console's contour-line
  style (tent and door in `primary`, leaf in `secondary`). `public/favicon.svg` repeats its paths with fixed
  colours — change both together. `ContourArtwork.vue` (sign-in hero, error page) pitches it on the summit with
  `camp`.
- `app/composables/useNavItems.ts`, `useBreadcrumbs.ts` — the module's navigation and breadcrumbs, with the
  Buckets crumb pointed at the console's buckets list. Managers have no area of their own: the dashboard shows
  them their access and which role makes them a manager (`/secured/manager` only redirects there).
- `app/composables/useTestData.ts`, `app/components/TestDataPanel.vue` — seed and drop the demo data set
  (`public/data/*.json`, collections `test_*`, bucket `test_images`) through the client API.
- `app/composables/useConsoleShortcuts.ts` — every keyboard shortcut in one list; `AppShell` binds it and
  `ShortcutsHelp.vue` (`?`) lists it. Add a shortcut there, never with a separate `defineShortcuts`.
- `app/plugins/focus-main.client.ts` — after navigation, focus moves to `<main id="main">` (or back onto the
  selected workspace tab); `<NuxtRouteAnnouncer>` in `app.vue` reads the new title.
- `app/assets/css/main.css` — design tokens: the `lake` / `ember` / `stone` colour scales, fonts, surfaces, chart
  colours, and text / status colours tuned to 4.5:1 (check with `pnpm shots --axe` after changing them). `app/app.config.ts` maps them onto Nuxt UI (`primary` / `secondary` / `neutral`) and restyles tables,
  cards, modals.
- `i18n/locales/{en,de}.json` — the console's own strings under `serverManagement.*`; the module registers its own.

## Conventions

- **Use the module first.** Do not re-implement what `@sfxcode/nuxt-ui-mongocamp` provides: `useMongocampNavigation()`,
  `useMongocampBreadcrumbs()`, `useMongocampPaths()`, `useMongocampCollectionNames()`, `useMongocampRoles()`,
  `useMongocampProxyMode()`, `useMongocampClientApi()`, `MongocampServerStatus`, `MongocampUserAccess`. Build links
  from `useConsolePaths()` (the module's paths plus `logout`) rather than hard-coding `/secured/...`.
- Every user-visible string goes through `t('serverManagement.…')` and is added to **both** `en.json` and `de.json`.
  Collection and bucket names are not translated.
- Style with the semantic Nuxt UI tokens (`text-muted`, `border-default`, `bg-muted`, `color="primary"`), not raw
  palette classes; global component styling belongs in `app.config.ts`.
- One `h1` per page: `AppPage` renders it when `heading` is set, otherwise the module component brings its own.
- Page frame rule, so every page offers the same things in the same place:
  - `heading` with a `description` on every page outside the collection workspace (there the collection name
    and tabs take that role).
  - Width by content: `full` when the columns depend on the data (documents, files, collections, jobs,
    permission matrix, server overview, admin dashboard); `default` for fixed few-column lists and detail pages
    (users, roles, role grants, databases, server, settings); `narrow` for single forms (account).
  - Reload lives in `#actions` as `PageReload`, with `hide-refresh` on the module component, wherever the
    component exposes `refresh()`.
  - Only the server status page refreshes by itself (`auto-refresh="30"`, live load); everything else reloads
    on demand.
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
fix(i18n): add missing German label for the buckets list
chore(deps): bump @sfxcode/nuxt-ui-mongocamp to 1.5.3
```
