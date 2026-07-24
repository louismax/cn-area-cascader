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

export function flattenAreaTree<T extends Record<string, any> = AreaNode>(
  data: T[],
  fields?: AreaFieldNames
): T[] {
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

  visit(data)

  return result
}

export function findAreaPath<T extends Record<string, any> = AreaNode>(
  data: T[],
  valuePath: AreaValuePath,
  fields?: AreaFieldNames
): T[] {
  const fieldNames = getFieldNames(fields)
  const result: T[] = []
  let nodes: T[] | undefined = data

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

export function getAreaText<T extends Record<string, any> = AreaNode>(
  data: T[],
  valuePath: AreaValuePath,
  options: AreaTextOptions = {}
): string {
  const fieldNames = getFieldNames(options.fields)
  const nodes = findAreaPath(data, valuePath, fieldNames)

  return nodes.map((node) => node[fieldNames.label]).join(options.separator ?? ' / ')
}

export function findAreaByValue<T extends Record<string, any> = AreaNode>(
  data: T[],
  value: AreaValue,
  fields?: AreaFieldNames
): T | undefined {
  const fieldNames = getFieldNames(fields)

  return flattenAreaTree(data, fieldNames).find((node) => String(node[fieldNames.value]) === String(value))
}

export function findAreaPathByValue<T extends Record<string, any> = AreaNode>(
  data: T[],
  value: AreaValue,
  fields?: AreaFieldNames
): T[] {
  const fieldNames = getFieldNames(fields)
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

  return visit(data, [])
}

export function compactAreaSelection<T extends Record<string, any> = AreaNode>(
  data: T[],
  selectedValues: AreaValue[],
  options: AreaSelectionCollapseOptions = {}
): T[] {
  const fieldNames = getFieldNames(options.fields)
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

  return data.flatMap((node) => visit(node).nodes)
}

export function expandAreaSelection<T extends Record<string, any> = AreaNode>(
  data: T[],
  selectedValues: AreaValue[],
  options: AreaSelectionCollapseOptions = {}
): T[] {
  const fieldNames = getFieldNames(options.fields)
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
    const node = findAreaByValue(data, value, fieldNames)

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

export function createAreaModelValue<T extends Record<string, any> = AreaNode>(
  data: T[],
  code: AreaValue,
  options: AreaModelValueOptions = {}
): AreaModelValue | undefined {
  const fieldNames = getFieldNames(options.fields)
  const mode: AreaValueMode = options.mode ?? 'leaf-code'
  const path = findAreaPathByValue(data, code, fieldNames)

  if (!path.length) {
    return undefined
  }

  const leafNode = path[path.length - 1]

  if (mode === 'path-code') {
    return path.map((node) => node[fieldNames.value])
  }

  if (mode === 'leaf-node') {
    return toOutputNode(data, leafNode, options)
  }

  if (mode === 'path-node') {
    return toOutputPath(data, path, options)
  }

  return leafNode[fieldNames.value]
}

export function createAreaModelValues<T extends Record<string, any> = AreaNode>(
  data: T[],
  codes: AreaValue[],
  options: AreaModelValueOptions = {}
): AreaModelValue[] {
  return codes
    .map((code) => createAreaModelValue(data, code, options))
    .filter((value): value is AreaModelValue => value !== undefined)
}
