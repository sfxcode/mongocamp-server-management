<script setup lang="ts">
import type { ConsoleShortcut } from '~/composables/useConsoleShortcuts'

/** The `?` dialog: every shortcut that works on the current page, generated from the same list that binds them. */
const props = defineProps<{
  shortcuts: ConsoleShortcut[]
}>()

const { t } = useI18n()
const open = useState('shortcuts-help-open', () => false)

const groups = computed(() => (['general', 'navigation', 'collection'] as const)
  .map(group => ({ group, items: props.shortcuts.filter(item => item.group === group) }))
  .filter(entry => entry.items.length > 0))
</script>

<template>
  <UModal
    v-model:open="open"
    :title="t('serverManagement.shortcuts.title')"
    :description="t('serverManagement.shortcuts.description')"
  >
    <template #body>
      <div class="flex flex-col gap-5">
        <section
          v-for="entry in groups"
          :key="entry.group"
        >
          <h3 class="mb-1 text-xs font-medium text-muted">
            {{ t(`serverManagement.shortcuts.group.${entry.group}`) }}
          </h3>
          <dl class="divide-y divide-default">
            <div
              v-for="item in entry.items"
              :key="item.keys"
              class="flex items-center justify-between gap-4 py-2 text-sm"
            >
              <dt class="text-default">
                {{ t(`serverManagement.shortcuts.${item.labelKey}`) }}
              </dt>
              <dd class="flex shrink-0 items-center gap-1">
                <template
                  v-for="(key, index) in item.keys.split('-')"
                  :key="index"
                >
                  <span
                    v-if="index > 0"
                    class="text-xs text-muted"
                  >{{ t('serverManagement.shortcuts.then') }}</span>
                  <UKbd :value="key" />
                </template>
              </dd>
            </div>
          </dl>
        </section>
        <p class="text-xs text-muted">
          {{ t('serverManagement.shortcuts.palette') }}
        </p>
      </div>
    </template>
  </UModal>
</template>
