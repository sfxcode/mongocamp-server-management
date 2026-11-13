import type { BreadcrumbItem } from '@nuxt/ui'

// Path segment → translation key. Anything else is a name from the URL and shown as it is.
const SEGMENT_KEYS: Record<string, string> = {
  account: 'account',
  manager: 'managerArea',
  users: 'users',
  roles: 'roles',
  permissions: 'permissions',
  overview: 'overview',
  collections: 'collections',
  buckets: 'buckets',
  jobs: 'jobs',
  databases: 'databases',
  server: 'server',
  settings: 'settings',
  data: 'tabData',
  aggregate: 'tabAggregate',
}

function decode(segment: string): string {
  try {
    return decodeURIComponent(segment)
  }
  catch {
    return segment
  }
}

/**
 * Breadcrumb for the current route: Home › Collections › test_customer › Data.
 * The last item is the current page and carries no link.
 */
export function useBreadcrumbs() {
  const route = useRoute()
  const { t } = useI18n()

  return computed<BreadcrumbItem[]>(() => {
    const segments = route.path.split('/').filter(Boolean)
    const items: BreadcrumbItem[] = [{ label: t('serverManagement.nav.home'), icon: 'i-lucide-house', to: '/secured' }]

    let path = ''
    segments.forEach((segment, index) => {
      path += `/${segment}`
      // `/secured` is Home; `/secured/admin` is only a grouping level
      if (index === 0 || (index === 1 && segment === 'admin')) return

      const previous = segments[index - 1]
      const isName = previous === 'collections' || previous === 'buckets' || previous === 'roles'
      const key = isName ? undefined : SEGMENT_KEYS[segment]
      // There is no bucket list page: buckets are part of the collection list
      const to = segment === 'buckets' && !isName ? '/secured/admin/collections' : path

      items.push({
        label: key ? t(`serverManagement.nav.${key}`) : decode(segment),
        to,
      })
    })

    const last = items[items.length - 1]
    if (last) delete last.to
    return items
  })
}
