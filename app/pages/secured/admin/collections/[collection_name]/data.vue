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

    <!-- aggregate-path adds the link that carries the table's filter over to the Aggregate tab -->
    <MongocampCollectionData
      ref="list"
      :key="collectionName"
      :collection-name="collectionName"
      aggregate-path="/secured/admin/collections"
      hide-refresh
    />
  </CollectionPage>
</template>
