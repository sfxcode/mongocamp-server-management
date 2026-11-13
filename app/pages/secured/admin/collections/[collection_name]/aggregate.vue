<script setup lang="ts">
definePageMeta({ layout: 'collection' })

const route = useRoute()
const collectionName = computed(() => String(route.params.collection_name))

// The data table links here with its current filter (?filter=<lucene>)
const filter = computed(() => {
  const value = route.query.filter
  return typeof value === 'string' && value.length > 0 ? value : undefined
})
</script>

<template>
  <CollectionPage
    :title="collectionName"
    :collection-name="collectionName"
  >
    <MongocampAggregationBuilder
      :key="collectionName"
      :collection-name="collectionName"
      :filter="filter"
    />
  </CollectionPage>
</template>
