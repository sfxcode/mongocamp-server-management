<script setup lang="ts">
const { t } = useI18n()
const items = useNavItems()
const paletteOpen = useState('command-palette-open', () => false)

function openPalette() {
  paletteOpen.value = true
}
</script>

<template>
  <UDashboardSidebar
    id="app-sidebar"
    collapsible
    resizable
    :min-size="13"
    :default-size="15"
    :max-size="22"
    :ui="{ footer: 'flex-col items-stretch gap-2 border-t border-default py-3' }"
  >
    <template #header="{ collapsed }">
      <NuxtLink
        to="/secured"
        class="flex min-w-0 items-center gap-2.5"
        :aria-label="t('serverManagement.app.name')"
      >
        <AppLogo class="size-7 shrink-0" />
        <span
          v-if="!collapsed"
          class="flex min-w-0 flex-col leading-tight"
        >
          <span class="truncate text-sm font-bold text-highlighted">{{ t('serverManagement.app.name') }}</span>
          <span class="truncate text-xs text-muted">{{ t('serverManagement.app.product') }}</span>
        </span>
      </NuxtLink>
    </template>

    <template #default="{ collapsed }">
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-search"
        :square="collapsed"
        :block="!collapsed"
        :aria-label="t('serverManagement.nav.searchHint')"
        class="justify-start bg-default"
        @click="openPalette"
      >
        <template v-if="!collapsed">
          <span class="flex-1 text-start font-normal text-muted">{{ t('serverManagement.nav.search') }}</span>
          <span class="flex gap-0.5">
            <UKbd value="meta" />
            <UKbd value="K" />
          </span>
        </template>
      </UButton>

      <nav :aria-label="t('serverManagement.app.product')">
        <UNavigationMenu
          :items="items"
          :collapsed="collapsed"
          orientation="vertical"
          tooltip
        />
      </nav>
    </template>

    <template #footer="{ collapsed }">
      <ServerStatusRail :collapsed="collapsed" />
      <AppUserMenu :collapsed="collapsed" />
    </template>
  </UDashboardSidebar>
</template>
