/**
 * The module's global middleware handles the logout route and redirects before any page renders, so the sign-in
 * screen would look exactly like a first visit. This marks the next sign-in screen as "you were signed out".
 * It has to be file-based: those run before middleware a plugin adds, like the module's. A flag in state, not a
 * query on `logoutRedirectPath`, because the module compares that path literally for its route guard.
 */
export default defineNuxtRouteMiddleware((to) => {
  const { logoutPath } = useMongocampRoles()
  if (to.path === logoutPath) useState('signed-out', () => false).value = true
})
