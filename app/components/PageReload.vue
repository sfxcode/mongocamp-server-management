<script setup lang="ts">
/**
 * The page header's reload button: calls `refresh()` of the module component the page holds a ref to.
 * A reload that brings unchanged data looks like nothing happened, so it briefly shows a check and says so.
 */
const props = defineProps<{
  target: { refresh: () => unknown } | null
}>()

const { t } = useI18n()
const busy = ref(false)
const done = ref(false)
let doneTimer: ReturnType<typeof setTimeout> | undefined

async function reload() {
  if (busy.value) return
  busy.value = true
  done.value = false
  try {
    await props.target?.refresh()
    done.value = true
    clearTimeout(doneTimer)
    doneTimer = setTimeout(() => {
      done.value = false
    }, 1500)
  }
  finally {
    busy.value = false
  }
}

// The `r` shortcut (useConsoleShortcuts) runs this same reload
const unregister = usePageReload().register(reload)

onBeforeUnmount(() => {
  clearTimeout(doneTimer)
  unregister()
})
</script>

<template>
  <UTooltip :text="t('serverManagement.app.reload')">
    <UButton
      :icon="done ? 'i-lucide-check' : 'i-lucide-refresh-cw'"
      color="neutral"
      variant="ghost"
      :loading="busy"
      :aria-label="t('serverManagement.app.reload')"
      @click="reload"
    />
  </UTooltip>
  <span
    class="sr-only"
    aria-live="polite"
  >{{ done ? t('serverManagement.app.reloaded') : '' }}</span>
</template>
