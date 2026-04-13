import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@tinyforged/signature-kit-vue': resolve(
        __dirname,
        '../../packages/vue/src/index.ts',
      ),
      '@tinyforged/signature-kit': resolve(
        __dirname,
        '../../packages/core/src/index.ts',
      ),
    },
  },
})
