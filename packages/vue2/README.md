# @louismax/cn-area-cascader-vue2

Vue2 + Element UI 中国省市区级联选择组件。

## 安装

```bash
yarn add @louismax/cn-area-cascader-vue2
```

适用于已有 Vue2 + Element UI 项目。`vue` 与 `element-ui` 为 peer dependencies，需要由业务项目提供。

## 使用

```ts
import CnAreaCascader from '@louismax/cn-area-cascader-vue2'
```

```vue
<CnAreaCascader v-model="areaCode" />
```

## Props

```text
value
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

默认开启 `collapseSelected`。如果某个父级下所有子级都被选中，返回结果会折叠为父级。

## 选择任意层级

```vue
<CnAreaCascader v-model="value" check-strictly />
```

默认单选只能选择末级区县，开启后可选择省、市、区任意一级。多选场景无需该配置。

## 编辑回填

业务接口只保存编码时，可以直接回填编码。组件会根据 `valueMode` 自动转换为内部回显值。

## License

MIT
