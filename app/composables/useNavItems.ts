import type { NavigationMenuItem } from '@nuxt/ui'

/**
 * Sidebar navigation: the module's pages from `useMongocampNavigation()` — role-aware, translated and built on the
 * module's `paths` option. Kept as the console's own entry point so console pages can be added in one place.
 */
export function useNavItems() {
  const { menu } = useMongocampNavigation()
  return computed<NavigationMenuItem[][]>(() => menu.value)
}
