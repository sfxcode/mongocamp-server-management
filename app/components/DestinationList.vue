<script setup lang="ts">
/** The admin destinations as a compact two-column link list: icon, name, what is there. */
const { t } = useI18n()

const destinations = computed(() => ([
  ['collections', 'i-lucide-database'],
  ['users', 'i-lucide-users'],
  ['roles', 'i-lucide-shield'],
  ['permissions', 'i-lucide-key-round'],
  ['overview', 'i-lucide-gauge'],
  ['server', 'i-lucide-activity'],
  ['jobs', 'i-lucide-clock'],
  ['databases', 'i-lucide-hard-drive'],
  ['settings', 'i-lucide-settings'],
] as const).map(([key, icon]) => ({
  key,
  icon,
  to: `/secured/admin/${key}`,
  label: t(`serverManagement.nav.${key}`),
  text: t(`serverManagement.home.${key}Text`),
})))
</script>

<template>
  <nav :aria-label="t('serverManagement.home.destinations')">
    <ul class="grid gap-x-6 sm:grid-cols-2 xl:grid-cols-3">
      <li
        v-for="destination in destinations"
        :key="destination.key"
        class="border-b border-default"
      >
        <NuxtLink
          :to="destination.to"
          class="group flex items-center gap-3 py-3"
        >
          <UIcon
            :name="destination.icon"
            class="size-5 shrink-0 text-muted group-hover:text-primary"
            aria-hidden="true"
          />
          <span class="min-w-0 flex-1">
            <span class="block text-sm font-medium text-highlighted group-hover:text-primary">{{ destination.label }}</span>
            <span class="block truncate text-sm text-muted">{{ destination.text }}</span>
          </span>
          <UIcon
            name="i-lucide-chevron-right"
            class="size-4 shrink-0 text-dimmed"
            aria-hidden="true"
          />
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
