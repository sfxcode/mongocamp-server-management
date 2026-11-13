<script setup lang="ts">
const { t } = useI18n()
const list = useTemplateRef<{ refresh: () => unknown }>('list')
</script>

<template>
  <AppPage
    :title="t('serverManagement.nav.overview')"
    heading
    :description="t('serverManagement.home.overviewText')"
  >
    <template #actions>
      <PageReload :target="list" />
    </template>

    <MongocampServerOverview
      ref="list"
      hide-heading
      :auto-refresh="0"
      hide-refresh
    />
  </AppPage>
</template>
