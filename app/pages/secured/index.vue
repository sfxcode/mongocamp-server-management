<script setup lang="ts">
const { t } = useI18n()
const state = useMongocampStorage()
const { canSeeAdmin: isAdmin, canSeeManagement: isManager } = useMongocampRoles()
const isProxyMode = useMongocampProxyMode()
const managerRoles: string[] = useRuntimeConfig().public.nuxtUiMongocampOptions?.managerRoles ?? []

const profile = computed(() => state.value?.profile)
const roles = computed(() => profile.value?.roles ?? [])

// Managers see what they can reach, and which of their roles makes them a manager
const managerHint = computed(() => {
  if (!isManager.value || isAdmin.value) return undefined
  const held = roles.value.filter(role => managerRoles.includes(role))
  return t('serverManagement.home.managerHint', { roles: held.join(', ') }, held.length)
})
const title = computed(() => profile.value?.user
  ? t('serverManagement.home.welcome', { name: profile.value.user })
  : t('serverManagement.nav.home'))

// A role is not a problem: red and amber stay reserved for errors and warnings
const roleBadge = computed(() => {
  if (isAdmin.value || isProxyMode) return { label: t('serverManagement.user.administrator'), color: 'primary' as const }
  if (isManager.value) return { label: t('serverManagement.user.manager'), color: 'secondary' as const }
  return { label: t('serverManagement.user.standard'), color: 'neutral' as const }
})

const dashboard = useTemplateRef<{ refresh: () => unknown }>('dashboard')
const { refresh: refreshCollectionNames } = useMongocampCollectionNames()

function onTestDataChanged() {
  dashboard.value?.refresh()
  // The demo data adds and drops collections: the shared list behind the collection panel is asked again
  refreshCollectionNames()
}
</script>

<template>
  <AppPage
    :title="title"
    heading
    :description="managerHint"
    :width="isAdmin ? 'full' : 'default'"
  >
    <template #actions>
      <PageReload
        v-if="isAdmin"
        :target="dashboard"
      />
      <UBadge :color="roleBadge.color">
        {{ roleBadge.label }}
      </UBadge>
      <UBadge
        v-for="role in roles"
        :key="role"
        color="neutral"
        variant="outline"
      >
        {{ role }}
      </UBadge>
    </template>

    <!-- Administrator: counts, where to go, demo data -->
    <MongocampDashboard
      v-if="isAdmin"
      ref="dashboard"
      hide-heading
      hide-refresh
    >
      <!-- The module spaces its own sections; the console's two share the page's rhythm -->
      <div class="flex flex-col gap-6">
        <DestinationList />
        <TestDataPanel @changed="onTestDataChanged" />
      </div>
    </MongocampDashboard>

    <!-- Manager and standard user: what they can reach -->
    <MongocampUserAccess v-else />
  </AppPage>
</template>
