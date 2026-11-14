<script setup lang="ts">
/** Frame shared by the signed-in layouts: sidebar, whatever the layout puts in, command palette, shortcuts. */
const { open } = useCommandPalette()
const shortcuts = useConsoleShortcuts()

defineShortcuts(computed(() => Object.fromEntries(shortcuts.value.map(item => [item.keys, item.run]))))
</script>

<template>
  <UDashboardGroup unit="rem">
    <AppSidebar />
    <slot />
    <MongocampCommandPalette v-model:open="open" />
    <ShortcutsHelp :shortcuts="shortcuts" />
  </UDashboardGroup>
</template>
