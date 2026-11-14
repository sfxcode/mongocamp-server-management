<script setup lang="ts">
const { t } = useI18n()
const list = useTemplateRef<{ refresh: () => unknown }>('list')
</script>

<template>
  <AppPage
    :title="t('serverManagement.nav.settings')"
    heading
    :description="t('serverManagement.home.settingsText')"
    width="default"
  >
    <template #actions>
      <PageReload :target="list" />
    </template>

    <MongocampSettings
      ref="list"
      hide-heading
      hide-refresh
    />
  </AppPage>
</template>
