// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import eslintConfigPrettier from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'

export default withNuxt(
  {
    ignores: [
      '.nuxt',
      'node_modules',
      '.output',
      'dist',
      '.idea',
      'pnpm-lock.yaml',
      '**/pnpm-lock.yaml',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['**/*.vue'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'vue/multi-word-component-names': 'off',
      // Порядок SFC: script → template → style (как в .cursor/rules/nuxt-template.mdc)
      'vue/block-order': [
        'error',
        {
          order: ['script', 'template', 'style'],
        },
      ],
    },
  },
  eslintConfigPrettier,
)
