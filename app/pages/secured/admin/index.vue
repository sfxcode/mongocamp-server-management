<script setup lang="ts">
// The admin destinations live on the dashboard; this address stays for old links and bookmarks
const paths = useMongocampPaths()
await navigateTo(paths.home, { replace: true })
</script>

<template>
  <div />
</template>
