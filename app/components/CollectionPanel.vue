<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

/**
 * Every collection one click away while working in one: recently opened ones, ordinary collections, GridFS
 * buckets and MongoCamp's own `mc_*` collections, with a filter on top. The list is the module's shared one
 * (`useMongocampCollectionNames()`): loaded once, and kept current by the collections table after a drop,
 * rename or copy. Folded groups and recents are remembered per user (`useCollectionPanel()`).
 */
const { t } = useI18n()
const route = useRoute()
const paths = useMongocampPaths()
const panel = useCollectionPanel()
const { names, collections, buckets, system, status, load, refresh } = useMongocampCollectionNames()

const search = ref('')
const needle = computed(() => search.value.trim().toLowerCase())
const failed = computed(() => status.value === 'failed' && names.value.length === 0)
const loading = computed(() => status.value === 'loading' || status.value === 'idle')
const results = useTemplateRef<HTMLElement>('results')

onMounted(() => load())

function isActive(base: string): boolean {
  let path = route.path
  try {
    path = decodeURIComponent(route.path)
  }
  catch {
    // keep the raw path
  }
  const decodedBase = decodeURIComponent(base)
  return path === decodedBase || path.startsWith(`${decodedBase}/`)
}

function collectionItem(name: string): NavigationMenuItem {
  const base = `${paths.collections}/${encodeURIComponent(name)}`
  return { label: name, to: `${base}/data`, active: isActive(base) }
}

function bucketItem(name: string): NavigationMenuItem {
  const base = `${paths.buckets}/${encodeURIComponent(name)}`
  return { label: name, to: base, active: isActive(base) }
}

// The ones opened before the current one: a dropped collection or bucket is left out rather than shown as a
// dead link, and the open one is already highlighted in its own group
const recentItems = computed(() => panel.value.recent
  .filter(entry => entry.kind === 'bucket' ? buckets.value.includes(entry.name) : names.value.includes(entry.name))
  .map(entry => entry.kind === 'bucket' ? bucketItem(entry.name) : collectionItem(entry.name))
  .filter(item => !item.active))

const groups = computed(() => {
  const matching = (list: string[]) => list.filter(name => !needle.value || name.toLowerCase().includes(needle.value))

  return [
    // Recents repeat entries from the groups below, so they only help while nothing is filtered
    { key: 'recent', label: t('serverManagement.collections.recent'), items: needle.value ? [] : recentItems.value },
    { key: 'collections', label: t('serverManagement.nav.collections'), items: matching(collections.value).map(collectionItem) },
    { key: 'buckets', label: t('serverManagement.nav.buckets'), items: matching(buckets.value).map(bucketItem) },
    { key: 'system', label: t('serverManagement.collections.system'), items: matching(system.value).map(collectionItem) },
  ].filter(group => group.items.length > 0)
})

const matchCount = computed(() => groups.value.reduce((sum, group) => sum + group.items.length, 0))

// While filtering every match is shown, so the group headers are plain labels, not toggles
function isOpen(key: string): boolean {
  return Boolean(needle.value) || !panel.value.closedGroups.includes(key)
}

function toggle(key: string) {
  const closed = panel.value.closedGroups
  panel.value.closedGroups = closed.includes(key) ? closed.filter(item => item !== key) : [...closed, key]
}

// Opening a collection from elsewhere (table, palette, link) unfolds its group once. `unfoldedFor` remembers
// which one, so a reload or a tab switch inside the same collection keeps a group the user folded again.
const active = computed(() => {
  for (const group of groups.value) {
    if (group.key === 'recent') continue
    const item = group.items.find(entry => entry.active)
    if (item) return { group: group.key, name: String(item.label) }
  }
  return undefined
})
watch(active, (current) => {
  if (!current || panel.value.unfoldedFor === current.name) return
  panel.value.unfoldedFor = current.name
  if (panel.value.closedGroups.includes(current.group)) toggle(current.group)
}, { immediate: true })

function links(): HTMLAnchorElement[] {
  return [...(results.value?.querySelectorAll<HTMLAnchorElement>('a[href]') ?? [])]
}

function onFilterKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    links()[0]?.focus()
  }
  else if (event.key === 'Enter' && needle.value) {
    event.preventDefault()
    links()[0]?.click()
  }
  else if (event.key === 'Escape' && search.value) {
    event.preventDefault()
    search.value = ''
  }
}

// Arrow keys walk through all results across groups; up from the first goes back to the filter
function onResultsKeydown(event: KeyboardEvent) {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  const all = links()
  const index = all.indexOf(document.activeElement as HTMLAnchorElement)
  if (index === -1) return
  event.preventDefault()
  const next = index + (event.key === 'ArrowDown' ? 1 : -1)
  if (next < 0) document.getElementById('collection-panel-filter')?.focus()
  else all[Math.min(next, all.length - 1)]?.focus()
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div class="flex shrink-0 flex-col gap-2 border-b border-default p-3">
      <UButton
        :to="paths.collections"
        color="neutral"
        variant="ghost"
        icon="i-lucide-layout-list"
        class="justify-start"
        :class="route.path === paths.collections ? 'bg-elevated text-highlighted' : ''"
      >
        {{ t('serverManagement.collections.all') }}
      </UButton>
      <UInput
        id="collection-panel-filter"
        v-model="search"
        icon="i-lucide-search"
        :placeholder="t('serverManagement.collections.filter')"
        :aria-label="t('serverManagement.collections.filter')"
        class="w-full"
        :ui="{ trailing: 'pe-1' }"
        @keydown="onFilterKeydown"
      >
        <template
          v-if="search"
          #trailing
        >
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="i-lucide-x"
            :aria-label="t('serverManagement.collections.clearFilter')"
            @click="search = ''"
          />
        </template>
      </UInput>
      <p
        class="sr-only"
        aria-live="polite"
      >
        {{ needle ? t('serverManagement.collections.matches', { n: matchCount }, matchCount) : '' }}
      </p>
    </div>

    <div
      ref="results"
      class="min-h-0 flex-1 overflow-y-auto p-3"
      @keydown="onResultsKeydown"
    >
      <UAlert
        v-if="failed"
        color="error"
        variant="subtle"
        :title="t('serverManagement.collections.failed')"
        :actions="[{ label: t('serverManagement.collections.retry'), color: 'error', variant: 'outline', onClick: refresh }]"
      />

      <div
        v-else-if="loading && names.length === 0"
        class="flex flex-col gap-2"
      >
        <USkeleton
          v-for="index in 6"
          :key="index"
          class="h-6"
        />
      </div>

      <p
        v-else-if="groups.length === 0"
        class="px-2 text-sm text-muted"
      >
        {{ needle ? t('serverManagement.collections.none') : t('serverManagement.collections.empty') }}
      </p>

      <section
        v-for="group in groups"
        v-else
        :key="group.key"
        class="mb-3"
      >
        <div
          v-if="needle"
          class="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-muted"
        >
          <span class="flex-1">{{ group.label }}</span>
          <span class="tabular text-dimmed">{{ group.items.length }}</span>
        </div>
        <div
          v-else
          class="text-xs font-medium"
        >
          <button
            type="button"
            class="flex w-full items-center gap-1.5 rounded-sm px-2 py-1 text-muted hover:text-default"
            :aria-expanded="isOpen(group.key)"
            :aria-controls="`collection-panel-${group.key}`"
            @click="toggle(group.key)"
          >
            <UIcon
              name="i-lucide-chevron-right"
              class="size-3.5 transition-transform"
              :class="isOpen(group.key) ? 'rotate-90' : ''"
              aria-hidden="true"
            />
            <span class="flex-1 text-start">{{ group.label }}</span>
            <span class="tabular text-dimmed">{{ group.items.length }}</span>
          </button>
        </div>
        <UNavigationMenu
          v-if="isOpen(group.key)"
          :id="`collection-panel-${group.key}`"
          :items="group.items"
          orientation="vertical"
          :ui="{ link: 'font-mono text-sm py-1', linkLabel: 'truncate' }"
        />
      </section>
    </div>
  </div>
</template>
