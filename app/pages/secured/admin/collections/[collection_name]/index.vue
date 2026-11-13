<script setup lang="ts">
definePageMeta({ layout: 'collection' })

const route = useRoute()
const collectionName = computed(() => String(route.params.collection_name))
</script>

<template>
  <CollectionPage
    :title="collectionName"
    :collection-name="collectionName"
  >
    <MongocampCollectionInfos
      :key="collectionName"
      :collection-name="collectionName"
    />
  </CollectionPage>
</template>
