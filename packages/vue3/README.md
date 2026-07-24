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

```text
modelValue
data
props
multiple
collapseSelected
selectableNational
valueMode
checkStrictly
placeholder
disabled
clearable
filterable
separator
showAllLevels
includePathInfo
```

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
