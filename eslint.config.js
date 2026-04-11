import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import prettierConfig from 'eslint-config-prettier'

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.tsbuildinfo',
      'apps/**',
      '**/*.test.ts',
    ],
  },
  {
    files: ['packages/**/src/**/*.ts', 'packages/**/src/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['packages/vue/src/**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
      globals: {
        HTMLCanvasElement: 'readonly',
        HTMLDivElement: 'readonly',
        File: 'readonly',
        Blob: 'readonly',
      },
    },
    plugins: {
      vue: eslintPluginVue,
    },
    rules: {
      ...eslintPluginVue.configs['flat/recommended'].reduce((acc, cfg) => {
        if (cfg.rules) Object.assign(acc, cfg.rules)
        return acc
      }, {}),
      'vue/multi-word-component-names': 'off',
      'vue/comment-directive': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/html-self-closing': 'off',
    },
  },
  {
    files: ['packages/react/src/**/*.ts', 'packages/react/src/**/*.tsx'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
    },
  },
]
