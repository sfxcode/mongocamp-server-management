<script setup lang="ts">
/**
 * The admin destinations in the sidebar's three groups (data, access, server), each with what is there. Groups and
 * links come from the module's navigation, so they follow its paths and the signed-in role.
 */
const { t } = useI18n()
const { groups } = useMongocampNavigation()

const destinations = computed(() => groups.value
  .filter(group => group.key !== 'main' && group.items.length > 0)
  .map(group => ({
    key: group.key,
    label: group.label,
    items: group.items.map(item => ({ ...item, text: t(`serverManagement.home.${item.key}Text`) })),
  })))
</script>

<template>
  <nav :aria-label="t('serverManagement.home.destinations')">
    <div class="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
      <section
        v-for="group in destinations"
        :key="group.key"
        :aria-labelledby="`destinations-${group.key}`"
      >
        <h2
          :id="`destinations-${group.key}`"
          class="border-b border-default pb-2 text-xs font-medium text-muted"
        >
          {{ group.label }}
        </h2>
        <ul>
          <li
            v-for="destination in group.items"
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
      </section>
    </div>
  </nav>
</template>
