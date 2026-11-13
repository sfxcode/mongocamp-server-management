// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

// Own config: the repository's root config skips this (git-excluded) folder.
// Run from this folder: pnpm exec eslint .
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
