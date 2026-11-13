<script setup lang="ts">
/** Language and light/dark switch for screens without the sidebar's account menu. */
const { t, locale, setLocale } = useI18n()

function toggleLocale() {
  setLocale(locale.value === 'en' ? 'de' : 'en')
}
</script>

<template>
  <div class="flex items-center gap-1">
    <UButton
      color="neutral"
      variant="ghost"
      icon="i-lucide-languages"
      :label="locale.toUpperCase()"
      :aria-label="t('serverManagement.user.language')"
      @click="toggleLocale"
    />
    <UColorModeButton />
  </div>
</template>
