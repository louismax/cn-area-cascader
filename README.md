# cn-area-cascader

面向 Vue 的中国省市区级联选择组件库，提供 Vue3（Element Plus）与 Vue2（Element UI）版本。

在线 Demo：https://louismax.github.io/cn-area-cascader/

## 包

```text
@louismax/cn-area-cascader       Vue3 + Element Plus 主包
@louismax/cn-area-cascader-vue2  Vue2 + Element UI 兼容包
@louismax/cn-area-cascader-core  省市区数据与工具函数
```

## 特性

- 内置中国省市区数据
- 支持自定义数据源与字段映射
- 支持单选、多选
- 单选支持配置选择任意层级，多选天然支持父级选择与半选状态
- 支持多选父级折叠：子级全选时返回父级
- 支持显示全国根节点
- 支持多种返回格式：末级编码、路径编码、末级对象、路径树
- 支持编辑回填：业务只存编码，组件可自动回显对象模式

## Vue3 安装

```bash
yarn add @louismax/cn-area-cascader
```

适用于已有 Vue3 + Element Plus 项目。`vue` 与 `element-plus` 为 peer dependencies，需要由业务项目提供。

```vue
<template>
  <CnAreaCascader v-model="areaCode" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CnAreaCascader from '@louismax/cn-area-cascader'

const areaCode = ref('')
</script>
```

## Vue2 安装

```bash
yarn add @louismax/cn-area-cascader-vue2
```

适用于已有 Vue2 + Element UI 项目。`vue` 与 `element-ui` 为 peer dependencies，需要由业务项目提供。

```ts
import CnAreaCascader from '@louismax/cn-area-cascader-vue2'
```

## 返回格式

```vue
<CnAreaCascader v-model="value" value-mode="leaf-node" />
```

```text
leaf-code  返回末级编码，默认
path-code  返回路径编码
leaf-node  返回末级对象
path-node  返回路径树
```

对象返回默认包含：

```text
pathLabels
pathValues
fullLabel
```

## 组件属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `v-model` / `modelValue` | `string \| string[] \| object \| object[]` | - | 组件绑定值。Vue3 使用 `v-model` / `modelValue`，Vue2 可使用 `v-model` / `value`。实际结构由 `valueMode` 和 `multiple` 决定。 |
| `data` | `AreaNode[]` | 内置省市区数据 | 自定义省市区树形数据。不传时使用组件内置中国省市区数据。 |
| `props` | `AreaFieldNames` | `defaultAreaProps` | 自定义字段映射，用于适配业务数据中的 `label`、`value`、`children`、`level` 等字段名。 |
| `multiple` | `boolean` | `false` | 是否开启多选。多选时支持父级选择、半选状态和父级折叠返回。 |
| `valueMode` | `'leaf-code' \| 'path-code' \| 'leaf-node' \| 'path-node'` | `'leaf-code'` | 控制对外返回格式。默认只返回最后一级编码。 |
| `collapseSelected` | `boolean` | `true` | 多选时是否折叠父级。开启后，如果某父级下所有子级都被选中，返回结果只保留该父级。 |
| `selectableNational` | `boolean` | `false` | 是否显示全国根节点。开启后选择层级变为 `全国 / 省 / 市 / 区`，但对外返回不会包含全国节点。 |
| `nationalLabel` | `string` | `'全国'` | 全国根节点的展示名称。 |
| `nationalValue` | `string` | `'100000'` | 全国根节点的编码值。 |
| `checkStrictly` | `boolean` | `false` | 单选时是否允许选择任意层级。默认只能选择末级区县。多选场景本身支持父级选择，通常不需要配置。 |
| `placeholder` | `string` | `'请选择省市区'` | 输入框占位文案。 |
| `disabled` | `boolean` | `false` | 是否禁用组件。 |
| `clearable` | `boolean` | `true` | 是否显示清空按钮。 |
| `filterable` | `boolean` | `false` | 是否开启搜索。 |
| `autocomplete` | `string` | `'off'` | Vue3 原生输入框的自动填充策略。 |
| `separator` | `string` | `' / '` | 路径展示分隔符。 |
| `showAllLevels` | `boolean` | `true` | 是否在选择器展示完整路径。开启全国根时，组件会隐藏 tag 中的全国前缀，但保留省市区路径。 |
| `includePathInfo` | `boolean` | `true` | 对象返回时是否附加 `pathLabels`、`pathValues`、`fullLabel` 等路径信息。 |
| `showCheckedStrategy` | `'child' \| 'parent'` | 跟随 `collapseSelected` | Vue3 + Element Plus 多选展示策略。默认配合父级折叠展示父级 tag。 |
| `collapseTags` | `boolean` | `true` | Vue3 + Element Plus 多选时是否折叠 tag。 |
| `collapseTagsTooltip` | `boolean` | `true` | Vue3 + Element Plus tag 折叠后是否通过 tooltip 展示完整内容。 |
| `maxCollapseTags` | `number \| 'auto'` | `'auto'` | Vue3 + Element Plus 多选折叠时最多展示的 tag 数。`auto` 会根据组件宽度估算。 |

## 多选父级折叠

```vue
<CnAreaCascader v-model="values" multiple />
```

多选默认开启 `collapseSelected`。如果某个父级下所有子级都被选中，返回结果会折叠为父级。

```vue
<CnAreaCascader v-model="values" multiple :collapse-selected="false" />
```

## 选择任意层级

默认单选只能选择末级区县。单选时可开启任意层级选择：

```vue
<CnAreaCascader v-model="value" check-strictly />
```

开启后单选可选择省、市、区任意一级。多选场景无需该配置，父级选择与半选状态由 Cascader 自身支持。

## 显示全国根

```vue
<CnAreaCascader v-model="values" multiple selectable-national />
```

开启后内部选择层级为：

```text
全国 / 省 / 市 / 区
```

对外返回不会包含全国节点。

## 编辑回填

接口只保存编码时，也可以直接回填：

```ts
area.value = '110101'
```

如果当前 `valueMode="leaf-node"`，组件内部会自动转换为区域对象用于回显。

也可以使用 core 工具手动转换：

```ts
import { createAreaModelValue } from '@louismax/cn-area-cascader-core'

const value = createAreaModelValue('110101', {
  mode: 'leaf-node'
})
```

## Core 工具函数

```ts
import {
  defaultAreaProps,
  flattenAreaTree,
  findAreaByValue,
  findAreaPath,
  findAreaPathByValue,
  getAreaText,
  compactAreaSelection,
  expandAreaSelection,
  createAreaModelValue,
  createAreaModelValues
} from '@louismax/cn-area-cascader-core'
```

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

## License

MIT
