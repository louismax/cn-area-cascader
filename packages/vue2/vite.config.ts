import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue2 from '@vitejs/plugin-vue2'

export default defineConfig({
  plugins: [vue2()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CnAreaCascaderVue2',
      fileName: 'index',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['vue', 'element-ui', '@louismax/cn-area-cascader-core'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          'element-ui': 'ELEMENT',
          '@louismax/cn-area-cascader-core': 'CnAreaCascaderCore'
        }
      }
    }
  }
})
