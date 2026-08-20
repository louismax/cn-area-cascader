import type {
  AreaFieldNames,
  AreaModelValue,
  AreaModelValueOptions,
  AreaNode,
  AreaSelectionCollapseOptions,
  AreaTextOptions,
  AreaValue,
  AreaValueMode,
  AreaValuePath
} from './types'
import chinaAreaTreeData from './data/china-area-tree.json'

export const defaultAreaProps = {
  label: 'label',
  value: 'value',
  code: 'code',
  level: 'level',
  children: 'children'
} satisfies Required<Pick<AreaFieldNames, 'label' | 'value' | 'code' | 'level' | 'children'>>

const getFieldNames = (fields?: AreaFieldNames) => ({
  ...defaultAreaProps,
  ...fields
})

const resolveAreaData = <T extends Record<string, any>>(data?: T[]) => data ?? (chinaAreaTreeData as unknown as T[])

export function flattenAreaTree<T extends Record<string, any> = AreaNode>(
  data?: T[],
  fields?: AreaFieldNames
): T[] {
  const source = resolveAreaData(data)
  const fieldNames = getFieldNames(fields)
  const result: T[] = []

  const visit = (nodes: T[]) => {
    nodes.forEach((node) => {
      result.push(node)

      const children = node[fieldNames.children]
      if (Array.isArray(children)) {
        visit(children)
      }
    })
  }

  visit(source)

  return result
}

export function findAreaPath(valuePath: AreaValuePath, fields?: AreaFieldNames): AreaNode[]
export function findAreaPath<T extends Record<string, any>>(data: T[], valuePath: AreaValuePath, fields?: AreaFieldNames): T[]
export function findAreaPath<T extends Record<string, any> = AreaNode>(
  dataOrValuePath: T[] | AreaValuePath,
  valuePathOrFields?: AreaValuePath | AreaFieldNames,
  fields?: AreaFieldNames
): T[] {
  const hasData = Array.isArray(valuePathOrFields)
  const data = hasData ? dataOrValuePath as T[] : undefined
  const valuePath = hasData ? valuePathOrFields as AreaValuePath : dataOrValuePath as AreaValuePath
  const source = resolveAreaData(data)
  const fieldNames = getFieldNames(hasData ? fields : valuePathOrFields as AreaFieldNames | undefined)
  const result: T[] = []
  let nodes: T[] | undefined = source

  for (const value of valuePath) {
    const node: T | undefined = nodes?.find((item) => String(item[fieldNames.value]) === String(value))

    if (!node) {
      return []
    }

    result.push(node)
    nodes = node[fieldNames.children]
  }

  return result
}

export function getAreaText(valuePath: AreaValuePath, options?: AreaTextOptions): string
export function getAreaText<T extends Record<string, any>>(data: T[], valuePath: AreaValuePath, options?: AreaTextOptions): string
export function getAreaText<T extends Record<string, any> = AreaNode>(
  dataOrValuePath: T[] | AreaValuePath,
  valuePathOrOptions?: AreaValuePath | AreaTextOptions,
  options: AreaTextOptions = {}
): string {
  const hasData = Array.isArray(valuePathOrOptions)
  const data = hasData ? dataOrValuePath as T[] : undefined
  const valuePath = hasData ? valuePathOrOptions as AreaValuePath : dataOrValuePath as AreaValuePath
  const resolvedOptions = hasData ? options : valuePathOrOptions as AreaTextOptions | undefined ?? {}
  const source = resolveAreaData(data)
  const fieldNames = getFieldNames(resolvedOptions.fields)
  const nodes = findAreaPath(source, valuePath, fieldNames)

  return nodes.map((node) => node[fieldNames.label]).join(resolvedOptions.separator ?? ' / ')
}

export function findAreaByValue(value: AreaValue, fields?: AreaFieldNames): AreaNode | undefined
export function findAreaByValue<T extends Record<string, any>>(data: T[], value: AreaValue, fields?: AreaFieldNames): T | undefined
export function findAreaByValue<T extends Record<string, any> = AreaNode>(
  dataOrValue: T[] | AreaValue,
  valueOrFields?: AreaValue | AreaFieldNames,
  fields?: AreaFieldNames
): T | undefined {
  const hasData = Array.isArray(dataOrValue)
  const data = hasData ? dataOrValue as T[] : undefined
  const value = hasData ? valueOrFields as AreaValue : dataOrValue
  const source = resolveAreaData(data)
  const fieldNames = getFieldNames(hasData ? fields : valueOrFields as AreaFieldNames | undefined)

  return flattenAreaTree(source, fieldNames).find((node) => String(node[fieldNames.value]) === String(value))
}

export function findAreaPathByValue(value: AreaValue, fields?: AreaFieldNames): AreaNode[]
export function findAreaPathByValue<T extends Record<string, any>>(data: T[], value: AreaValue, fields?: AreaFieldNames): T[]
export function findAreaPathByValue<T extends Record<string, any> = AreaNode>(
  dataOrValue: T[] | AreaValue,
  valueOrFields?: AreaValue | AreaFieldNames,
  fields?: AreaFieldNames
): T[] {
  const hasData = Array.isArray(dataOrValue)
  const data = hasData ? dataOrValue as T[] : undefined
  const value = hasData ? valueOrFields as AreaValue : dataOrValue
  const source = resolveAreaData(data)
  const fieldNames = getFieldNames(hasData ? fields : valueOrFields as AreaFieldNames | undefined)
  const targetValue = String(value)

  const visit = (nodes: T[], path: T[]): T[] => {
    for (const node of nodes) {
      const nextPath = [...path, node]

      if (String(node[fieldNames.value]) === targetValue) {
        return nextPath
      }

      const children = node[fieldNames.children]
      if (Array.isArray(children)) {
        const result = visit(children, nextPath)

        if (result.length) {
          return result
        }
      }
    }

    return []
  }

  return visit(source, [])
}

export function compactAreaSelection(selectedValues: AreaValue[], options?: AreaSelectionCollapseOptions): AreaNode[]
export function compactAreaSelection<T extends Record<string, any>>(data: T[], selectedValues: AreaValue[], options?: AreaSelectionCollapseOptions): T[]
export function compactAreaSelection<T extends Record<string, any> = AreaNode>(
  dataOrSelectedValues: T[] | AreaValue[],
  selectedValuesOrOptions?: AreaValue[] | AreaSelectionCollapseOptions,
  options: AreaSelectionCollapseOptions = {}
): T[] {
  const hasData = Array.isArray(selectedValuesOrOptions)
  const data = hasData ? dataOrSelectedValues as T[] : undefined
  const selectedValues = hasData ? selectedValuesOrOptions as AreaValue[] : dataOrSelectedValues as AreaValue[]
  const resolvedOptions = hasData ? options : selectedValuesOrOptions as AreaSelectionCollapseOptions | undefined ?? {}
  const source = resolveAreaData(data)
  const fieldNames = getFieldNames(resolvedOptions.fields)
  const selectedValueSet = new Set(selectedValues.map((value) => String(value)))

  const visit = (node: T): { nodes: T[]; selectedLeafCount: number; totalLeafCount: number } => {
    const children = node[fieldNames.children]

    if (!Array.isArray(children) || children.length === 0) {
      const selectedLeafCount = selectedValueSet.has(String(node[fieldNames.value])) ? 1 : 0

      return {
        nodes: selectedLeafCount ? [node] : [],
        selectedLeafCount,
        totalLeafCount: 1
      }
    }

    const result = children.reduce(
      (summary, child) => {
        const childResult = visit(child)

        summary.nodes.push(...childResult.nodes)
        summary.selectedLeafCount += childResult.selectedLeafCount
        summary.totalLeafCount += childResult.totalLeafCount

        return summary
      },
      { nodes: [] as T[], selectedLeafCount: 0, totalLeafCount: 0 }
    )

    if (result.totalLeafCount > 0 && result.selectedLeafCount === result.totalLeafCount) {
      return {
        nodes: [node],
        selectedLeafCount: result.selectedLeafCount,
        totalLeafCount: result.totalLeafCount
      }
    }

    return result
  }

  return source.flatMap((node) => visit(node).nodes)
}

export function expandAreaSelection(selectedValues: AreaValue[], options?: AreaSelectionCollapseOptions): AreaNode[]
export function expandAreaSelection<T extends Record<string, any>>(data: T[], selectedValues: AreaValue[], options?: AreaSelectionCollapseOptions): T[]
export function expandAreaSelection<T extends Record<string, any> = AreaNode>(
  dataOrSelectedValues: T[] | AreaValue[],
  selectedValuesOrOptions?: AreaValue[] | AreaSelectionCollapseOptions,
  options: AreaSelectionCollapseOptions = {}
): T[] {
  const hasData = Array.isArray(selectedValuesOrOptions)
  const data = hasData ? dataOrSelectedValues as T[] : undefined
  const selectedValues = hasData ? selectedValuesOrOptions as AreaValue[] : dataOrSelectedValues as AreaValue[]
  const resolvedOptions = hasData ? options : selectedValuesOrOptions as AreaSelectionCollapseOptions | undefined ?? {}
  const source = resolveAreaData(data)
  const fieldNames = getFieldNames(resolvedOptions.fields)
  const result: T[] = []
  const addedValueSet = new Set<string>()

  const collectLeaves = (node: T) => {
    const children = node[fieldNames.children]

    if (!Array.isArray(children) || children.length === 0) {
      const value = String(node[fieldNames.value])

      if (!addedValueSet.has(value)) {
        addedValueSet.add(value)
        result.push(node)
      }

      return
    }

    children.forEach(collectLeaves)
  }

  selectedValues.forEach((value) => {
    const node = findAreaByValue(source, value, fieldNames)

    if (node) {
      collectLeaves(node)
    }
  })

  return result
}

const toOutputNode = <T extends Record<string, any>>(
  data: T[],
  node: T | undefined,
  options: AreaModelValueOptions
) => {
  if (!node) {
    return undefined
  }

  const fieldNames = getFieldNames(options.fields)
  const { [fieldNames.children]: _children, ...outputNode } = node
  const resultNode = outputNode as Record<string, any>

  if (options.includePathInfo ?? true) {
    const path = findAreaPathByValue(data, node[fieldNames.value], fieldNames)
    resultNode.pathLabels = path.map((item) => item[fieldNames.label])
    resultNode.pathValues = path.map((item) => item[fieldNames.value])
    resultNode.fullLabel = resultNode.pathLabels.join(options.separator ?? ' / ')
  }

  return resultNode
}

const toOutputPath = <T extends Record<string, any>>(
  data: T[],
  nodes: T[],
  options: AreaModelValueOptions
) => {
  const fieldNames = getFieldNames(options.fields)
  let root: Record<string, any> | undefined
  let current: Record<string, any> | undefined

  nodes.forEach((node) => {
    const outputNode = toOutputNode(data, node, options)

    if (!outputNode) {
      return
    }

    if (!root) {
      root = outputNode
      current = outputNode
      return
    }

    current![fieldNames.children] = [outputNode]
    current = outputNode
  })

  return root
}

export function createAreaModelValue(code: AreaValue, options?: AreaModelValueOptions): AreaModelValue | undefined
export function createAreaModelValue<T extends Record<string, any>>(data: T[], code: AreaValue, options?: AreaModelValueOptions): AreaModelValue | undefined
export function createAreaModelValue<T extends Record<string, any> = AreaNode>(
  dataOrCode: T[] | AreaValue,
  codeOrOptions?: AreaValue | AreaModelValueOptions,
  options: AreaModelValueOptions = {}
): AreaModelValue | undefined {
  const hasData = Array.isArray(dataOrCode)
  const data = hasData ? dataOrCode as T[] : undefined
  const code = hasData ? codeOrOptions as AreaValue : dataOrCode
  const resolvedOptions = hasData ? options : codeOrOptions as AreaModelValueOptions | undefined ?? {}
  const source = resolveAreaData(data)
  const fieldNames = getFieldNames(resolvedOptions.fields)
  const mode: AreaValueMode = resolvedOptions.mode ?? 'leaf-code'
  const path = findAreaPathByValue(source, code, fieldNames)

  if (!path.length) {
    return undefined
  }

  const leafNode = path[path.length - 1]

  if (mode === 'path-code') {
    return path.map((node) => node[fieldNames.value])
  }

  if (mode === 'leaf-node') {
    return toOutputNode(source, leafNode, resolvedOptions)
  }

  if (mode === 'path-node') {
    return toOutputPath(source, path, resolvedOptions)
  }

  return leafNode[fieldNames.value]
}

export function createAreaModelValues(codes: AreaValue[], options?: AreaModelValueOptions): AreaModelValue[]
export function createAreaModelValues<T extends Record<string, any>>(data: T[], codes: AreaValue[], options?: AreaModelValueOptions): AreaModelValue[]
export function createAreaModelValues<T extends Record<string, any> = AreaNode>(
  dataOrCodes: T[] | AreaValue[],
  codesOrOptions?: AreaValue[] | AreaModelValueOptions,
  options: AreaModelValueOptions = {}
): AreaModelValue[] {
  const hasData = Array.isArray(codesOrOptions)
  const data = hasData ? dataOrCodes as T[] : undefined
  const codes = hasData ? codesOrOptions as AreaValue[] : dataOrCodes as AreaValue[]
  const resolvedOptions = hasData ? options : codesOrOptions as AreaModelValueOptions | undefined ?? {}
  const source = resolveAreaData(data)
  return codes
    .map((code) => createAreaModelValue(source, code, resolvedOptions))
    .filter((value): value is AreaModelValue => value !== undefined)
}
