<script setup lang="ts">
const { t } = useI18n()
const list = useTemplateRef<{ refresh: () => unknown }>('list')
</script>

<template>
  <AppPage
    :title="t('serverManagement.nav.jobs')"
    heading
    :description="t('serverManagement.home.jobsText')"
  >
    <template #actions>
      <PageReload :target="list" />
    </template>

    <MongocampJobs
      ref="list"
      hide-heading
      hide-refresh
    />
  </AppPage>
</template>
