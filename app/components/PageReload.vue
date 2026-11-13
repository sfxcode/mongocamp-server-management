<script setup lang="ts">
/** The page header's reload button: calls `refresh()` of the module component the page holds a ref to. */
const props = defineProps<{
  target: { refresh: () => unknown } | null
}>()

const { t } = useI18n()
const busy = ref(false)

async function reload() {
  if (busy.value) return
  busy.value = true
  try {
    await props.target?.refresh()
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <UTooltip :text="t('serverManagement.app.reload')">
    <UButton
      icon="i-lucide-refresh-cw"
      color="neutral"
      variant="ghost"
      :loading="busy"
      :aria-label="t('serverManagement.app.reload')"
      @click="reload"
    />
  </UTooltip>
</template>
