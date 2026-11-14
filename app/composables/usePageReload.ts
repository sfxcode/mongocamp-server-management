// The reload of the page on screen: set by its `PageReload` button, so a shortcut reloads exactly what the button would
const current = shallowRef<(() => Promise<void>) | null>(null)

export function usePageReload() {
  function register(reload: () => Promise<void>) {
    current.value = reload
    return () => {
      if (current.value === reload) current.value = null
    }
  }

  return {
    available: computed(() => current.value !== null),
    register,
    reload: () => current.value?.(),
  }
}
