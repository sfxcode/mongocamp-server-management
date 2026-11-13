<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { t } = useI18n()
const { isLoggedIn } = useMongocampAuth()
const isProxyMode = useProxyMode()

useHead({ title: () => `${t('serverManagement.app.name')} ${t('serverManagement.app.product')}` })

if (isLoggedIn.value) {
  await navigateTo('/secured')
}
</script>

<template>
  <div class="grid min-h-svh lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
    <!-- The one bold moment: the camp's terrain and what the console is for -->
    <section class="relative flex min-h-56 flex-col justify-between overflow-hidden bg-muted p-6 sm:p-10 lg:min-h-svh">
      <ContourArtwork class="absolute inset-0 size-full" />
      <!-- Lets the lines run out under the headline instead of crossing it -->
      <div
        class="absolute inset-x-0 bottom-0 h-3/4"
        style="background: linear-gradient(to top, var(--ui-bg-muted) 42%, transparent)"
      />

      <div class="relative flex items-center gap-2.5">
        <AppLogo class="size-8" />
        <span class="flex flex-col leading-tight">
          <span class="text-sm font-bold text-highlighted">{{ t('serverManagement.app.name') }}</span>
          <span class="text-xs text-muted">{{ t('serverManagement.app.product') }}</span>
        </span>
      </div>

      <div class="relative mt-10 max-w-xl">
        <h1 class="text-3xl font-bold leading-[1.1] tracking-tight text-highlighted sm:text-4xl lg:text-5xl">
          {{ t('serverManagement.login.headline') }}
        </h1>
        <p class="mt-4 hidden max-w-md text-base text-muted sm:block">
          {{ t('serverManagement.login.lead') }}
        </p>
        <MongocampVersion
          hide-database
          class="mt-6"
        />
      </div>
    </section>

    <section class="relative flex flex-col p-6 sm:p-10">
      <AppDisplayControls class="self-end" />

      <div class="flex flex-1 items-center justify-center py-8">
        <div
          v-if="isProxyMode"
          class="flex w-full max-w-sm flex-col gap-3"
        >
          <h2 class="text-xl font-semibold text-highlighted">
            {{ t('serverManagement.login.proxyTitle') }}
          </h2>
          <p class="text-sm text-muted">
            {{ t('serverManagement.login.proxyText') }}
          </p>
          <div>
            <UButton to="/secured">
              {{ t('serverManagement.login.proxyOpen') }}
            </UButton>
          </div>
        </div>

        <div
          v-else-if="!isLoggedIn"
          class="w-full max-w-sm"
        >
          <MongocampLogin redirect-path="/secured" />
        </div>
      </div>
    </section>
  </div>
</template>
