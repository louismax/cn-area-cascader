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

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` / `v-model` | `string \| string[] \| object \| object[]` | - | 组件绑定值，实际结构由 `valueMode` 和 `multiple` 决定。 |
| `modelValue` | `string \| string[] \| object \| object[]` | - | 兼容部分写法，Vue2 项目优先使用 `value` / `v-model`。 |
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
