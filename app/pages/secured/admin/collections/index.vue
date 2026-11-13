<script setup lang="ts">
definePageMeta({ layout: 'collection' })

const { t } = useI18n()
const names = useState<string[] | null>('collection-panel-names', () => null)

// A drop, rename, copy or clear changes what the collection panel lists
function reloadPanel() {
  names.value = null
}
const list = useTemplateRef<{ refresh: () => unknown }>('list')
</script>

<template>
  <CollectionPage
    :title="t('serverManagement.nav.collections')"
    heading
  >
    <template #actions>
      <PageReload :target="list" />
    </template>

    <MongocampCollections
      ref="list"
      hide-heading
      hide-refresh
      @changed="reloadPanel"
    />
  </CollectionPage>
</template>
