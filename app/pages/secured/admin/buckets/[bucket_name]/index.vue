<script setup lang="ts">
definePageMeta({ layout: 'collection' })

const { t } = useI18n()
const route = useRoute()
const bucketName = computed(() => String(route.params.bucket_name))
const list = useTemplateRef<{ refresh: () => unknown }>('list')
</script>

<template>
  <CollectionPage
    :title="bucketName"
    :description="t('serverManagement.collections.bucketText')"
    heading
  >
    <template #actions>
      <PageReload :target="list" />
    </template>

    <MongocampBucketFiles
      ref="list"
      :key="bucketName"
      :bucket-name="bucketName"
      hide-refresh
    />
  </CollectionPage>
</template>
