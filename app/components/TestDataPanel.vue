<script setup lang="ts">
/**
 * Reset or drop the demo data. The reset is a real sequence, so each step shows its own state;
 * a failing step stops the run and is named.
 */
const emit = defineEmits<{
  changed: []
}>()

type StepStatus = 'pending' | 'running' | 'done' | 'failed'
type PendingAction = 'reset' | 'drop' | null

const { t } = useI18n()
const toast = useToast()
const { resetSteps, dropAll, collectionNames, bucketName } = useTestData()
// The shared list is loaded by the collection panel, which the dashboard does not have
const { names, buckets, load } = useMongocampCollectionNames()
onMounted(() => load())

const pendingAction = ref<PendingAction>(null)
// Which action runs, so only its own button spins and the other one waits disabled
const runningAction = ref<PendingAction>(null)
const running = computed(() => runningAction.value !== null)
// The step list belongs to the action that ran last: a drop is a single step, a reset all of them
const lastAction = ref<PendingAction>(null)
const statuses = ref<Record<string, StepStatus>>({})
const hasRun = computed(() => Object.keys(statuses.value).length > 0)

const steps = computed(() => resetSteps
  .filter(step => lastAction.value !== 'drop' || step.key === 'drop')
  .map(step => ({
    key: step.key,
    label: step.key === 'drop' ? t('serverManagement.testData.stepDrop') : step.label,
    isName: step.key !== 'drop',
    status: statuses.value[step.key] ?? 'pending',
  })))

// A reset replaces whatever demo data is there; the confirmation says so when there is some
const existing = computed(() => collectionNames.filter(name => names.value.includes(name)).length
  + (buckets.value.includes(bucketName) ? 1 : 0))

const STATUS_ICON: Record<StepStatus, string> = {
  pending: 'i-lucide-circle-dashed',
  running: 'i-lucide-loader-circle',
  done: 'i-lucide-circle-check',
  failed: 'i-lucide-circle-x',
}

const STATUS_CLASS: Record<StepStatus, string> = {
  pending: 'text-dimmed',
  running: 'text-primary animate-spin',
  done: 'text-success',
  failed: 'text-error',
}

function askReset() {
  pendingAction.value = 'reset'
}

function askDrop() {
  pendingAction.value = 'drop'
}

function cancel() {
  pendingAction.value = null
}

async function runReset() {
  statuses.value = Object.fromEntries(resetSteps.map(step => [step.key, 'pending' as StepStatus]))
  for (const step of resetSteps) {
    statuses.value[step.key] = 'running'
    try {
      await step.run()
      statuses.value[step.key] = 'done'
    }
    catch {
      statuses.value[step.key] = 'failed'
      const label = step.key === 'drop' ? t('serverManagement.testData.stepDrop') : step.label
      toast.add({ title: t('serverManagement.testData.resetFailed', { step: label }), color: 'error' })
      return
    }
  }
  toast.add({ title: t('serverManagement.testData.resetDone'), color: 'success' })
}

async function runDrop() {
  statuses.value = { drop: 'running' }
  try {
    await dropAll()
    statuses.value.drop = 'done'
    toast.add({ title: t('serverManagement.testData.dropDone'), color: 'success' })
  }
  catch {
    statuses.value.drop = 'failed'
    toast.add({ title: t('serverManagement.testData.dropFailed'), color: 'error' })
  }
}

async function confirm() {
  const action = pendingAction.value
  pendingAction.value = null
  if (!action || running.value) return
  runningAction.value = action
  lastAction.value = action
  try {
    if (action === 'reset') await runReset()
    else await runDrop()
  }
  finally {
    runningAction.value = null
    emit('changed')
  }
}

const isConfirmOpen = computed({
  get: () => pendingAction.value !== null,
  set: (open) => {
    if (!open) cancel()
  },
})
</script>

<template>
  <section
    class="flex flex-col gap-4 rounded-md border border-default p-4"
    aria-labelledby="test-data-title"
  >
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2
          id="test-data-title"
          class="font-semibold text-highlighted"
        >
          {{ t('serverManagement.testData.title') }}
        </h2>
        <p class="mt-0.5 text-sm text-muted">
          {{ t('serverManagement.testData.text') }}
        </p>
      </div>
      <div class="flex gap-2">
        <UButton
          icon="i-lucide-rotate-ccw"
          color="neutral"
          variant="outline"
          :loading="runningAction === 'reset'"
          :disabled="runningAction === 'drop'"
          @click="askReset"
        >
          {{ t('serverManagement.testData.reset') }}
        </UButton>
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          :loading="runningAction === 'drop'"
          :disabled="runningAction === 'reset'"
          @click="askDrop"
        >
          {{ t('serverManagement.testData.drop') }}
        </UButton>
      </div>
    </div>

    <ol
      v-if="hasRun"
      class="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2 lg:grid-cols-4"
    >
      <li
        v-for="step in steps"
        :key="step.key"
        class="flex items-center gap-2"
      >
        <UIcon
          :name="STATUS_ICON[step.status]"
          class="size-4 shrink-0"
          :class="STATUS_CLASS[step.status]"
          aria-hidden="true"
        />
        <span :class="[step.isName ? 'font-mono' : '', step.status === 'pending' ? 'text-muted' : 'text-default']">{{ step.label }}</span>
        <span class="sr-only">{{ t(`serverManagement.testData.${step.status}`) }}</span>
      </li>
    </ol>

    <UModal
      v-model:open="isConfirmOpen"
      :title="pendingAction === 'drop' ? t('serverManagement.testData.dropConfirmTitle') : t('serverManagement.testData.resetConfirmTitle')"
      :description="pendingAction === 'drop' ? t('serverManagement.testData.dropConfirmText') : t('serverManagement.testData.resetConfirmText')"
    >
      <template
        v-if="pendingAction === 'reset' && existing > 0"
        #body
      >
        <UAlert
          color="warning"
          variant="subtle"
          icon="i-lucide-triangle-alert"
          :title="t('serverManagement.testData.resetExisting', { n: existing }, existing)"
        />
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            @click="cancel"
          >
            {{ t('nuxtUiMongocamp.common.cancel') }}
          </UButton>
          <!-- Both replace data on the server, so both confirm in the destructive colour -->
          <UButton
            color="error"
            @click="confirm"
          >
            {{ pendingAction === 'drop' ? t('serverManagement.testData.drop') : t('serverManagement.testData.reset') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </section>
</template>
