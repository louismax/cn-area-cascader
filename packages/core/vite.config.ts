import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'CnAreaCascaderCore',
      fileName: 'index',
      formats: ['es', 'umd']
    }
  }
})
