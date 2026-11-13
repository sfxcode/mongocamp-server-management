<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <AppPage
    :title="t('serverManagement.nav.admin')"
    heading
    width="default"
  >
    <DestinationList />
  </AppPage>
</template>
