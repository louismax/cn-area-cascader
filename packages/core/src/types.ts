export interface AreaFieldNames {
  label?: string
  value?: string
  code?: string
  level?: string
  children?: string
  disabled?: string
  leaf?: string
  multiple?: boolean
  checkStrictly?: boolean
  emitPath?: boolean
  expandTrigger?: 'click' | 'hover'
}

export interface AreaNode {
  label: string
  value: string
  code: string
  level: 1 | 2 | 3
  children?: AreaNode[]
}

export interface AreaOutputNode extends Omit<AreaNode, 'children'> {
  pathLabels?: string[]
  pathValues?: AreaValue[]
  fullLabel?: string
}

export interface AreaFullNode extends AreaNode {
  parentCode: string
  fullName?: string
  shortName?: string
  fullShortName?: string
  cityCode?: string
  zipCode?: string
  pinyin?: string
  jianpin?: string
  firstChar?: string
  children?: AreaFullNode[]
}

export type AreaValue = string | number

export type AreaValuePath = AreaValue[]

export type AreaValueMode = 'leaf-code' | 'path-code' | 'leaf-node' | 'path-node'

export type AreaModelValue =
  | AreaValue
  | AreaValuePath
  | AreaValuePath[]
  | Record<string, any>
  | Record<string, any>[]
  | Record<string, any>[][]

export interface AreaTextOptions {
  separator?: string
  fields?: AreaFieldNames
}

export interface AreaSelectionCollapseOptions {
  fields?: AreaFieldNames
}

export interface AreaModelValueOptions {
  mode?: AreaValueMode
  fields?: AreaFieldNames
  separator?: string
  includePathInfo?: boolean
}
