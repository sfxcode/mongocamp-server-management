// Example guard for server proxy mode: without it, anyone who can reach the proxy route acts with the
// API key's rights. Active only when MONGOCAMP_PROXY_SHARED_SECRET is set; callers then have to send
// the same value in the `x-mongocamp-proxy-secret` header.
import type { H3Event } from 'h3'

interface MongocampProxyHooks {
  hook: (name: 'mongocamp-proxy:authorize', handler: (event: H3Event) => void | Promise<void>) => void
}

export default defineNitroPlugin((nitroApp) => {
  const secret = process.env.MONGOCAMP_PROXY_SHARED_SECRET
  if (!secret) return

  const hooks = nitroApp.hooks as unknown as MongocampProxyHooks
  hooks.hook('mongocamp-proxy:authorize', (event) => {
    if (getHeader(event, 'x-mongocamp-proxy-secret') !== secret) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
  })
})
