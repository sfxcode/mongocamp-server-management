<script setup lang="ts">
definePageMeta({ layout: 'collection' })

const { t } = useI18n()
// The collection panel needs no reload from here: `MongocampCollections` writes every list it loads
// (after a drop, rename, copy or clear too) into the shared `useMongocampCollectionNames()` cache
const list = useTemplateRef<{ refresh: () => unknown }>('list')
</script>

<template>
  <CollectionPage
    :title="t('serverManagement.nav.collections')"
    :description="t('serverManagement.home.collectionsText')"
    heading
  >
    <template #actions>
      <PageReload :target="list" />
    </template>

    <MongocampCollections
      ref="list"
      hide-heading
      hide-refresh
    />
  </CollectionPage>
</template>
