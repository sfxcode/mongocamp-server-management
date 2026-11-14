export interface ConsoleShortcut {
  /** Key as `defineShortcuts` takes it: `r`, `/`, `?`, or a chain like `g-h` */
  keys: string
  /** Translation key below `serverManagement.shortcuts` */
  labelKey: string
  group: 'general' | 'navigation' | 'collection'
  run: () => unknown
}

/**
 * The console's keyboard shortcuts: one list that both registers them (in AppShell) and fills the help dialog, so
 * the two cannot drift apart. ⌘K stays with the module's command palette. `defineShortcuts` ignores keys typed
 * into inputs, so none of these fire in the filter, the query bar or a form.
 */
export function useConsoleShortcuts() {
  const route = useRoute()
  const paths = useMongocampPaths()
  const { canSeeAdmin } = useMongocampRoles()
  const { show: openPalette } = useCommandPalette()
  const { available: canReload, reload } = usePageReload()
  const helpOpen = useState('shortcuts-help-open', () => false)
  const drawerOpen = useState('collection-drawer-open', () => false)

  async function focusFilter() {
    const visible = () => {
      const input = document.getElementById('collection-panel-filter')
      return input?.offsetParent ? input : null
    }
    if (visible()) return visible()!.focus()
    // Below xl the panel lives in the drawer; elsewhere there is no panel, so search instead
    if (route.meta.layout === 'collection') {
      drawerOpen.value = true
      await nextTick()
      setTimeout(() => visible()?.focus(), 150)
      return
    }
    openPalette()
  }

  const collection = computed(() => {
    const name = route.params.collection_name
    return typeof name === 'string' && name ? `${paths.collections}/${encodeURIComponent(name)}` : undefined
  })

  return computed<ConsoleShortcut[]>(() => {
    const list: ConsoleShortcut[] = [
      { keys: '?', labelKey: 'help', group: 'general', run: () => (helpOpen.value = true) },
      { keys: '/', labelKey: 'filter', group: 'general', run: focusFilter },
      ...(canReload.value ? [{ keys: 'r', labelKey: 'reload', group: 'general' as const, run: reload }] : []),
      { keys: 'g-h', labelKey: 'home', group: 'navigation', run: () => navigateTo(paths.home) },
    ]
    if (canSeeAdmin.value) {
      list.push(
        { keys: 'g-c', labelKey: 'collections', group: 'navigation', run: () => navigateTo(paths.collections) },
        { keys: 'g-b', labelKey: 'buckets', group: 'navigation', run: () => navigateTo(paths.buckets) },
        { keys: 'g-u', labelKey: 'users', group: 'navigation', run: () => navigateTo(paths.users) },
        { keys: 'g-s', labelKey: 'server', group: 'navigation', run: () => navigateTo(paths.server) },
      )
    }
    const base = collection.value
    if (base) {
      list.push(
        { keys: 'g-d', labelKey: 'data', group: 'collection', run: () => navigateTo(`${base}/data`) },
        { keys: 'g-o', labelKey: 'overview', group: 'collection', run: () => navigateTo(base) },
        { keys: 'g-a', labelKey: 'aggregate', group: 'collection', run: () => navigateTo(`${base}/aggregate`) },
      )
    }
    return list
  })
}
