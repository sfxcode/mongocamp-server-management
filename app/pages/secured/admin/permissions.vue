<script setup lang="ts">
const { t } = useI18n()
const list = useTemplateRef<{ refresh: () => unknown }>('list')
</script>

<template>
  <AppPage
    :title="t('serverManagement.nav.permissions')"
    heading
    :description="t('serverManagement.home.permissionsText')"
  >
    <template #actions>
      <PageReload :target="list" />
    </template>

    <MongocampPermissionMatrix
      ref="list"
      hide-heading
      hide-refresh
    />
  </AppPage>
</template>
