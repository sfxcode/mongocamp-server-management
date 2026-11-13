<script setup lang="ts">
const { t } = useI18n()
const state = useMongocampStorage()
const { isAdmin, isManager } = useConsoleRoles()
const isProxyMode = useProxyMode()

const profile = computed(() => state.value?.profile)
const roles = computed(() => profile.value?.roles ?? [])
const title = computed(() => profile.value?.user
  ? t('serverManagement.home.welcome', { name: profile.value.user })
  : t('serverManagement.nav.home'))

const roleBadge = computed(() => {
  if (isAdmin.value || isProxyMode) return { label: t('serverManagement.user.administrator'), color: 'error' as const }
  if (isManager.value) return { label: t('serverManagement.user.manager'), color: 'warning' as const }
  return { label: t('serverManagement.user.standard'), color: 'neutral' as const }
})

const dashboard = useTemplateRef<{ refresh: () => unknown }>('dashboard')
const collectionNames = useState<string[] | null>('collection-panel-names', () => null)

function onTestDataChanged() {
  dashboard.value?.refresh()
  // The collection panel reloads its list the next time it is shown
  collectionNames.value = null
}
</script>

<template>
  <AppPage
    :title="title"
    heading
    :description="isManager && !isAdmin ? t('serverManagement.home.managerHint') : undefined"
    :width="isAdmin ? 'full' : 'default'"
  >
    <template #actions>
      <PageReload
        v-if="isAdmin"
        :target="dashboard"
      />
      <UBadge
        :color="roleBadge.color"
        variant="subtle"
      >
        {{ roleBadge.label }}
      </UBadge>
      <UBadge
        v-for="role in roles"
        :key="role"
        color="neutral"
        variant="outline"
        class="hidden sm:inline-flex"
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
      class="!gap-6"
    >
      <DestinationList />
      <TestDataPanel @changed="onTestDataChanged" />
    </MongocampDashboard>

    <!-- Manager and standard user: what they can reach -->
    <template v-else>
      <div v-if="isManager">
        <UButton
          to="/secured/manager"
          icon="i-lucide-briefcase"
          color="neutral"
          variant="outline"
        >
          {{ t('serverManagement.home.managerOpen') }}
        </UButton>
      </div>
      <UserAccess />
    </template>
  </AppPage>
</template>
