<script setup lang="ts">
const { t } = useI18n()
const list = useTemplateRef<{ refresh: () => unknown }>('list')
</script>

<template>
  <AppPage
    :title="t('serverManagement.nav.databases')"
    heading
    :description="t('serverManagement.home.databasesText')"
    width="default"
  >
    <template #actions>
      <PageReload :target="list" />
    </template>

    <MongocampDatabases
      ref="list"
      hide-heading
      hide-refresh
    />
  </AppPage>
</template>
