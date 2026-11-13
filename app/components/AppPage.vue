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
      <div
        v-if="$slots.toolbar"
        class="flex shrink-0 items-center gap-2 border-b border-default px-4 sm:px-6"
      >
        <slot name="toolbar" />
      </div>
    </template>

    <template #body>
      <main
        id="main"
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
      </main>
    </template>
  </UDashboardPanel>
</template>
