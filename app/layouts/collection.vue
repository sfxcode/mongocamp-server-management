<script setup lang="ts">
/** The default shell plus the collection panel: a second column on wide screens, a drawer below. */
const { t } = useI18n()
const route = useRoute()
const paletteOpen = useState('command-palette-open', () => false)
const drawerOpen = useState('collection-drawer-open', () => false)

// Choosing a collection in the drawer closes it
watch(() => route.path, () => {
  drawerOpen.value = false
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <AppSidebar />

    <UDashboardPanel
      id="collection-panel"
      resizable
      :min-size="12"
      :default-size="16"
      :max-size="26"
      class="hidden xl:flex"
      :ui="{ body: 'p-0 sm:p-0 gap-0 sm:gap-0' }"
    >
      <template #body>
        <CollectionPanel />
      </template>
    </UDashboardPanel>

    <slot />

    <USlideover
      v-model:open="drawerOpen"
      side="left"
      :title="t('serverManagement.nav.collections')"
      :ui="{ body: 'p-0 sm:p-0 flex flex-col', content: 'max-w-xs' }"
    >
      <template #body>
        <CollectionPanel />
      </template>
    </USlideover>

    <MongocampCommandPalette
      v-model:open="paletteOpen"
      logout-path="/logout"
    />
  </UDashboardGroup>
</template>
