<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const { t, locale } = useI18n()
const { isLoggedIn } = useMongocampAuth()

// Rendered instead of app.vue, so it sets the document language itself
useHead({ htmlAttrs: { lang: () => locale.value } })
const isProxyMode = useMongocampProxyMode()
const paths = useMongocampPaths()

const signedIn = computed(() => isProxyMode || isLoggedIn.value)

// What went wrong decides the words: a wrong address, a missing right, or a server that does not answer
const kind = computed<'notFound' | 'forbidden' | 'unreachable' | 'other'>(() => {
  const code = Number(props.error.statusCode)
  if (code === 404) return 'notFound'
  if (code === 401 || code === 403) return 'forbidden'
  if (code === 502 || code === 503 || code === 504 || /fetch|network/i.test(props.error.message ?? '')) return 'unreachable'
  return 'other'
})

// The server's own words, when it sent some beyond the generic status text
const detail = computed(() => {
  const message = props.error.statusMessage || props.error.message
  return kind.value === 'notFound' || !message || /^(page )?not found/i.test(message) ? '' : message
})

// Only offered when there is somewhere to go back to inside the console
const canGoBack = import.meta.client && window.history.length > 1

useHead({ title: () => t(`serverManagement.error.${kind.value}Title`) })

function goBack() {
  clearError()
  window.history.back()
}

function leave() {
  clearError({ redirect: signedIn.value ? paths.home : '/' })
}
</script>

<template>
  <UApp>
    <div class="relative flex min-h-svh flex-col overflow-hidden bg-default p-6 sm:p-10">
      <ContourArtwork
        quiet
        class="absolute inset-0 size-full"
      />

      <div class="relative flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <AppLogo class="size-8" />
          <span class="text-sm font-bold text-highlighted">{{ t('serverManagement.app.name') }}</span>
        </div>
        <AppDisplayControls />
      </div>

      <main class="relative flex flex-1 flex-col justify-center">
        <p class="tabular font-mono text-sm text-muted">
          {{ error.statusCode }}
        </p>
        <h1 class="mt-2 max-w-xl text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
          {{ t(`serverManagement.error.${kind}Title`) }}
        </h1>
        <p class="mt-3 max-w-md text-muted">
          {{ t(`serverManagement.error.${kind}Text`) }}
        </p>
        <p
          v-if="detail"
          class="mt-3 max-w-md font-mono text-sm text-muted"
        >
          {{ detail }}
        </p>
        <div class="mt-6 flex flex-wrap gap-2">
          <UButton @click="leave">
            {{ signedIn ? t('serverManagement.error.home') : t('serverManagement.error.login') }}
          </UButton>
          <UButton
            v-if="canGoBack"
            color="neutral"
            variant="outline"
            icon="i-lucide-arrow-left"
            @click="goBack"
          >
            {{ t('serverManagement.error.back') }}
          </UButton>
        </div>
      </main>
    </div>
  </UApp>
</template>
