/**
 * The roles the console's own chrome goes by. Same as the module's `useMongocampRoles`, except that
 * server proxy mode (an API key, no profile) counts as administrator: the key's rights apply.
 */
export function useConsoleRoles() {
  const roles = useMongocampRoles()
  const isProxyMode = useProxyMode()

  return {
    isAdmin: computed(() => isProxyMode || roles.isAdmin.value),
    isManager: computed(() => isProxyMode || roles.isManager.value),
  }
}
