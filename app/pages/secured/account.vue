<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <AppPage
    :title="t('serverManagement.nav.account')"
    heading
    width="narrow"
  >
    <MongocampAccount />
  </AppPage>
</template>
