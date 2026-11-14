// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    stylistic: true,
  },
})
  .append({
    files: ['**/pages/**/*.vue', '**/layouts/**/*.vue', '**/app.vue', '**/error.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  })
