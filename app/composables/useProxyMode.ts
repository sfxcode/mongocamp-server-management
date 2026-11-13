/** True when the module runs in server proxy mode: an API key on the server, no login. */
export function useProxyMode(): boolean {
  return useRuntimeConfig().public.nuxtUiMongocampOptions?.useServerProxy ?? false
}
