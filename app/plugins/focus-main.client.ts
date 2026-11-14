/**
 * After a client-side navigation, keyboard and screen-reader users land in the new page's content instead of
 * staying on the sidebar link they used (the title itself is announced by `<NuxtRouteAnnouncer>` in app.vue).
 * A tab that navigated (the collection workspace tabs re-render with the page) gets focus back on the newly
 * selected tab; focus still inside the content stays where it is; the first load and query-only changes
 * (filters, pagination) leave focus alone.
 */
export default defineNuxtPlugin((nuxtApp) => {
  let lastPath = ''
  let fromTab = false

  // Before the old page unmounts: by `page:start` the tab is already gone and focus is on <body>
  nuxtApp.$router.beforeEach(() => {
    fromTab = document.activeElement?.getAttribute('role') === 'tab'
  })

  nuxtApp.hook('page:finish', () => {
    const path = nuxtApp.$router.currentRoute.value.path
    const firstLoad = lastPath === ''
    const samePage = path === lastPath
    lastPath = path
    if (firstLoad || samePage) return

    const main = document.getElementById('main')
    if (!main) return
    const selectedTab = fromTab ? main.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]') : null
    if (selectedTab) {
      selectedTab.focus({ preventScroll: true })
      return
    }
    const active = document.activeElement
    if (active && active !== document.body && active.isConnected && main.contains(active)) return
    main.focus({ preventScroll: true })
  })
})
