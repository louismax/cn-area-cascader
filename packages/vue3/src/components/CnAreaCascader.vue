<template>
  <div ref="rootRef" class="cn-area-cascader">
    <el-cascader
      ref="cascaderRef"
      :key="cascaderKey"
      :model-value="innerValue"
      :options="resolvedOptions"
      :props="resolvedProps"
      :placeholder="placeholder"
      :disabled="disabled"
      :clearable="clearable"
      :filterable="filterable"
      :separator="separator"
      :show-all-levels="resolvedShowAllLevels"
      :show-checked-strategy="resolvedShowCheckedStrategy"
      :collapse-tags="resolvedCollapseTags"
    :collapse-tags-tooltip="collapseTagsTooltip"
    :max-collapse-tags="resolvedMaxCollapseTags"
    @update:model-value="handleUpdate"
    @change="handleChange"
      @visible-change="handleVisibleChange"
      @expand-change="handleExpandChange"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  chinaAreaTree,
  compactAreaSelection,
  createAreaModelValue,
  createAreaModelValues,
  defaultAreaProps,
  expandAreaSelection,
  findAreaByValue,
  findAreaPath,
  findAreaPathByValue,
  flattenAreaTree
} from '@louismax/cn-area-cascader-core'
import type { AreaFieldNames, AreaModelValue, AreaNode, AreaValue, AreaValueMode, AreaValuePath } from '@louismax/cn-area-cascader-core'

const props = withDefaults(defineProps<{
  modelValue?: AreaModelValue
  data?: Record<string, any>[]
  props?: AreaFieldNames
  multiple?: boolean
  collapseSelected?: boolean
  showCheckedStrategy?: 'child' | 'parent'
  collapseTags?: boolean
  collapseTagsTooltip?: boolean
  maxCollapseTags?: number | 'auto'
  showSelectAll?: boolean
  selectableNational?: boolean
  nationalLabel?: string
  nationalValue?: AreaValue
  includePathInfo?: boolean
  checkStrictly?: boolean
  valueMode?: AreaValueMode
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  filterable?: boolean
  autocomplete?: string
  separator?: string
  showAllLevels?: boolean
}>(), {
  modelValue: () => [],
  data: undefined,
  props: undefined,
  multiple: false,
  collapseSelected: true,
  showCheckedStrategy: undefined,
  collapseTags: undefined,
  collapseTagsTooltip: true,
  maxCollapseTags: 'auto',
  showSelectAll: false,
  selectableNational: false,
  nationalLabel: '全国',
  nationalValue: '100000',
  includePathInfo: true,
  checkStrictly: false,
  valueMode: 'leaf-code',
  placeholder: '请选择省市区',
  disabled: false,
  clearable: true,
  filterable: false,
  autocomplete: 'off',
  separator: ' / ',
  showAllLevels: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: AreaModelValue | undefined]
  change: [value: AreaModelValue | undefined]
  'visible-change': [visible: boolean]
  'expand-change': [value: AreaValuePath]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const cascaderRef = ref<{
  togglePopperVisible?: (visible: boolean) => void
  popperVisible?: boolean
}>()
const rootRef = ref<HTMLElement>()
const expandedPath = ref<AreaValuePath>([])
const autoMaxCollapseTags = ref(1)
const pendingInnerValue = ref<AreaValue[] | AreaValuePath[]>()
const nationalSelected = ref(false)
let resizeObserver: ResizeObserver | undefined

const resolvedData = computed(() => props.data ?? chinaAreaTree as AreaNode[])
const isNationalValue = (value: unknown) => String(value) === String(props.nationalValue)
const effectiveCheckStrictly = computed(() => (props.selectableNational || props.checkStrictly) && !props.multiple)
const resolvedShowCheckedStrategy = computed(() => {
  if (!props.multiple) {
    return undefined
  }

  return props.showCheckedStrategy ?? (props.collapseSelected ? 'parent' : 'child')
})
const resolvedCollapseTags = computed(() => props.collapseTags ?? props.multiple)
const resolvedShowAllLevels = computed(() => props.showAllLevels ?? true)
const resolvedMaxCollapseTags = computed(() => {
  if (!props.multiple || !resolvedCollapseTags.value) {
    return undefined
  }

  return props.maxCollapseTags === 'auto' ? autoMaxCollapseTags.value : props.maxCollapseTags
})
const resolvedProps = computed(() => {
  const cascaderProps = {
    ...defaultAreaProps,
    ...props.props,
    multiple: props.multiple,
    checkStrictly: effectiveCheckStrictly.value,
    emitPath: props.valueMode === 'path-code' || props.valueMode === 'path-node'
  }

  if (effectiveCheckStrictly.value && !props.props?.expandTrigger) {
    return {
      ...cascaderProps,
      expandTrigger: 'hover'
    }
  }

  return cascaderProps
})

const getNodeValue = (node: Record<string, any>) => node[resolvedProps.value.value]

const resolvedOptions = computed(() => {
  if (!props.selectableNational) {
    return resolvedData.value
  }

  return [{
    [resolvedProps.value.label]: props.nationalLabel,
    [resolvedProps.value.value]: props.nationalValue,
    [resolvedProps.value.code]: props.nationalValue,
    [resolvedProps.value.level]: 0,
    [resolvedProps.value.children]: resolvedData.value
  }]
})
const cascaderKey = computed(() => [
  props.selectableNational ? 'national' : 'area',
  props.multiple ? 'multiple' : 'single',
  props.valueMode,
  resolvedProps.value.label,
  resolvedProps.value.value,
  resolvedProps.value.children
].join(':'))

const toValuePath = (nodes: Record<string, any>[]) => nodes.map((node) => getNodeValue(node))

const withNationalPath = (path: AreaValuePath) => props.selectableNational
  ? [props.nationalValue, ...path]
  : path

const stripNationalPath = (path: AreaValuePath) => isNationalValue(path[0])
  ? path.slice(1)
  : path

const toOutputNode = (node: Record<string, any> | undefined) => {
  if (!node) {
    return undefined
  }

  const { [resolvedProps.value.children]: _children, ...outputNode } = node

  if (props.includePathInfo) {
    const path = findAreaPathByValue(resolvedData.value, getNodeValue(node), resolvedProps.value)
    outputNode.pathLabels = path.map((item) => item[resolvedProps.value.label])
    outputNode.pathValues = path.map((item) => getNodeValue(item))
    outputNode.fullLabel = outputNode.pathLabels.join(props.separator)
  }

  return outputNode
}

const toOutputPath = (nodes: Record<string, any>[]) => {
  let root: Record<string, any> | undefined
  let current: Record<string, any> | undefined

  nodes.forEach((node) => {
    const outputNode = toOutputNode(node)

    if (!outputNode) {
      return
    }

    if (!root) {
      root = outputNode
      current = outputNode
      return
    }

    current![resolvedProps.value.children] = [outputNode]
    current = outputNode
  })

  return root
}

const getTreeLeafValue = (node: Record<string, any>) => {
  let current = node
  let children = current[resolvedProps.value.children]

  while (Array.isArray(children) && children.length > 0) {
    current = children[0]
    children = current[resolvedProps.value.children]
  }

  return getNodeValue(current)
}

const getModelSelectedValues = () => {
  const value = props.modelValue

  if (!props.multiple || !props.collapseSelected || !Array.isArray(value)) {
    return undefined
  }

  if (props.valueMode === 'path-code') {
    return (value as AreaValuePath[]).map((item) => item[item.length - 1])
  }

  if (props.valueMode === 'leaf-node') {
    return (value as Record<string, any>[]).map((node) => getNodeValue(node))
  }

  if (props.valueMode === 'path-node') {
    return (value as Record<string, any>[]).map((node) => getTreeLeafValue(node))
  }

  return value as AreaValue[]
}

const isPlainValue = (value: unknown) => typeof value === 'string' || typeof value === 'number'

const normalizeModelValue = () => {
  const value = props.modelValue

  if (props.valueMode === 'leaf-code' || value === undefined) {
    return value
  }

  if (props.multiple && Array.isArray(value) && value.every(isPlainValue)) {
    return createAreaModelValues(resolvedData.value, value as AreaValue[], {
      mode: props.valueMode,
      fields: resolvedProps.value,
      separator: props.separator,
      includePathInfo: props.includePathInfo
    })
  }

  if (!props.multiple && isPlainValue(value)) {
    return createAreaModelValue(resolvedData.value, value as AreaValue, {
      mode: props.valueMode,
      fields: resolvedProps.value,
      separator: props.separator,
      includePathInfo: props.includePathInfo
    })
  }

  return value
}

const getExpandedInnerValue = () => {
  const selectedValues = getModelSelectedValues()

  if (!selectedValues) {
    return undefined
  }

  const leafNodes = expandAreaSelection(resolvedData.value, selectedValues, {
    fields: resolvedProps.value
  })

  if (props.valueMode === 'path-code' || props.valueMode === 'path-node') {
    return leafNodes.map((node) => withNationalPath(findAreaPathByValue(resolvedData.value, getNodeValue(node), resolvedProps.value).map((item) => getNodeValue(item))))
  }

  return leafNodes.map((node) => getNodeValue(node))
}

const collectLeafValues = (nodes: Record<string, any>[]) => {
  const values: AreaValue[] = []

  const visit = (node: Record<string, any>) => {
    const children = node[resolvedProps.value.children]

    if (!Array.isArray(children) || children.length === 0) {
      values.push(getNodeValue(node))
      return
    }

    children.forEach(visit)
  }

  nodes.forEach(visit)

  return values
}

const getCurrentSelectedLeafValues = () => {
  if (pendingInnerValue.value) {
    return props.valueMode === 'path-code' || props.valueMode === 'path-node'
      ? (pendingInnerValue.value as AreaValuePath[]).map((item) => item[item.length - 1])
      : pendingInnerValue.value as AreaValue[]
  }

  const selectedValues = getModelSelectedValues()

  if (!selectedValues) {
    return []
  }

  return expandAreaSelection(resolvedData.value, selectedValues, {
    fields: resolvedProps.value
  }).map((node) => getNodeValue(node))
}

const getColumnNodes = () => {
  const columns: Record<string, any>[][] = [resolvedData.value]
  let nodes: Record<string, any>[] = resolvedData.value

  for (const value of expandedPath.value) {
    const node = nodes.find((item) => String(getNodeValue(item)) === String(value))
    const children = node?.[resolvedProps.value.children]

    if (!Array.isArray(children) || children.length === 0) {
      break
    }

    columns.push(children)
    nodes = children
  }

  return columns
}

const toInnerMultipleValue = (leafValues: AreaValue[]) => {
  if (props.valueMode === 'path-code' || props.valueMode === 'path-node') {
    return leafValues.map((value) => withNationalPath(findAreaPathByValue(resolvedData.value, value, resolvedProps.value).map((node) => getNodeValue(node))))
  }

  return leafValues
}

const getSelectedValues = (value: AreaValue | AreaValue[] | AreaValuePath[]) => {
  if (props.valueMode === 'path-code' || props.valueMode === 'path-node') {
    return (value as AreaValuePath[]).map((item) => stripNationalPath(item)).map((item) => item[item.length - 1])
  }

  return value as AreaValue[]
}

const getCompactNodes = (value: AreaValue | AreaValue[] | AreaValuePath[]) => {
  if (!props.multiple || !props.collapseSelected) {
    return undefined
  }

  return compactAreaSelection(resolvedData.value, getSelectedValues(value), {
    fields: resolvedProps.value
  })
}

const isAllNationalLeavesSelected = (value: AreaValue | AreaValue[] | AreaValuePath[]) => {
  if (!props.selectableNational || !props.multiple || !Array.isArray(value)) {
    return false
  }

  const leafValues = collectLeafValues(resolvedData.value).map((item) => String(item))
  const selectedValueSet = new Set(getSelectedValues(value).map((item) => String(item)))

  return leafValues.length > 0 && leafValues.every((item) => selectedValueSet.has(item))
}

const isNationalOutput = (value: AreaValue | AreaValue[] | AreaValuePath[]) => {
  if (!props.selectableNational || props.multiple) {
    return false
  }

  if (props.valueMode === 'path-code' || props.valueMode === 'path-node') {
    return Array.isArray(value) && value.length === 1 && isNationalValue((value as AreaValuePath)[0])
  }

  return isNationalValue(value)
}

const isProvinceModelValue = (value: AreaModelValue | undefined) => {
  if (!props.selectableNational || !Array.isArray(value)) {
    return false
  }

  const provinceValues = resolvedData.value.map((node) => String(getNodeValue(node)))

  if (value.length !== provinceValues.length) {
    return false
  }

  const selectedValues = props.valueMode === 'path-code'
    ? (value as AreaValuePath[]).map((item) => String(item[item.length - 1]))
    : props.valueMode === 'leaf-node'
      ? (value as Record<string, any>[]).map((node) => String(getNodeValue(node)))
      : props.valueMode === 'path-node'
        ? (value as Record<string, any>[]).map((node) => String(getTreeLeafValue(node)))
        : (value as AreaValue[]).map((item) => String(item))

  const selectedValueSet = new Set(selectedValues)

  return provinceValues.every((value) => selectedValueSet.has(value))
}

const formatProvinceOutput = () => {
  if (props.valueMode === 'leaf-node') {
    return resolvedData.value.map((node) => toOutputNode(node))
  }

  if (props.valueMode === 'path-node') {
    return resolvedData.value.map((node) => toOutputPath([node]))
  }

  if (props.valueMode === 'path-code') {
    return resolvedData.value.map((node) => [getNodeValue(node)])
  }

  return resolvedData.value.map((node) => getNodeValue(node))
}

const innerValue = computed(() => {
  if (!props.multiple && (nationalSelected.value || isProvinceModelValue(props.modelValue))) {
    return props.valueMode === 'path-code' || props.valueMode === 'path-node'
      ? [props.nationalValue]
      : props.nationalValue
  }

  if (pendingInnerValue.value) {
    return pendingInnerValue.value
  }

  const expandedInnerValue = getExpandedInnerValue()

  if (expandedInnerValue) {
    return expandedInnerValue
  }

  const value = normalizeModelValue()

  if (props.valueMode === 'leaf-node') {
    return props.multiple
      ? (value as Record<string, any>[] | undefined)?.map((node) => getNodeValue(node)) ?? []
      : value ? getNodeValue(value as Record<string, any>) : undefined
  }

  if (props.valueMode === 'path-node') {
    return props.multiple
      ? []
      : value ? withNationalPath(toValuePath(findAreaPathByValue(resolvedData.value, getTreeLeafValue(value as Record<string, any>), resolvedProps.value))) : []
  }

  return value
})

const formatOutput = (value: AreaValue | AreaValue[] | AreaValuePath[]) => {
  if (isNationalOutput(value)) {
    return formatProvinceOutput()
  }

  if (isAllNationalLeavesSelected(value)) {
    return formatProvinceOutput()
  }

  const compactNodes = getCompactNodes(value)

  if (props.valueMode === 'leaf-node') {
    if (compactNodes) {
      return compactNodes.map((node) => toOutputNode(node))
    }

    return props.multiple
      ? (value as AreaValue[]).map((item) => toOutputNode(findAreaByValue(resolvedData.value, item, resolvedProps.value)))
      : toOutputNode(findAreaByValue(resolvedData.value, value as AreaValue, resolvedProps.value))
  }

  if (props.valueMode === 'path-node') {
    if (compactNodes) {
      return compactNodes.map((node) => toOutputPath(findAreaPathByValue(resolvedData.value, getNodeValue(node), resolvedProps.value)))
    }

    return props.multiple
      ? (value as AreaValuePath[]).map((item) => toOutputPath(findAreaPath(resolvedData.value, stripNationalPath(item), resolvedProps.value)))
      : toOutputPath(findAreaPath(resolvedData.value, stripNationalPath(value as AreaValuePath), resolvedProps.value))
  }

  if (props.valueMode === 'path-code') {
    if (compactNodes) {
      return compactNodes.map((node) => findAreaPathByValue(resolvedData.value, getNodeValue(node), resolvedProps.value).map((item) => getNodeValue(item)))
    }

    return props.multiple
      ? (value as AreaValuePath[]).map((item) => stripNationalPath(item))
      : stripNationalPath(value as AreaValuePath)
  }

  if (compactNodes) {
    return compactNodes.map((node) => getNodeValue(node))
  }

  return value
}

const closePanel = () => {
  if (!effectiveCheckStrictly.value) {
    return
  }

  setTimeout(() => {
    cascaderRef.value?.togglePopperVisible?.(false)

    if (cascaderRef.value) {
      cascaderRef.value.popperVisible = false
    }
  })
}

const replaceSelectAllValue = (value: AreaValue | AreaValue[] | AreaValuePath[]) => {
  return value
}

const emitFormattedValue = (value: AreaValue | AreaValue[] | AreaValuePath[], eventName: 'update:modelValue' | 'change') => {
  const nextValue = replaceSelectAllValue(value)

  emit(eventName, formatOutput(nextValue))
  nextTick(syncSelectAllState)
}

const getDropdownElement = () => {
  const cascader = cascaderRef.value as any

  return cascader?.popperRef?.contentRef as HTMLElement | undefined
    ?? document.querySelector<HTMLElement>('.el-cascader__dropdown')
}

const syncSelectAllState = () => {
  if (!props.multiple || !props.showSelectAll) {
    return
  }

  const dropdown = getDropdownElement()
  const menus = dropdown?.querySelectorAll<HTMLElement>('.el-cascader-menu')
  const selectedValueSet = new Set(getCurrentSelectedLeafValues().map((item) => String(item)))

  menus?.forEach((menu, index) => {
    const selectAllNode = menu.querySelector<HTMLElement>('.el-cascader-node')
    const checkbox = selectAllNode?.querySelector<HTMLElement>('.el-checkbox__input')
    const values = collectLeafValues(getColumnNodes()[index] ?? [])
    const selectedCount = values.filter((item) => selectedValueSet.has(String(item))).length
    const isChecked = values.length > 0 && selectedCount === values.length
    const isIndeterminate = selectedCount > 0 && selectedCount < values.length

    checkbox?.classList.toggle('is-checked', isChecked)
    checkbox?.classList.toggle('is-indeterminate', isIndeterminate)
  })
}

const trimNationalLabel = () => {
  if (!props.selectableNational || props.showAllLevels === false) {
    return
  }

  const prefix = `${props.nationalLabel}${props.separator}`

  rootRef.value
    ?.querySelectorAll<HTMLElement>('.el-tag__content, .el-cascader__tags .el-tag span, .el-input__inner')
    .forEach((element) => {
      const text = element.textContent ?? ''

      if (text.startsWith(prefix)) {
        element.textContent = text.slice(prefix.length)
      }
    })
}

const handleVisibleChange = (visible: boolean) => {
  emit('visible-change', visible)

  if (visible) {
    nextTick(() => {
      syncSelectAllState()
      trimNationalLabel()
    })
  }
}

const handleExpandChange = (value: AreaValuePath) => {
  expandedPath.value = Array.isArray(value)
    ? value.filter((item) => !isNationalValue(item))
    : []

  emit('expand-change', value)
  nextTick(() => {
    syncSelectAllState()
    trimNationalLabel()
  })
}

const handleUpdate = (value: AreaValue | AreaValue[] | AreaValuePath[]) => {
  nationalSelected.value = isNationalOutput(value)
  emitFormattedValue(value, 'update:modelValue')
  nextTick(trimNationalLabel)
  closePanel()
}

const handleChange = (value: AreaValue | AreaValue[] | AreaValuePath[]) => {
  nationalSelected.value = isNationalOutput(value)
  emitFormattedValue(value, 'change')
  nextTick(trimNationalLabel)
}

const updateAutoMaxCollapseTags = () => {
  const width = rootRef.value?.clientWidth ?? 0

  if (!width) {
    autoMaxCollapseTags.value = 1
    return
  }

  autoMaxCollapseTags.value = Math.max(1, Math.min(6, Math.floor((width - 96) / 118)))
}

const syncInputAutocomplete = () => {
  rootRef.value
    ?.querySelectorAll<HTMLInputElement>('input')
    .forEach((input) => input.setAttribute('autocomplete', props.autocomplete))
}

onMounted(() => {
  updateAutoMaxCollapseTags()
  trimNationalLabel()
  nextTick(syncInputAutocomplete)

  if (!rootRef.value || typeof ResizeObserver === 'undefined') {
    return
  }

  resizeObserver = new ResizeObserver(updateAutoMaxCollapseTags)
  resizeObserver.observe(rootRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

watch(() => props.modelValue, () => {
  pendingInnerValue.value = undefined
  nationalSelected.value = isProvinceModelValue(props.modelValue)
  nextTick(trimNationalLabel)
})

watch([() => props.autocomplete, () => props.filterable, () => props.disabled, cascaderKey], () => {
  nextTick(syncInputAutocomplete)
})
</script>

<style scoped>
.cn-area-cascader,
.cn-area-cascader :deep(.el-cascader) {
  width: 100%;
}
</style>
