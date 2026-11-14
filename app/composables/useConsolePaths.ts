/** The module's paths plus the logout route, which the module keeps among its role settings. */
export function useConsolePaths() {
  const paths = useMongocampPaths()
  const { logoutPath } = useMongocampRoles()

  return {
    ...paths,
    logout: logoutPath,
  }
}
