import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts', 'src/**/*.vue'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SignatureKitVue',
      formats: ['es', 'umd'],
      fileName: (format) =>
        `signature-kit-vue.${format === 'es' ? 'js' : 'umd.cjs'}`,
    },
    rollupOptions: {
      external: ['vue', '@tinyforged/signature-kit', 'signature_pad'],
      output: {
        globals: {
          vue: 'Vue',
          '@tinyforged/signature-kit': 'SignatureKitCore',
          signature_pad: 'SignaturePad',
        },
      },
    },
  },
})
