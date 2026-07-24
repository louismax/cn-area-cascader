import type { AreaFieldNames, AreaNode, AreaTextOptions, AreaValue, AreaValuePath } from './types'

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
