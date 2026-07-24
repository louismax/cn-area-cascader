# @louismax/cn-area-cascader-core

中国省市区数据与无框架工具函数。

## 安装

```bash
yarn add @louismax/cn-area-cascader-core
```

## 数据

```ts
import { chinaAreaTree } from '@louismax/cn-area-cascader-core'
```

增强数据：

```ts
import { chinaAreaTreeFull } from '@louismax/cn-area-cascader-core/full'
```

## 工具函数

```ts
import {
  findAreaByValue,
  findAreaPathByValue,
  flattenAreaTree,
  getAreaText,
  createAreaModelValue,
  createAreaModelValues
} from '@louismax/cn-area-cascader-core'
```

## 函数说明

```text
defaultAreaProps        默认字段映射
flattenAreaTree         将树形省市区数据拍平成数组
findAreaByValue         根据编码查找区域节点
findAreaPath            根据路径编码查找路径节点
findAreaPathByValue     根据单个编码反查完整路径节点
getAreaText             根据路径编码生成展示文本
compactAreaSelection    多选时将全选子级折叠为父级
expandAreaSelection     将父级选择展开为所有叶子节点
createAreaModelValue    将单个编码转换为组件 v-model 值
createAreaModelValues   将多个编码转换为组件多选 v-model 值
```

## 基础查询

```ts
const node = findAreaByValue(chinaAreaTree, '110101')
const path = findAreaPathByValue(chinaAreaTree, '110101')
const text = getAreaText(chinaAreaTree, ['110000', '110100', '110101'])
```

## 多选折叠

```ts
const compactNodes = compactAreaSelection(chinaAreaTree, ['110101', '110102'])
const leafNodes = expandAreaSelection(chinaAreaTree, ['110100'])
```

## 编辑回填

```ts
const value = createAreaModelValue(chinaAreaTree, '110101', {
  mode: 'leaf-node'
})
```

多选：

```ts
const values = createAreaModelValues(chinaAreaTree, ['110101', '110102'], {
  mode: 'leaf-node'
})
```

## License

MIT
