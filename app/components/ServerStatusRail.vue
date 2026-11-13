<script setup lang="ts">
/**
 * Which server this console talks to and how it is doing: name, MongoCamp and MongoDB version,
 * connections and uptime. Refreshes every 30 s while the tab is visible. Every part is optional —
 * a role that may not read the load, or an older server, simply shows less.
 */
defineProps<{
  collapsed?: boolean
}>()

type Health = 'ok' | 'partial' | 'down'

const { t } = useI18n()
const { $mongocampVersion } = useNuxtApp()
const { getStats, getServerInfo } = useMongocampSystem()
const { isAdmin } = useConsoleRoles()

const mongoVersion = ref<string>()
const connections = ref<{ current: number, available: number }>()
const uptimeSeconds = ref<number>()
const health = ref<Health>('partial')

const server = computed(() => $mongocampVersion.value)

async function load() {
  const [stats, info] = await Promise.allSettled([getStats(), getServerInfo()])

  if (info.status === 'fulfilled') mongoVersion.value = info.value.mongoDbVersion

  if (stats.status === 'fulfilled') {
    const current = stats.value.connections?.current
    const available = stats.value.connections?.available
    connections.value = typeof current === 'number' && typeof available === 'number' ? { current, available } : undefined
    uptimeSeconds.value = typeof stats.value.uptimeSeconds === 'number' ? stats.value.uptimeSeconds : undefined
    health.value = connections.value ? 'ok' : 'partial'
    return
  }

  connections.value = undefined
  uptimeSeconds.value = undefined
  if (info.status === 'fulfilled') {
    health.value = 'partial'
    return
  }
  health.value = 'down'
  // Lets the refresh loop back off while the server is away
  throw stats.reason
}

const { start } = useMongocampAutoRefresh(load, { intervalMs: 30_000 })

onMounted(() => {
  load().catch(() => {})
  start()
})

const usage = computed(() => {
  if (!connections.value) return undefined
  const total = connections.value.current + connections.value.available
  return total > 0 ? Math.min(100, Math.round((connections.value.current / total) * 100)) : 0
})

const uptime = computed(() => {
  const seconds = uptimeSeconds.value
  if (seconds === undefined) return undefined
  const days = Math.floor(seconds / 86_400)
  if (days >= 1) return t('serverManagement.rail.days', { n: days })
  const hours = Math.floor(seconds / 3600)
  if (hours >= 1) return t('serverManagement.rail.hours', { n: hours })
  return t('serverManagement.rail.minutes', { n: Math.max(1, Math.floor(seconds / 60)) })
})

const healthLabel = computed(() => ({
  ok: t('serverManagement.rail.reachable'),
  partial: t('serverManagement.rail.partial'),
  down: t('serverManagement.rail.down'),
}[health.value]))

const dotClass = computed(() => ({
  ok: 'bg-success',
  partial: 'bg-warning',
  down: 'bg-error',
}[health.value]))

const versions = computed(() => [
  server.value?.version ? `MongoCamp ${server.value.version}` : undefined,
  mongoVersion.value ? `MongoDB ${mongoVersion.value}` : undefined,
].filter((entry): entry is string => Boolean(entry)))
</script>

<template>
  <UTooltip
    v-if="collapsed"
    :text="healthLabel"
    :content="{ side: 'right' }"
  >
    <div
      class="flex justify-center py-1.5"
      role="status"
      :aria-label="healthLabel"
    >
      <span
        class="size-2.5 rounded-full"
        :class="dotClass"
      />
    </div>
  </UTooltip>

  <component
    :is="isAdmin ? resolveComponent('NuxtLink') : 'div'"
    v-else
    :to="isAdmin ? '/secured/admin/server' : undefined"
    class="flex flex-col gap-1.5 rounded-md px-2.5 py-2 text-xs"
    :class="isAdmin ? 'hover:bg-elevated' : ''"
    :aria-label="isAdmin ? t('serverManagement.rail.details') : undefined"
  >
    <div
      class="flex items-center gap-2"
      role="status"
    >
      <span
        class="size-2 shrink-0 rounded-full"
        :class="dotClass"
        aria-hidden="true"
      />
      <span class="truncate font-medium text-highlighted">{{ health === 'down' ? healthLabel : (server?.name ?? healthLabel) }}</span>
      <span class="sr-only">{{ healthLabel }}</span>
    </div>

    <div
      v-for="entry in versions"
      :key="entry"
      class="truncate text-muted"
    >
      {{ entry }}
    </div>

    <template v-if="connections && usage !== undefined">
      <div class="mt-1 flex items-baseline justify-between gap-2 text-muted">
        <span>{{ t('serverManagement.rail.connections') }}</span>
        <span class="tabular text-default">{{ connections.current.toLocaleString() }}</span>
      </div>
      <div
        class="h-1 overflow-hidden rounded-full bg-accented"
        role="meter"
        :aria-label="t('serverManagement.rail.connections')"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="usage"
      >
        <div
          class="h-full rounded-full bg-secondary"
          :style="{ width: `${Math.max(usage, 2)}%` }"
        />
      </div>
    </template>

    <div
      v-if="uptime"
      class="text-dimmed"
    >
      {{ t('serverManagement.rail.uptime', { time: uptime }) }}
    </div>
  </component>
</template>
