<template>
  <el-cascader
    ref="cascaderRef"
    :key="cascaderKey"
    :value="innerValue"
    :options="resolvedOptions"
    :props="resolvedProps"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :filterable="filterable"
    :separator="separator"
    :show-all-levels="resolvedShowAllLevels"
    @input="handleInput"
    @change="handleChange"
    @visible-change="handleVisibleChange"
    @expand-change="handleExpandChange"
    @blur="$emit('blur', $event)"
    @focus="$emit('focus', $event)"
  />
</template>

<script lang="ts">
import Vue from 'vue'
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
import type { AreaFieldNames, AreaNode, AreaValue, AreaValueMode, AreaValuePath } from '@louismax/cn-area-cascader-core'

export default Vue.extend({
  name: 'CnAreaCascader',
  data() {
    return {
      expandedPath: [] as AreaValuePath,
      pendingInnerValue: undefined as AreaValue[] | AreaValuePath[] | undefined,
      nationalSelected: false
    }
  },
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
    multiple: {
      type: Boolean,
      default: false
    },
    collapseSelected: {
      type: Boolean,
      default: true
    },
    showSelectAll: {
      type: Boolean,
      default: false
    },
    selectableNational: {
      type: Boolean,
      default: false
    },
    nationalLabel: {
      type: String,
      default: '全国'
    },
    nationalValue: {
      type: [String, Number],
      default: '100000'
    },
    checkStrictly: {
      type: Boolean,
      default: false
    },
    valueMode: {
      type: String,
      default: 'leaf-code'
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
    },
    showAllLevels: {
      type: Boolean,
      default: undefined
    },
    includePathInfo: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    resolvedData(): AreaNode[] {
      return (this.data ?? chinaAreaTree) as AreaNode[]
    },
    resolvedOptions(): Record<string, any>[] {
      if (!this.selectableNational) {
        return this.resolvedData
      }

      return [{
        [(this.resolvedProps as Required<AreaFieldNames>).label]: this.nationalLabel,
        [(this.resolvedProps as Required<AreaFieldNames>).value]: this.nationalValue,
        [(this.resolvedProps as Required<AreaFieldNames>).code]: this.nationalValue,
        [(this.resolvedProps as Required<AreaFieldNames>).level]: 0,
        [(this.resolvedProps as Required<AreaFieldNames>).children]: this.resolvedData
      }]
    },
    cascaderKey(): string {
      return [
        this.selectableNational ? 'national' : 'area',
        this.multiple ? 'multiple' : 'single',
        this.valueMode,
        (this.resolvedProps as Required<AreaFieldNames>).label,
        (this.resolvedProps as Required<AreaFieldNames>).value,
        (this.resolvedProps as Required<AreaFieldNames>).children
      ].join(':')
    },
    resolvedShowAllLevels(): boolean {
      return this.showAllLevels ?? true
    },
    effectiveCheckStrictly(): boolean {
      return (this.selectableNational || this.checkStrictly) && !this.multiple
    },
    resolvedProps(): AreaFieldNames {
      const cascaderProps = {
        ...defaultAreaProps,
        ...(this.props as AreaFieldNames | undefined),
        multiple: this.multiple,
        checkStrictly: this.effectiveCheckStrictly,
        emitPath: this.valueMode === 'path-code' || this.valueMode === 'path-node'
      }

      if (this.effectiveCheckStrictly && !(this.props as AreaFieldNames | undefined)?.expandTrigger) {
        return {
          ...cascaderProps,
          expandTrigger: 'hover'
        }
      }

      return cascaderProps
    },
    innerValue(): unknown {
      if (!this.multiple && (this.nationalSelected || this.isProvinceModelValue(this.modelValue ?? this.value))) {
        return (this.valueMode as AreaValueMode) === 'path-code' || (this.valueMode as AreaValueMode) === 'path-node'
          ? [this.nationalValue]
          : this.nationalValue
      }

      if (this.pendingInnerValue) {
        return this.pendingInnerValue
      }

      const expandedInnerValue = this.getExpandedInnerValue()

      if (expandedInnerValue) {
        return expandedInnerValue
      }

      const value = this.normalizeModelValue()

      if (this.valueMode === 'leaf-node') {
        return this.multiple
          ? (value as Record<string, any>[] | undefined)?.map((node) => this.getNodeValue(node)) ?? []
          : value ? this.getNodeValue(value as Record<string, any>) : undefined
      }

      if (this.valueMode === 'path-node') {
        return this.multiple
          ? []
          : value ? this.withNationalPath(this.toValuePath(findAreaPathByValue(this.resolvedData, this.getTreeLeafValue(value as Record<string, any>), this.resolvedProps))) : []
      }

      return value
    }
  },
  methods: {
    getNodeValue(node: Record<string, any>) {
      return node[(this.resolvedProps as Required<AreaFieldNames>).value]
    },
    isNationalValue(value: unknown) {
      return String(value) === String(this.nationalValue)
    },
    getSelectAllValuePrefix() {
      return '__CN_AREA_CASCADER_SELECT_ALL__:'
    },
    isSelectAllValue(value: unknown) {
      return typeof value === 'string' && value.startsWith(this.getSelectAllValuePrefix())
    },
    createSelectAllNode(nodes: Record<string, any>[], path: AreaValuePath = []) {
      return {
        [(this.resolvedProps as Required<AreaFieldNames>).label]: '全选本级',
        [(this.resolvedProps as Required<AreaFieldNames>).value]: `${this.getSelectAllValuePrefix()}${path.join(',')}`,
        __selectAll: true,
        __selectAllValues: this.collectLeafValues(nodes)
      }
    },
    appendSelectAllNodes(nodes: Record<string, any>[], path: AreaValuePath = []): Record<string, any>[] {
      const nextNodes = nodes.map((node) => {
        const children = node[(this.resolvedProps as Required<AreaFieldNames>).children]

        if (!Array.isArray(children) || children.length === 0) {
          return node
        }

        return {
          ...node,
          [(this.resolvedProps as Required<AreaFieldNames>).children]: this.appendSelectAllNodes(children, [...path, this.getNodeValue(node)])
        }
      })

      return [this.createSelectAllNode(nodes, path), ...nextNodes]
    },
    toValuePath(nodes: Record<string, any>[]) {
      return nodes.map((node) => this.getNodeValue(node))
    },
    withNationalPath(path: AreaValuePath) {
      return this.selectableNational
        ? [this.nationalValue as AreaValue, ...path]
        : path
    },
    stripNationalPath(path: AreaValuePath) {
      return this.isNationalValue(path[0])
        ? path.slice(1)
        : path
    },
    toOutputNode(node: Record<string, any> | undefined) {
      if (!node) {
        return undefined
      }

      const { [(this.resolvedProps as Required<AreaFieldNames>).children]: _children, ...outputNode } = node

      if (this.includePathInfo) {
        const path = findAreaPathByValue(this.resolvedData, this.getNodeValue(node), this.resolvedProps)
        outputNode.pathLabels = path.map((item) => item[(this.resolvedProps as Required<AreaFieldNames>).label])
        outputNode.pathValues = path.map((item) => this.getNodeValue(item))
        outputNode.fullLabel = outputNode.pathLabels.join(this.separator)
      }

      return outputNode
    },
    toOutputPath(nodes: Record<string, any>[]) {
      let root: Record<string, any> | undefined
      let current: Record<string, any> | undefined

      nodes.forEach((node) => {
        const outputNode = this.toOutputNode(node)

        if (!outputNode) {
          return
        }

        if (!root) {
          root = outputNode
          current = outputNode
          return
        }

        current![(this.resolvedProps as Required<AreaFieldNames>).children] = [outputNode]
        current = outputNode
      })

      return root
    },
    getTreeLeafValue(node: Record<string, any>) {
      let current = node
      let children = current[(this.resolvedProps as Required<AreaFieldNames>).children]

      while (Array.isArray(children) && children.length > 0) {
        current = children[0]
        children = current[(this.resolvedProps as Required<AreaFieldNames>).children]
      }

      return this.getNodeValue(current)
    },
    getModelSelectedValues() {
      const value = this.modelValue ?? this.value

      if (!this.multiple || !this.collapseSelected || !Array.isArray(value)) {
        return undefined
      }

      if ((this.valueMode as AreaValueMode) === 'path-code') {
        return (value as AreaValuePath[]).map((item) => item[item.length - 1])
      }

      if ((this.valueMode as AreaValueMode) === 'leaf-node') {
        return (value as Record<string, any>[]).map((node) => this.getNodeValue(node))
      }

      if ((this.valueMode as AreaValueMode) === 'path-node') {
        return (value as Record<string, any>[]).map((node) => this.getTreeLeafValue(node))
      }

      return value as AreaValue[]
    },
    isPlainValue(value: unknown) {
      return typeof value === 'string' || typeof value === 'number'
    },
    normalizeModelValue() {
      const value = this.modelValue ?? this.value

      if ((this.valueMode as AreaValueMode) === 'leaf-code' || value === undefined) {
        return value
      }

      if (this.multiple && Array.isArray(value) && value.every(this.isPlainValue)) {
        return createAreaModelValues(this.resolvedData, value as AreaValue[], {
          mode: this.valueMode as AreaValueMode,
          fields: this.resolvedProps,
          separator: this.separator,
          includePathInfo: this.includePathInfo
        })
      }

      if (!this.multiple && this.isPlainValue(value)) {
        return createAreaModelValue(this.resolvedData, value as AreaValue, {
          mode: this.valueMode as AreaValueMode,
          fields: this.resolvedProps,
          separator: this.separator,
          includePathInfo: this.includePathInfo
        })
      }

      return value
    },
    getExpandedInnerValue() {
      const selectedValues = this.getModelSelectedValues()

      if (!selectedValues) {
        return undefined
      }

      const leafNodes = expandAreaSelection(this.resolvedData, selectedValues, {
        fields: this.resolvedProps
      })

      if ((this.valueMode as AreaValueMode) === 'path-code' || (this.valueMode as AreaValueMode) === 'path-node') {
        return leafNodes.map((node) => this.withNationalPath(findAreaPathByValue(this.resolvedData, this.getNodeValue(node), this.resolvedProps).map((item) => this.getNodeValue(item))))
      }

      return leafNodes.map((node) => this.getNodeValue(node))
    },
    collectLeafValues(nodes: Record<string, any>[]) {
      const values: AreaValue[] = []

      const visit = (node: Record<string, any>) => {
        const children = node[(this.resolvedProps as Required<AreaFieldNames>).children]

        if (!Array.isArray(children) || children.length === 0) {
          values.push(this.getNodeValue(node))
          return
        }

        children.forEach(visit)
      }

      nodes.forEach(visit)

      return values
    },
    toInnerMultipleValue(leafValues: AreaValue[]) {
      if ((this.valueMode as AreaValueMode) === 'path-code' || (this.valueMode as AreaValueMode) === 'path-node') {
        return leafValues.map((value) => this.withNationalPath(findAreaPathByValue(this.resolvedData, value, this.resolvedProps).map((node) => this.getNodeValue(node))))
      }

      return leafValues
    },
    getCurrentSelectedLeafValues() {
      if (this.pendingInnerValue) {
        return (this.valueMode as AreaValueMode) === 'path-code' || (this.valueMode as AreaValueMode) === 'path-node'
          ? (this.pendingInnerValue as AreaValuePath[]).map((item) => item[item.length - 1])
          : this.pendingInnerValue as AreaValue[]
      }

      const selectedValues = this.getModelSelectedValues()

      if (!selectedValues) {
        return []
      }

      return expandAreaSelection(this.resolvedData, selectedValues, {
        fields: this.resolvedProps
      }).map((node) => this.getNodeValue(node))
    },
    getColumnNodes() {
      const columns: Record<string, any>[][] = [this.resolvedData]
      let nodes: Record<string, any>[] = this.resolvedData

      for (const value of this.expandedPath) {
        const node = nodes.find((item) => String(this.getNodeValue(item)) === String(value))
        const children = node?.[(this.resolvedProps as Required<AreaFieldNames>).children]

        if (!Array.isArray(children) || children.length === 0) {
          break
        }

        columns.push(children)
        nodes = children
      }

      return columns
    },
    replaceSelectAllValue(value: AreaValue | AreaValue[] | AreaValuePath[]) {
      if (!this.multiple || !this.showSelectAll || !Array.isArray(value)) {
        return value
      }

      const values = (this.valueMode as AreaValueMode) === 'path-code' || (this.valueMode as AreaValueMode) === 'path-node'
        ? (value as AreaValuePath[]).map((item) => item[item.length - 1])
        : value as AreaValue[]
      const selectAllValues = values.filter((item) => this.isSelectAllValue(item))

      if (!selectAllValues.length) {
        return value
      }

      const currentLeafValues = this.getCurrentSelectedLeafValues()
      const selectedValueSet = new Set(currentLeafValues.map((item) => String(item)))
      const selectAllLeafValues = flattenAreaTree(this.resolvedOptions, this.resolvedProps)
        .filter((node) => selectAllValues.includes(this.getNodeValue(node)))
        .flatMap((node) => node.__selectAllValues as AreaValue[])
      const shouldUnselect = selectAllLeafValues.every((item) => selectedValueSet.has(String(item)))
      const nextLeafValues = shouldUnselect
        ? currentLeafValues.filter((item) => !selectAllLeafValues.some((value) => String(value) === String(item)))
        : [...currentLeafValues]

      if (!shouldUnselect) {
        selectAllLeafValues.forEach((item) => {
          const key = String(item)

          if (!selectedValueSet.has(key)) {
            selectedValueSet.add(key)
            nextLeafValues.push(item)
          }
        })
      }

      const nextInnerValue = this.toInnerMultipleValue(nextLeafValues)
      this.pendingInnerValue = nextInnerValue

      return nextInnerValue
    },
    emitFormattedValue(value: AreaValue | AreaValue[] | AreaValuePath[], eventName: 'input' | 'update:modelValue' | 'change') {
      this.$emit(eventName, this.formatOutput(this.replaceSelectAllValue(value)))
      this.$nextTick(this.syncSelectAllState)
    },
    getSelectedValues(value: AreaValue | AreaValue[] | AreaValuePath[]) {
      if ((this.valueMode as AreaValueMode) === 'path-code' || (this.valueMode as AreaValueMode) === 'path-node') {
        return (value as AreaValuePath[]).map((item) => this.stripNationalPath(item)).map((item) => item[item.length - 1])
      }

      return value as AreaValue[]
    },
    getCompactNodes(value: AreaValue | AreaValue[] | AreaValuePath[]) {
      if (!this.multiple || !this.collapseSelected) {
        return undefined
      }

      return compactAreaSelection(this.resolvedData, this.getSelectedValues(value), {
        fields: this.resolvedProps
      })
    },
    isAllNationalLeavesSelected(value: AreaValue | AreaValue[] | AreaValuePath[]) {
      if (!this.selectableNational || !this.multiple || !Array.isArray(value)) {
        return false
      }

      const leafValues = this.collectLeafValues(this.resolvedData).map((item) => String(item))
      const selectedValueSet = new Set(this.getSelectedValues(value).map((item) => String(item)))

      return leafValues.length > 0 && leafValues.every((item) => selectedValueSet.has(item))
    },
    formatOutput(value: AreaValue | AreaValue[] | AreaValuePath[]) {
      if (this.isNationalOutput(value)) {
        return this.formatProvinceOutput()
      }

      if (this.isAllNationalLeavesSelected(value)) {
        return this.formatProvinceOutput()
      }

      const compactNodes = this.getCompactNodes(value)

      if ((this.valueMode as AreaValueMode) === 'leaf-node') {
        if (compactNodes) {
          return compactNodes.map((node) => this.toOutputNode(node))
        }

        return this.multiple
          ? (value as AreaValue[]).map((item) => this.toOutputNode(findAreaByValue(this.resolvedData, item, this.resolvedProps)))
          : this.toOutputNode(findAreaByValue(this.resolvedData, value as AreaValue, this.resolvedProps))
      }

      if ((this.valueMode as AreaValueMode) === 'path-node') {
        if (compactNodes) {
          return compactNodes.map((node) => this.toOutputPath(findAreaPathByValue(this.resolvedData, this.getNodeValue(node), this.resolvedProps)))
        }

        return this.multiple
          ? (value as AreaValuePath[]).map((item) => this.toOutputPath(findAreaPath(this.resolvedData, this.stripNationalPath(item), this.resolvedProps)))
          : this.toOutputPath(findAreaPath(this.resolvedData, this.stripNationalPath(value as AreaValuePath), this.resolvedProps))
      }

      if ((this.valueMode as AreaValueMode) === 'path-code') {
        if (compactNodes) {
          return compactNodes.map((node) => findAreaPathByValue(this.resolvedData, this.getNodeValue(node), this.resolvedProps).map((item) => this.getNodeValue(item)))
        }

        return this.multiple
          ? (value as AreaValuePath[]).map((item) => this.stripNationalPath(item))
          : this.stripNationalPath(value as AreaValuePath)
      }

      if (compactNodes) {
        return compactNodes.map((node) => this.getNodeValue(node))
      }

      return value
    },
    isNationalOutput(value: AreaValue | AreaValue[] | AreaValuePath[]) {
      if (!this.selectableNational || this.multiple) {
        return false
      }

      if ((this.valueMode as AreaValueMode) === 'path-code' || (this.valueMode as AreaValueMode) === 'path-node') {
        return Array.isArray(value) && value.length === 1 && this.isNationalValue((value as AreaValuePath)[0])
      }

      return this.isNationalValue(value)
    },
    isProvinceModelValue(value: unknown) {
      if (!this.selectableNational || !Array.isArray(value)) {
        return false
      }

      const provinceValues = this.resolvedData.map((node) => String(this.getNodeValue(node)))

      if (value.length !== provinceValues.length) {
        return false
      }

      const selectedValues = (this.valueMode as AreaValueMode) === 'path-code'
        ? (value as AreaValuePath[]).map((item) => String(item[item.length - 1]))
        : (this.valueMode as AreaValueMode) === 'leaf-node'
          ? (value as Record<string, any>[]).map((node) => String(this.getNodeValue(node)))
          : (this.valueMode as AreaValueMode) === 'path-node'
            ? (value as Record<string, any>[]).map((node) => String(this.getTreeLeafValue(node)))
            : (value as AreaValue[]).map((item) => String(item))

      const selectedValueSet = new Set(selectedValues)

      return provinceValues.every((value) => selectedValueSet.has(value))
    },
    formatProvinceOutput() {
      if ((this.valueMode as AreaValueMode) === 'leaf-node') {
        return this.resolvedData.map((node) => this.toOutputNode(node))
      }

      if ((this.valueMode as AreaValueMode) === 'path-node') {
        return this.resolvedData.map((node) => this.toOutputPath([node]))
      }

      if ((this.valueMode as AreaValueMode) === 'path-code') {
        return this.resolvedData.map((node) => [this.getNodeValue(node)])
      }

      return this.resolvedData.map((node) => this.getNodeValue(node))
    },
    closePanel() {
      if (!this.effectiveCheckStrictly) {
        return
      }

      setTimeout(() => {
        const cascaderRef = this.$refs.cascaderRef as {
          toggleDropDownVisible?: (visible: boolean) => void
          dropDownVisible?: boolean
        } | undefined

        cascaderRef?.toggleDropDownVisible?.(false)

        if (cascaderRef) {
          cascaderRef.dropDownVisible = false
        }
      })
    },
    handleInput(value: AreaValue | AreaValue[] | AreaValuePath[]) {
      this.nationalSelected = this.isNationalOutput(value)
      this.emitFormattedValue(value, 'input')
      this.emitFormattedValue(value, 'update:modelValue')
      this.closePanel()
    },
    handleChange(value: AreaValue | AreaValue[] | AreaValuePath[]) {
      this.nationalSelected = this.isNationalOutput(value)
      this.emitFormattedValue(value, 'change')
    },
    syncSelectAllState() {
      if (!this.multiple || !this.showSelectAll) {
        return
      }

      const dropdown = document.querySelector<HTMLElement>('.el-cascader__dropdown')
      const menus = dropdown?.querySelectorAll<HTMLElement>('.el-cascader-menu')
      const selectedValueSet = new Set(this.getCurrentSelectedLeafValues().map((item) => String(item)))

      menus?.forEach((menu, index) => {
        const selectAllNode = menu.querySelector<HTMLElement>('.el-cascader-node')
        const checkbox = selectAllNode?.querySelector<HTMLElement>('.el-checkbox__input')
        const values = this.collectLeafValues(this.getColumnNodes()[index] ?? [])
        const selectedCount = values.filter((item) => selectedValueSet.has(String(item))).length
        const isChecked = values.length > 0 && selectedCount === values.length
        const isIndeterminate = selectedCount > 0 && selectedCount < values.length

        checkbox?.classList.toggle('is-checked', isChecked)
        checkbox?.classList.toggle('is-indeterminate', isIndeterminate)
      })
    },
    trimNationalLabel() {
      if (!this.selectableNational || this.showAllLevels === false) {
        return
      }

      const prefix = `${this.nationalLabel}${this.separator}`

      ;(this.$el as HTMLElement)
        .querySelectorAll<HTMLElement>('.el-tag__content, .el-cascader__tags .el-tag span, .el-input__inner')
        .forEach((element) => {
          const text = element.textContent ?? ''

          if (text.startsWith(prefix)) {
            element.textContent = text.slice(prefix.length)
          }
        })
    },
    handleVisibleChange(visible: boolean) {
      this.$emit('visible-change', visible)

      if (visible) {
        this.$nextTick(() => {
          this.syncSelectAllState()
          this.trimNationalLabel()
        })
      }
    },
    handleExpandChange(value: AreaValuePath) {
      this.expandedPath = Array.isArray(value)
        ? value.filter((item) => !this.isSelectAllValue(item))
        : []

      this.$emit('expand-change', value)
      this.$nextTick(() => {
        this.syncSelectAllState()
        this.trimNationalLabel()
      })
    }
  },
  watch: {
    value() {
      this.pendingInnerValue = undefined
      this.nationalSelected = this.isProvinceModelValue(this.modelValue ?? this.value)
      this.$nextTick(this.trimNationalLabel)
    },
    modelValue() {
      this.pendingInnerValue = undefined
      this.nationalSelected = this.isProvinceModelValue(this.modelValue ?? this.value)
      this.$nextTick(this.trimNationalLabel)
    }
  }
})
</script>
