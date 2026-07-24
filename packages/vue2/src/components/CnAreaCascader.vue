<template>
  <el-cascader
    :value="resolvedValue"
    :options="resolvedData"
    :props="resolvedProps"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :filterable="filterable"
    :separator="separator"
    @input="handleInput"
    @change="handleChange"
    @visible-change="$emit('visible-change', $event)"
    @expand-change="$emit('expand-change', $event)"
    @blur="$emit('blur', $event)"
    @focus="$emit('focus', $event)"
  />
</template>

<script lang="ts">
import Vue from 'vue'
import { chinaAreaTree, defaultAreaProps } from '@louismax/cn-area-cascader-core'
import type { AreaFieldNames, AreaNode, AreaValuePath } from '@louismax/cn-area-cascader-core'

export default Vue.extend({
  name: 'CnAreaCascader',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    modelValue: {
      type: Array,
      default: undefined
    },
    data: {
      type: Array,
      default: undefined
    },
    props: {
      type: Object,
      default: undefined
    },
    placeholder: {
      type: String,
      default: '请选择省市区'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    filterable: {
      type: Boolean,
      default: false
    },
    separator: {
      type: String,
      default: ' / '
    }
  },
  computed: {
    resolvedValue(): AreaValuePath {
      return (this.modelValue ?? this.value) as AreaValuePath
    },
    resolvedData(): AreaNode[] {
      return (this.data ?? chinaAreaTree) as AreaNode[]
    },
    resolvedProps(): AreaFieldNames {
      return {
        ...defaultAreaProps,
        ...(this.props as AreaFieldNames | undefined)
      }
    }
  },
  methods: {
    handleInput(value: AreaValuePath) {
      this.$emit('input', value)
      this.$emit('update:modelValue', value)
    },
    handleChange(value: AreaValuePath) {
      this.$emit('change', value)
    }
  }
})
</script>
