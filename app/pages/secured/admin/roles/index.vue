<script setup lang="ts">
const { t } = useI18n()
const list = useTemplateRef<{ refresh: () => unknown }>('list')
</script>

<template>
  <AppPage
    :title="t('serverManagement.nav.roles')"
    heading
    :description="t('serverManagement.home.rolesText')"
    width="default"
  >
    <template #actions>
      <PageReload :target="list" />
    </template>

    <MongocampRoles
      ref="list"
      hide-heading
      hide-refresh
    />
  </AppPage>
</template>
