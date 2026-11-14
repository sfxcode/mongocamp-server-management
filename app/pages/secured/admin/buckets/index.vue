<script setup lang="ts">
definePageMeta({ layout: 'collection' })

const { t } = useI18n()
const paths = useMongocampPaths()
// The shared list behind the collection panel: GridFS buckets are recognised by their .files / .chunks pair
const { buckets, status, load, refresh } = useMongocampCollectionNames()
const list = { refresh }

onMounted(() => load())

const loading = computed(() => status.value === 'loading' || status.value === 'idle')
const failed = computed(() => status.value === 'failed' && buckets.value.length === 0)
</script>

<template>
  <CollectionPage
    :title="t('serverManagement.nav.buckets')"
    :description="t('serverManagement.buckets.text')"
    heading
  >
    <template #actions>
      <PageReload :target="list" />
    </template>

    <UAlert
      v-if="failed"
      color="error"
      variant="subtle"
      :title="t('serverManagement.collections.failed')"
      :actions="[{ label: t('serverManagement.collections.retry'), color: 'error', variant: 'outline', onClick: refresh }]"
    />

    <div
      v-else-if="loading && buckets.length === 0"
      class="flex flex-col gap-2"
    >
      <USkeleton
        v-for="index in 3"
        :key="index"
        class="h-12"
      />
    </div>

    <MongocampEmptyState
      v-else-if="buckets.length === 0"
      icon="i-lucide-folder"
      :title="t('serverManagement.buckets.emptyTitle')"
      :description="t('serverManagement.buckets.emptyText')"
    />

    <ul
      v-else
      class="max-w-3xl"
    >
      <li
        v-for="bucket in buckets"
        :key="bucket"
        class="border-b border-default"
      >
        <NuxtLink
          :to="`${paths.buckets}/${encodeURIComponent(bucket)}`"
          class="group flex items-center gap-3 py-3"
        >
          <UIcon
            name="i-lucide-folder"
            class="size-5 shrink-0 text-muted group-hover:text-primary"
            aria-hidden="true"
          />
          <span class="min-w-0 flex-1 truncate font-mono text-sm text-highlighted group-hover:text-primary">{{ bucket }}</span>
          <UIcon
            name="i-lucide-chevron-right"
            class="size-4 shrink-0 text-dimmed"
            aria-hidden="true"
          />
        </NuxtLink>
      </li>
    </ul>
  </CollectionPage>
</template>
