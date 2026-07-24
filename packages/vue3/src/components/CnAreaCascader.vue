<template>
  <el-cascader
    :model-value="modelValue"
    :options="resolvedData"
    :props="resolvedProps"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :filterable="filterable"
    :separator="separator"
    @update:model-value="handleUpdate"
    @change="handleChange"
    @visible-change="emit('visible-change', $event)"
    @expand-change="emit('expand-change', $event)"
    @blur="emit('blur', $event)"
    @focus="emit('focus', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { chinaAreaTree, defaultAreaProps } from '@louismax/cn-area-cascader-core'
import type { AreaFieldNames, AreaNode, AreaValuePath } from '@louismax/cn-area-cascader-core'

const props = withDefaults(defineProps<{
  modelValue?: AreaValuePath
  data?: Record<string, any>[]
  props?: AreaFieldNames
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  filterable?: boolean
  separator?: string
}>(), {
  modelValue: () => [],
  data: undefined,
  props: undefined,
  placeholder: '请选择省市区',
  disabled: false,
  clearable: true,
  filterable: false,
  separator: ' / '
})

const emit = defineEmits<{
  'update:modelValue': [value: AreaValuePath]
  change: [value: AreaValuePath]
  'visible-change': [visible: boolean]
  'expand-change': [value: AreaValuePath]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const resolvedData = computed(() => props.data ?? chinaAreaTree as AreaNode[])
const resolvedProps = computed(() => ({
  ...defaultAreaProps,
  ...props.props
}))

const handleUpdate = (value: AreaValuePath) => {
  emit('update:modelValue', value)
}

const handleChange = (value: AreaValuePath) => {
  emit('change', value)
}
</script>
