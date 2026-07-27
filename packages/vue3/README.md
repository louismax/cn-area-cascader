# @louismax/cn-area-cascader

Vue3 + Element Plus 中国省市区级联选择组件。

## 安装

```bash
yarn add @louismax/cn-area-cascader
```

适用于已有 Vue3 + Element Plus 项目。`vue` 与 `element-plus` 为 peer dependencies，需要由业务项目提供。

## 使用

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

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` / `v-model` | `string \| string[] \| object \| object[]` | - | 组件绑定值，实际结构由 `valueMode` 和 `multiple` 决定。 |
| `data` | `AreaNode[]` | 内置省市区数据 | 自定义省市区树形数据。不传时使用内置数据。 |
| `props` | `AreaFieldNames` | `defaultAreaProps` | 自定义字段映射，用于适配业务数据中的字段名。 |
| `multiple` | `boolean` | `false` | 是否开启多选。 |
| `collapseSelected` | `boolean` | `true` | 多选时是否折叠父级。子级全选时返回父级，避免结果过长。 |
| `selectableNational` | `boolean` | `false` | 是否显示全国根节点。开启后内部为四级选择，对外返回不包含全国。 |
| `nationalLabel` | `string` | `'全国'` | 全国根节点的展示名称。 |
| `nationalValue` | `string` | `'100000'` | 全国根节点的编码值。 |
| `valueMode` | `'leaf-code' \| 'path-code' \| 'leaf-node' \| 'path-node'` | `'leaf-code'` | 控制返回格式。 |
| `checkStrictly` | `boolean` | `false` | 单选时是否允许选择任意层级。多选一般不需要配置。 |
| `placeholder` | `string` | `'请选择省市区'` | 输入框占位文案。 |
| `disabled` | `boolean` | `false` | 是否禁用组件。 |
| `clearable` | `boolean` | `true` | 是否显示清空按钮。 |
| `filterable` | `boolean` | `false` | 是否开启搜索。 |
| `separator` | `string` | `' / '` | 路径展示分隔符。 |
| `showAllLevels` | `boolean` | `true` | 是否展示完整路径。开启全国根时会隐藏 tag 中的全国前缀。 |
| `includePathInfo` | `boolean` | `true` | 对象返回时是否附加路径信息。 |
| `showCheckedStrategy` | `'child' \| 'parent'` | 跟随 `collapseSelected` | Element Plus 多选展示策略。 |
| `collapseTags` | `boolean` | `true` | 多选时是否折叠 tag。 |
| `collapseTagsTooltip` | `boolean` | `true` | tag 折叠后是否通过 tooltip 展示完整内容。 |
| `maxCollapseTags` | `number \| 'auto'` | `'auto'` | 多选折叠时最多展示的 tag 数，`auto` 会根据宽度估算。 |

`checkStrictly` 用于单选时选择任意层级，默认关闭。多选无需该配置，父级选择与半选状态由 Cascader 自身支持。

## valueMode

```text
leaf-code  返回末级编码，默认
path-code  返回路径编码
leaf-node  返回末级对象
path-node  返回路径树
```

## 多选父级折叠

```vue
<CnAreaCascader v-model="values" multiple />
```

默认开启 `collapseSelected`，子级全选时返回父级。

## 选择任意层级

```vue
<CnAreaCascader v-model="value" check-strictly />
```

默认单选只能选择末级区县，开启后可选择省、市、区任意一级。多选场景无需该配置。

## 显示全国根

```vue
<CnAreaCascader v-model="values" multiple selectable-national />
```

内部显示 `全国 / 省 / 市 / 区`，返回值不包含全国节点。

## 编辑回填

业务接口只保存编码时，可以直接回填：

```ts
value.value = '110101'
```

即使 `valueMode="leaf-node"`，组件也会自动转换并回显。

## License

MIT
