<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { t } = useI18n()
const { isLoggedIn } = useMongocampAuth()
const isProxyMode = useMongocampProxyMode()
const paths = useMongocampPaths()

useHead({ title: () => `${t('serverManagement.app.name')} ${t('serverManagement.app.product')}` })

// API key mode has nothing to sign in to, so the console opens straight away
if (isLoggedIn.value || isProxyMode) {
  await navigateTo(paths.home, { replace: true })
}

// Set by middleware/signed-out.global.ts; shown once, then a fresh sign-in starts clean
const signedOut = useState('signed-out', () => false)
const showSignedOut = ref(signedOut.value)
signedOut.value = false
</script>

<template>
  <div class="grid min-h-svh lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
    <!-- The one bold moment: the camp's terrain and what the console is for -->
    <section class="relative flex min-h-56 flex-col justify-between overflow-hidden bg-muted p-6 sm:p-10 lg:min-h-svh">
      <ContourArtwork
        camp
        class="absolute inset-0 size-full"
      />
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

      <!-- Side by side, the form sits on the same bottom line as the headline across the page -->
      <div class="flex flex-1 items-center justify-center py-8 lg:items-end lg:pb-0">
        <div
          v-if="!isLoggedIn"
          class="flex w-full max-w-sm flex-col gap-4"
        >
          <UAlert
            v-if="showSignedOut"
            color="success"
            variant="subtle"
            icon="i-lucide-log-out"
            :title="t('serverManagement.login.signedOut')"
            role="status"
          />
          <MongocampLogin :redirect-path="paths.home" />
        </div>
      </div>
    </section>
  </div>
</template>
