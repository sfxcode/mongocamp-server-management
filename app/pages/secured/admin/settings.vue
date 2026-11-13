<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <AppPage
    :title="t('serverManagement.nav.settings')"
    heading
    :description="t('serverManagement.home.settingsText')"
    width="default"
  >
    <MongocampSettings hide-heading />
  </AppPage>
</template>
