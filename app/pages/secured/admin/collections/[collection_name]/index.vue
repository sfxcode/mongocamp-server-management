<script setup lang="ts">
definePageMeta({ layout: 'collection' })

const route = useRoute()
const collectionName = computed(() => String(route.params.collection_name))
const list = useTemplateRef<{ refresh: () => unknown }>('list')
</script>

<template>
  <CollectionPage
    :title="collectionName"
    :collection-name="collectionName"
  >
    <template #actions>
      <PageReload :target="list" />
    </template>

    <MongocampCollectionInfos
      ref="list"
      :key="collectionName"
      :collection-name="collectionName"
    />
  </CollectionPage>
</template>
