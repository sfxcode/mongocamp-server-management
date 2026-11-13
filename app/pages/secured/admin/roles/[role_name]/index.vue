<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const roleName = computed(() => String(route.params.role_name))
const list = useTemplateRef<{ refresh: () => unknown }>('list')
</script>

<template>
  <AppPage
    :title="t('serverManagement.nav.grantsOf', { role: roleName })"
    heading
    width="default"
  >
    <template #actions>
      <PageReload :target="list" />
    </template>

    <MongocampRoleGrants
      ref="list"
      hide-heading
      :role-name="roleName"
      hide-refresh
    />
  </AppPage>
</template>
