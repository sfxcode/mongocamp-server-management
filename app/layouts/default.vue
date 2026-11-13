<script setup lang="ts">
const paletteOpen = useState('command-palette-open', () => false)
</script>

<template>
  <UDashboardGroup unit="rem">
    <AppSidebar />
    <slot />
    <MongocampCommandPalette
      v-model:open="paletteOpen"
      logout-path="/logout"
    />
  </UDashboardGroup>
</template>
