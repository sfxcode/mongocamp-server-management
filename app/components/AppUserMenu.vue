<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const { t, locale, setLocale } = useI18n()
const colorMode = useColorMode()
const state = useMongocampStorage()
const { isAdmin, isManager } = useConsoleRoles()
const isProxyMode = useProxyMode()

const name = computed(() => isProxyMode ? t('serverManagement.user.apiKey') : (state.value?.profile?.user ?? ''))

const role = computed(() => {
  if (isProxyMode) return t('serverManagement.user.administrator')
  if (isAdmin.value) return t('serverManagement.user.administrator')
  if (isManager.value) return t('serverManagement.user.manager')
  return t('serverManagement.user.standard')
})

function chooseLocale(code: 'en' | 'de') {
  setLocale(code)
}

function chooseAppearance(preference: string) {
  colorMode.preference = preference
}

const items = computed<DropdownMenuItem[][]>(() => {
  const appearance = (['light', 'dark', 'system'] as const).map(preference => ({
    label: t(`serverManagement.user.${preference}`),
    type: 'checkbox' as const,
    checked: colorMode.preference === preference,
    onSelect: () => chooseAppearance(preference),
  }))
  const languages = ([['en', 'English'], ['de', 'Deutsch']] as const).map(([code, label]) => ({
    label,
    type: 'checkbox' as const,
    checked: locale.value === code,
    onSelect: () => chooseLocale(code),
  }))

  const groups: DropdownMenuItem[][] = [
    [{ type: 'label', label: name.value, description: role.value }],
    [
      ...(isProxyMode ? [] : [{ label: t('serverManagement.nav.account'), icon: 'i-lucide-circle-user', to: '/secured/account' }]),
      { label: t('serverManagement.user.language'), icon: 'i-lucide-languages', children: languages },
      { label: t('serverManagement.user.appearance'), icon: 'i-lucide-sun-moon', children: appearance },
    ],
  ]
  // Nothing to log out of in API key mode
  if (!isProxyMode) {
    groups.push([{ label: t('serverManagement.user.logout'), icon: 'i-lucide-log-out', to: '/logout' }])
  }
  return groups
})
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'start', side: 'top' }"
    :ui="{ content: 'min-w-56' }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      :aria-label="t('serverManagement.user.menu')"
      class="justify-start data-[state=open]:bg-elevated"
      :class="collapsed ? 'justify-center' : ''"
    >
      <UAvatar
        :alt="name"
        size="xs"
      />
      <span
        v-if="!collapsed"
        class="flex min-w-0 flex-1 flex-col items-start"
      >
        <span class="truncate text-sm font-medium text-highlighted">{{ name }}</span>
        <span class="truncate text-xs font-normal text-muted">{{ role }}</span>
      </span>
      <UIcon
        v-if="!collapsed"
        name="i-lucide-chevrons-up-down"
        class="size-4 shrink-0 text-dimmed"
      />
    </UButton>
  </UDropdownMenu>
</template>
