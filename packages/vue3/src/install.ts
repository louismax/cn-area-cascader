import type { App } from 'vue'
import CnAreaCascader from './components/CnAreaCascader.vue'

export const install = (app: App) => {
  app.component('CnAreaCascader', CnAreaCascader)
}
