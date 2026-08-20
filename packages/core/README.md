# @louismax/cn-area-cascader-core

中国省市区数据与无框架工具函数。

## 安装

```bash
yarn add @louismax/cn-area-cascader-core
```

## 数据

```ts
import { chinaAreaTreeFull } from '@louismax/cn-area-cascader-core/full'
```

默认数据：工具函数在不传 `data` 时会自动使用内置 `chinaAreaTree`（不再需要手动传入）；如果你有自定义树数据，可在调用时手工传入第三方参数。

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
const node = findAreaByValue('110101')
const path = findAreaPathByValue('110101')
const text = getAreaText(['110000', '110100', '110101'])
```

## 多选折叠

```ts
const compactNodes = compactAreaSelection(['110101', '110102'])
const leafNodes = expandAreaSelection(['110100'])
```

## 编辑回填

```ts
const value = createAreaModelValue('110101', {
  mode: 'leaf-node'
})
```

多选：

```ts
const values = createAreaModelValues(['110101', '110102'], {
  mode: 'leaf-node'
})
```

## License

MIT
