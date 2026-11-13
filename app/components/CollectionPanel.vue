<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

/**
 * Every collection one click away while working in one: ordinary collections, GridFS buckets and
 * MongoCamp's own `mc_*` collections, with a filter on top. The list is loaded once and shared;
 * pages that change it (drop, rename, copy, demo data) set the shared state to `null` to reload.
 */
const { t } = useI18n()
const route = useRoute()
const { listCollections } = useMongocampAdmin()

const names = useState<string[] | null>('collection-panel-names', () => null)
const failed = ref(false)
const loading = ref(false)
const search = ref('')

async function load() {
  loading.value = true
  failed.value = false
  try {
    names.value = (await listCollections()) ?? []
  }
  catch {
    failed.value = true
  }
  finally {
    loading.value = false
  }
}

// Also reloads when a page invalidates the shared list
watch(names, (value) => {
  if (value === null && !loading.value) load()
}, { immediate: true })

const COLLECTION_BASE = '/secured/admin/collections'
const BUCKET_BASE = '/secured/admin/buckets'

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
  const base = `${COLLECTION_BASE}/${encodeURIComponent(name)}`
  return { label: name, to: `${base}/data`, active: isActive(base) }
}

const groups = computed(() => {
  const needle = search.value.trim().toLowerCase()
  const all = (names.value ?? []).filter(name => !needle || name.toLowerCase().includes(needle)).sort((a, b) => a.localeCompare(b))

  const system = all.filter(name => name.startsWith('mc_'))
  const ordinary = all.filter(name => !name.startsWith('mc_'))
  const buckets = ordinary.filter(name => name.endsWith('.files')).map(name => name.slice(0, -'.files'.length))
  const collections = ordinary.filter(name => !name.endsWith('.files') && !name.endsWith('.chunks'))

  return [
    { key: 'collections', label: t('serverManagement.nav.collections'), icon: 'i-lucide-table-2', items: collections.map(collectionItem) },
    {
      key: 'buckets',
      label: t('serverManagement.nav.buckets'),
      icon: 'i-lucide-folder',
      items: buckets.map((name): NavigationMenuItem => {
        const base = `${BUCKET_BASE}/${encodeURIComponent(name)}`
        return { label: name, to: base, active: isActive(base) }
      }),
    },
    { key: 'system', label: t('serverManagement.collections.system'), icon: 'i-lucide-lock', items: system.map(collectionItem) },
  ].filter(group => group.items.length > 0)
})

// MongoCamp's own collections stay folded away unless one of them is open or the filter found one
const closed = ref<Record<string, boolean>>({ system: true })

function isOpen(key: string, items: NavigationMenuItem[]): boolean {
  if (search.value.trim()) return true
  if (items.some(item => item.active)) return true
  return !closed.value[key]
}

function toggle(key: string) {
  closed.value[key] = !closed.value[key]
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div class="flex shrink-0 flex-col gap-2 border-b border-default p-3">
      <UButton
        :to="COLLECTION_BASE"
        color="neutral"
        variant="ghost"
        icon="i-lucide-layout-list"
        class="justify-start"
        :class="route.path === COLLECTION_BASE ? 'bg-elevated text-highlighted' : ''"
      >
        {{ t('serverManagement.collections.all') }}
      </UButton>
      <UInput
        v-model="search"
        icon="i-lucide-search"
        :placeholder="t('serverManagement.collections.filter')"
        :aria-label="t('serverManagement.collections.filter')"
        class="w-full"
      />
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto p-3">
      <UAlert
        v-if="failed"
        color="error"
        variant="subtle"
        :title="t('serverManagement.collections.failed')"
        :actions="[{ label: t('serverManagement.collections.retry'), color: 'error', variant: 'outline', onClick: load }]"
      />

      <div
        v-else-if="loading && !names"
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
        {{ t('serverManagement.collections.none') }}
      </p>

      <section
        v-for="group in groups"
        v-else
        :key="group.key"
        class="mb-3"
      >
        <button
          type="button"
          class="flex w-full items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-medium text-muted hover:text-default"
          :aria-expanded="isOpen(group.key, group.items)"
          @click="toggle(group.key)"
        >
          <UIcon
            name="i-lucide-chevron-right"
            class="size-3.5 transition-transform"
            :class="isOpen(group.key, group.items) ? 'rotate-90' : ''"
            aria-hidden="true"
          />
          <span class="flex-1 text-start">{{ group.label }}</span>
          <span class="tabular text-dimmed">{{ group.items.length }}</span>
        </button>
        <UNavigationMenu
          v-if="isOpen(group.key, group.items)"
          :items="group.items"
          orientation="vertical"
          :ui="{ link: 'font-mono text-[0.8125rem] py-1', linkLabel: 'truncate' }"
        />
      </section>
    </div>
  </div>
</template>
