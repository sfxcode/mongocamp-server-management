<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const { t } = useI18n()
const { isLoggedIn } = useMongocampAuth()
const isProxyMode = useProxyMode()

const notFound = computed(() => props.error.statusCode === 404)
const signedIn = computed(() => isProxyMode || isLoggedIn.value)

useHead({ title: () => notFound.value ? t('serverManagement.error.notFoundTitle') : t('serverManagement.error.otherTitle') })

function leave() {
  clearError({ redirect: signedIn.value ? '/secured' : '/' })
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
          {{ notFound ? t('serverManagement.error.notFoundTitle') : t('serverManagement.error.otherTitle') }}
        </h1>
        <p class="mt-3 max-w-md text-muted">
          {{ notFound ? t('serverManagement.error.notFoundText') : t('serverManagement.error.otherText') }}
        </p>
        <div class="mt-6">
          <UButton @click="leave">
            {{ signedIn ? t('serverManagement.error.home') : t('serverManagement.error.login') }}
          </UButton>
        </div>
      </main>
    </div>
  </UApp>
</template>
