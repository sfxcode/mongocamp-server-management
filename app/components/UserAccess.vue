<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

/**
 * What the signed-in (non-administrator) user may do, per collection. The server resolves roles and
 * grants (`GET /auth/permissions`); administrators may do everything and are not asked.
 */
interface AccessRow {
  name: string
  read: boolean
  write: boolean
  administrate: boolean
}

const { t } = useI18n()
const { authApi } = useMongocampClientApi()
const { isAdmin } = useConsoleRoles()

const access = ref<AccessRow[]>([])
const loading = ref(false)
const failed = ref(false)

async function load() {
  if (isAdmin.value) return
  loading.value = true
  failed.value = false
  try {
    const rows = await authApi.userPermissions({}, { signal: AbortSignal.timeout(15_000) })
    access.value = rows
      .filter(row => typeof row.name === 'string' && !row.name.startsWith('mc_'))
      .map(row => ({ name: row.name, read: row.read === true, write: row.write === true, administrate: row.administrate === true }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }
  catch {
    failed.value = true
  }
  finally {
    loading.value = false
  }
}

onMounted(load)

const stats = computed(() => [
  { label: t('serverManagement.access.collections'), value: access.value.length },
  { label: t('serverManagement.access.canRead'), value: access.value.filter(row => row.read).length },
  { label: t('serverManagement.access.canWrite'), value: access.value.filter(row => row.write).length },
  { label: t('serverManagement.access.canAdministrate'), value: access.value.filter(row => row.administrate).length },
])

const columns = computed<TableColumn<AccessRow>[]>(() => [
  { accessorKey: 'name', header: t('serverManagement.access.collection') },
  { accessorKey: 'read', header: t('serverManagement.access.read') },
  { accessorKey: 'write', header: t('serverManagement.access.write') },
  { accessorKey: 'administrate', header: t('serverManagement.access.administrate') },
])

const FLAGS = ['read', 'write', 'administrate'] as const
</script>

<template>
  <section
    class="flex flex-col gap-4"
    aria-labelledby="user-access-title"
  >
    <div class="flex items-center justify-between gap-3">
      <h2
        id="user-access-title"
        class="font-semibold text-highlighted"
      >
        {{ t('serverManagement.access.title') }}
      </h2>
      <UButton
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="ghost"
        :loading="loading"
        :aria-label="t('serverManagement.access.reload')"
        @click="load"
      />
    </div>

    <dl class="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-default bg-(--ui-border) lg:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="flex flex-col-reverse gap-1 bg-default px-4 py-3"
      >
        <dt class="text-sm text-muted">
          {{ stat.label }}
        </dt>
        <dd class="tabular text-2xl font-semibold text-highlighted">
          {{ loading ? '…' : stat.value }}
        </dd>
      </div>
    </dl>

    <UAlert
      v-if="failed"
      color="error"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      :title="t('serverManagement.access.failed')"
      :actions="[{ label: t('serverManagement.access.retry'), color: 'error', variant: 'outline', onClick: load }]"
    />

    <MongocampEmptyState
      v-else-if="!loading && access.length === 0"
      icon="i-lucide-lock"
      :title="t('serverManagement.access.emptyTitle')"
      :description="t('serverManagement.access.emptyText')"
    />

    <UTable
      v-else
      :data="access"
      :columns="columns"
      :loading="loading"
    >
      <template #name-cell="{ row }">
        <span class="font-mono text-highlighted">{{ row.original.name }}</span>
      </template>
      <template
        v-for="flag in FLAGS"
        :key="flag"
        #[`${flag}-cell`]="{ row }"
      >
        <span
          class="inline-flex items-center gap-1.5"
          :class="row.original[flag] ? 'text-default' : 'text-dimmed'"
        >
          <UIcon
            :name="row.original[flag] ? 'i-lucide-check' : 'i-lucide-minus'"
            class="size-4"
            :class="row.original[flag] ? 'text-success' : ''"
            aria-hidden="true"
          />
          {{ row.original[flag] ? t('serverManagement.access.yes') : t('serverManagement.access.no') }}
        </span>
      </template>
    </UTable>
  </section>
</template>
