import type Vue from 'vue'
import CnAreaCascader from './components/CnAreaCascader.vue'

export const install = (VueConstructor: typeof Vue) => {
  VueConstructor.component('CnAreaCascader', CnAreaCascader)
}
