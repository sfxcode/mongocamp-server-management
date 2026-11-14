<script setup lang="ts">
/**
 * The frame of every signed-in page: a navbar with the breadcrumb and page actions,
 * an optional toolbar row (tabs), and the padded body at one of three widths.
 * Most module components bring their own heading, so `title` only shows when given.
 */
const props = withDefaults(defineProps<{
  /** Document title, and the heading when `heading` is set */
  title: string
  description?: string
  /** Show the title as the page heading (for components that have none of their own) */
  heading?: boolean
  width?: 'narrow' | 'default' | 'full'
}>(), {
  description: undefined,
  heading: false,
  width: 'full',
})

const { t } = useI18n()
const breadcrumbs = useBreadcrumbs()
const parent = computed(() => breadcrumbs.value.at(-2))

useHead({
  title: () => `${props.title} · ${t('serverManagement.app.name')} ${t('serverManagement.app.product')}`,
})

const widthClass = computed(() => ({
  narrow: 'max-w-2xl',
  default: 'max-w-5xl',
  full: 'max-w-none',
}[props.width]))
</script>

<template>
  <UDashboardPanel :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <UDashboardNavbar :ui="{ left: 'flex-1' }">
        <!-- #left, not #title: the navbar wraps its title in an h1, and the page heading is the h1 -->
        <template #left>
          <UDashboardSidebarCollapse />
          <slot name="leading" />
          <!-- Phones show only the last breadcrumb, so the way up gets its own button -->
          <UButton
            v-if="parent?.to"
            :to="parent.to"
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            class="sm:hidden"
            :aria-label="t('serverManagement.nav.back', { page: parent.label })"
          />
          <UBreadcrumb
            :items="breadcrumbs"
            :ui="{ list: 'min-w-0 max-sm:[&>li:not(:last-child)]:hidden', item: 'min-w-0', link: 'min-w-0 font-medium', linkLabel: 'truncate max-w-48 sm:max-w-80' }"
            class="min-w-0"
          />
        </template>
        <template #right>
          <slot name="actions" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- Focusable so navigation can move focus here (plugins/focus-main.client.ts); the toolbar is inside so
           the skip link and the main landmark start at the collection's heading, not after it -->
      <main
        id="main"
        tabindex="-1"
        class="flex flex-1 flex-col outline-none"
      >
        <div
          v-if="$slots.toolbar"
          class="sticky top-0 z-20 flex shrink-0 flex-wrap items-center gap-x-2 border-b border-default bg-default px-4 sm:px-6"
        >
          <slot name="toolbar" />
        </div>
        <div
          class="flex w-full flex-col gap-6 p-4 sm:p-6"
          :class="widthClass"
        >
          <header v-if="heading">
            <h1 class="text-xl font-semibold text-highlighted">
              {{ title }}
            </h1>
            <p
              v-if="description"
              class="mt-1 max-w-prose text-sm text-muted"
            >
              {{ description }}
            </p>
          </header>
          <slot />
        </div>
      </main>
    </template>
  </UDashboardPanel>
</template>
