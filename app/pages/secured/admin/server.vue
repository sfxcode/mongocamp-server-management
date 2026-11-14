<script setup lang="ts">
const { t } = useI18n()
const list = useTemplateRef<{ refresh: () => unknown }>('list')
</script>

<template>
  <AppPage
    :title="t('serverManagement.nav.server')"
    heading
    :description="t('serverManagement.home.serverText')"
    width="default"
  >
    <template #actions>
      <PageReload :target="list" />
    </template>

    <!-- The one live page: load and connections move while you watch -->
    <MongocampServerInfo
      ref="list"
      hide-heading
      hide-refresh
      :auto-refresh="30"
    />
  </AppPage>
</template>
