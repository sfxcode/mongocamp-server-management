// Server proxy mode has no login, so there is nothing for the route guards to unlock
const useServerProxy = process.env.MONGOCAMP_USE_SERVER_PROXY === 'true'

export default defineNuxtConfig({
  modules: [
    '@sfxcode/nuxt-ui-mongocamp',
    '@nuxt/fonts',
  ],
  ssr: false,
  devtools: { enabled: true },
  app: {
    head: {
      // The mark of AppLogo.vue with fixed colours
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  css: ['~/assets/css/main.css'],
  compatibilityDate: 'latest',
  vite: {
    optimizeDeps: {
      include: [
        '@formkit/addons',
        '@formkit/core',
        '@formkit/i18n',
        '@nuxt/devtools > @vitejs/devtools-kit/client',
        '@nuxt/devtools > @vue/devtools-core',
        '@nuxt/devtools > @vue/devtools-kit',
        '@nuxt/devtools > error-stack-parser-es',
        '@nuxt/devtools > vite-plugin-vue-tracer/client/overlay',
        'tailwindcss/colors',
      ],
    },
  },
  fonts: {
    // The families are declared as --font-sans / --font-mono in main.css
    processCSSVariables: true,
    // Only what the console renders: no italics, and English/German need just the Latin subsets
    defaults: {
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
    },
  },
  // No /de prefix: the /secured/** route guards below match on the plain path
  i18n: {
    strategy: 'no_prefix',
    // The console's own strings (namespace serverManagement); the module registers its own
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'de', name: 'Deutsch', file: 'de.json' },
    ],
  },
  mongocamp: {
    url: process.env.MONGOCAMP_URL,
    // Server proxy mode only; stays on the server
    apiKey: process.env.MONGOCAMP_API_KEY,
    paginationSize: 1000,
    tokenRefreshInterval: 60 * 1000,
    refreshToken: true,
  },
  nuxtUiMongocamp: {
    useGlobalAuthMiddleware: !useServerProxy,
    notAllowedPath: '/',
    managerRoles: ['manager'],
    securedRouteParts: ['/secured/**'],
    adminRouteParts: ['/secured/admin/**'],
    useServerProxy,
  },
})
