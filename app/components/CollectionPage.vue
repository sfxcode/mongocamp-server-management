<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

/**
 * Page frame for everything under the collection workspace: the button that opens the collection
 * drawer on narrower screens and, for one collection, the Data / Overview / Aggregate tabs.
 */
const props = withDefaults(defineProps<{
  title: string
  /** Set for the pages of one collection: shows its name and the tabs */
  collectionName?: string
  /** Show `title` as the heading (bucket pages; collections show their name with the tabs) */
  heading?: boolean
}>(), {
  collectionName: undefined,
  heading: false,
})

const { t } = useI18n()
const route = useRoute()
const drawerOpen = useState('collection-drawer-open', () => false)

function openDrawer() {
  drawerOpen.value = true
}

const base = computed(() => `/secured/admin/collections/${encodeURIComponent(props.collectionName ?? '')}`)

const tabs = computed<TabsItem[]>(() => [
  { label: t('serverManagement.nav.tabData'), icon: 'i-lucide-table', value: `${base.value}/data` },
  { label: t('serverManagement.nav.tabOverview'), icon: 'i-lucide-info', value: base.value },
  { label: t('serverManagement.nav.tabAggregate'), icon: 'i-lucide-sigma', value: `${base.value}/aggregate` },
])

const activeTab = computed({
  get: () => {
    if (route.path.endsWith('/data')) return `${base.value}/data`
    if (route.path.endsWith('/aggregate')) return `${base.value}/aggregate`
    return base.value
  },
  set: (value: string) => {
    navigateTo(value)
  },
})
</script>

<template>
  <AppPage
    :title="title"
    :heading="heading"
  >
    <template #leading>
      <UButton
        icon="i-lucide-panel-left-open"
        color="neutral"
        variant="ghost"
        class="xl:hidden"
        :aria-label="t('serverManagement.collections.open')"
        @click="openDrawer"
      />
    </template>

    <template #actions>
      <slot name="actions" />
    </template>

    <template
      v-if="collectionName"
      #toolbar
    >
      <h1 class="min-w-0 truncate py-2 font-mono text-sm font-semibold text-highlighted">
        {{ collectionName }}
      </h1>
      <UTabs
        v-model="activeTab"
        :items="tabs"
        :content="false"
        variant="link"
        size="sm"
        class="ms-auto"
        :ui="{ list: 'border-b-0', root: 'gap-0' }"
      />
    </template>

    <slot />
  </AppPage>
</template>
