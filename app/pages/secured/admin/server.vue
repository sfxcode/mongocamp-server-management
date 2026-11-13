<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <AppPage
    :title="t('serverManagement.nav.server')"
    heading
    :description="t('serverManagement.home.serverText')"
    width="default"
  >
    <MongocampServerInfo
      hide-heading
      :auto-refresh="30"
    />
  </AppPage>
</template>
