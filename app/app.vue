<script setup lang="ts">
const { t, locale } = useI18n()

useHead({ htmlAttrs: { lang: () => locale.value } })
</script>

<template>
  <UApp>
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-default focus:px-3 focus:py-2 focus:text-sm focus:ring focus:ring-default"
    >
      {{ t('serverManagement.app.skip') }}
    </a>
    <NuxtLoadingIndicator color="var(--ui-primary)" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
