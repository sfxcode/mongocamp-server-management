<script setup lang="ts">
const { t } = useI18n()
const state = useMongocampStorage()
const { isAdmin } = useConsoleRoles()

const managerRoles: string[] = useRuntimeConfig().public.nuxtUiMongocampOptions?.managerRoles ?? []

// Why this user may be here: administrators always, everyone else through one of the manager roles
const reasons = computed(() => {
  if (isAdmin.value) return [t('serverManagement.manager.adminReason')]
  const held = state.value?.profile?.roles ?? []
  return held
    .filter(role => managerRoles.includes(role))
    .map(role => t('serverManagement.manager.roleReason', { role }))
})
</script>

<template>
  <AppPage
    :title="t('serverManagement.manager.title')"
    heading
    width="default"
  >
    <section aria-labelledby="manager-why">
      <h2
        id="manager-why"
        class="text-sm font-medium text-muted"
      >
        {{ t('serverManagement.manager.why') }}
      </h2>
      <ul class="mt-1 text-sm text-default">
        <li
          v-for="reason in reasons"
          :key="reason"
        >
          {{ reason }}
        </li>
      </ul>
    </section>

    <UAlert
      v-if="isAdmin"
      color="info"
      variant="subtle"
      icon="i-lucide-gauge"
      :title="t('serverManagement.manager.adminHintTitle')"
      :description="t('serverManagement.manager.adminHint')"
      :actions="[{ label: t('serverManagement.manager.openOverview'), to: '/secured/admin/overview', color: 'info', variant: 'outline' }]"
    />
    <UserAccess v-else />
  </AppPage>
</template>
