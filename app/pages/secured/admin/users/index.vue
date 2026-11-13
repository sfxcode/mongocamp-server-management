<script setup lang="ts">
const { t } = useI18n()
const list = useTemplateRef<{ refresh: () => unknown }>('list')
</script>

<template>
  <AppPage
    :title="t('serverManagement.nav.users')"
    heading
    :description="t('serverManagement.home.usersText')"
  >
    <template #actions>
      <PageReload :target="list" />
    </template>

    <MongocampUsers
      ref="list"
      hide-heading
      hide-refresh
    />
  </AppPage>
</template>
