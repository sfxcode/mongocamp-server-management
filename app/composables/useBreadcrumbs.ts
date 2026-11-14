import type { BreadcrumbItem } from '@nuxt/ui'

/**
 * Breadcrumb for the current route: Home › Collections › test_customer › Data. The module knows its
 * own pages (`useMongocampBreadcrumbs()`); the console adjusts where it has pages the module does not.
 */
export function useBreadcrumbs() {
  const route = useRoute()
  const paths = useMongocampPaths()
  const items = useMongocampBreadcrumbs()

  return computed<BreadcrumbItem[]>(() => {
    // The module has no buckets list, so its "Buckets" crumb points at Collections; the console has one
    if (route.path.startsWith(`${paths.buckets}/`)) {
      return items.value.map((item, index) => index === 1 ? { ...item, to: paths.buckets } : item)
    }
    return items.value
  })
}
