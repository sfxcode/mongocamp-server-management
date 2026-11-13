import type { NavigationMenuItem } from '@nuxt/ui'

/**
 * Sidebar navigation, by role: everyone gets Home and Account, managers their area,
 * administrators the admin pages grouped by what they are about.
 */
export function useNavItems() {
  const { t } = useI18n()
  const { isAdmin, isManager } = useConsoleRoles()
  const isProxyMode = useProxyMode()

  return computed<NavigationMenuItem[][]>(() => {
    const groups: NavigationMenuItem[][] = [[
      { label: t('serverManagement.nav.home'), icon: 'i-lucide-house', to: '/secured', exact: true },
      // No account without a login
      ...(isProxyMode ? [] : [{ label: t('serverManagement.nav.account'), icon: 'i-lucide-circle-user', to: '/secured/account' }]),
      ...(isManager.value ? [{ label: t('serverManagement.nav.managerArea'), icon: 'i-lucide-briefcase', to: '/secured/manager' }] : []),
    ]]

    if (isAdmin.value) {
      groups.push(
        [
          { type: 'label', label: t('serverManagement.nav.data') },
          { label: t('serverManagement.nav.collections'), icon: 'i-lucide-database', to: '/secured/admin/collections' },
          { label: t('serverManagement.nav.databases'), icon: 'i-lucide-hard-drive', to: '/secured/admin/databases' },
          { label: t('serverManagement.nav.jobs'), icon: 'i-lucide-clock', to: '/secured/admin/jobs' },
        ],
        [
          { type: 'label', label: t('serverManagement.nav.access') },
          { label: t('serverManagement.nav.users'), icon: 'i-lucide-users', to: '/secured/admin/users' },
          { label: t('serverManagement.nav.roles'), icon: 'i-lucide-shield', to: '/secured/admin/roles' },
          { label: t('serverManagement.nav.permissions'), icon: 'i-lucide-key-round', to: '/secured/admin/permissions' },
        ],
        [
          { type: 'label', label: t('serverManagement.nav.serverGroup') },
          { label: t('serverManagement.nav.overview'), icon: 'i-lucide-gauge', to: '/secured/admin/overview' },
          { label: t('serverManagement.nav.server'), icon: 'i-lucide-activity', to: '/secured/admin/server' },
          { label: t('serverManagement.nav.settings'), icon: 'i-lucide-settings', to: '/secured/admin/settings' },
        ],
      )
    }
    return groups
  })
}
