import type { InjectionKey, Ref } from 'vue'

export interface PanelEntry {
  kind: 'collection' | 'bucket'
  name: string
}

export interface CollectionPanelState extends Record<string, unknown> {
  closedGroups: string[]
  recent: PanelEntry[]
  /** The collection whose group was last unfolded automatically */
  unfoldedFor: string
}

const RECENT_LIMIT = 5
const key: InjectionKey<Ref<CollectionPanelState>> = Symbol('collection-panel')

/**
 * The collection panel's remembered state: folded groups and recently opened collections and buckets, per
 * signed-in user. Called once by the collection layout, so the column and the drawer share one copy and
 * recents are tracked even while the drawer is closed.
 */
export function provideCollectionPanel() {
  const route = useRoute()
  const storage = useMongocampStorage()
  const isProxyMode = useMongocampProxyMode()

  const owner = computed(() => isProxyMode ? 'api-key' : (storage.value?.profile?.user ?? 'anonymous'))
  const { state } = useMongocampPersistedState<CollectionPanelState>(
    () => `collectionPanel:${owner.value}`,
    // MongoCamp's own collections start folded away
    { closedGroups: ['system'], recent: [], unfoldedFor: '' },
  )

  const current = computed<PanelEntry | undefined>(() => {
    const collection = route.params.collection_name
    const bucket = route.params.bucket_name
    if (typeof collection === 'string' && collection) return { kind: 'collection', name: collection }
    if (typeof bucket === 'string' && bucket) return { kind: 'bucket', name: bucket }
    return undefined
  })

  watch(current, (entry) => {
    if (!entry) return
    const rest = state.value.recent.filter(item => item.kind !== entry.kind || item.name !== entry.name)
    state.value.recent = [entry, ...rest].slice(0, RECENT_LIMIT)
  }, { immediate: true })

  provide(key, state)
  return state
}

export function useCollectionPanel() {
  const state = inject(key)
  if (!state) throw new Error('useCollectionPanel() needs provideCollectionPanel() in the layout')
  return state
}
