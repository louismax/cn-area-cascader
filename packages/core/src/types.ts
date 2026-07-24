export interface AreaFieldNames {
  label?: string
  value?: string
  code?: string
  level?: string
  children?: string
  disabled?: string
  leaf?: string
}

export interface AreaNode {
  label: string
  value: string
  code: string
  level: 1 | 2 | 3
  children?: AreaNode[]
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

export interface AreaTextOptions {
  separator?: string
  fields?: AreaFieldNames
}
