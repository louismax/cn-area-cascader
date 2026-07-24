import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/cn-area-cascader/' : '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@louismax/cn-area-cascader': resolve(__dirname, '../../packages/vue3/src/index.ts'),
      '@louismax/cn-area-cascader-core': resolve(__dirname, '../../packages/core/src/index.ts')
    }
  },
  server: {
    port: 5173,
    open: true
  }
})
