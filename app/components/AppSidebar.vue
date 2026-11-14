<script setup lang="ts">
const { t } = useI18n()
const items = useNavItems()
const paths = useMongocampPaths()
const { show: openPalette } = useCommandPalette()
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
        :to="paths.home"
        class="flex min-w-0 items-center gap-2.5"
        :aria-label="collapsed ? t('serverManagement.app.name') : undefined"
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
        :aria-label="collapsed ? `${t('serverManagement.nav.search')}: ${t('serverManagement.nav.searchHint')}` : undefined"
        class="justify-start bg-default"
        @click="openPalette"
      >
        <!-- Expanded, the visible word is the name (voice control: "click Search"); the hint is read after it -->
        <template v-if="!collapsed">
          <span class="flex-1 text-start font-normal text-muted">
            {{ t('serverManagement.nav.search') }}<span class="sr-only">: {{ t('serverManagement.nav.searchHint') }}</span>
          </span>
          <span
            class="flex gap-0.5"
            aria-hidden="true"
          >
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
      <MongocampServerStatus
        :collapsed="collapsed"
        :class="collapsed ? '' : 'px-2.5 py-2'"
      />
      <AppUserMenu :collapsed="collapsed" />
    </template>
  </UDashboardSidebar>
</template>
