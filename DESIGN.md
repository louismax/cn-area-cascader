# cn-area-cascader 仓库设计文档

## 1. 项目目标

构建一个面向 Vue 生态的中国省市区三级级联选择组件库（el-cascader 风格），最终发布为公网可安装的 npm 公共组件包，在同一仓库中提供两套实现：
- Vue2 版本：基于 `element-ui`
- Vue3 版本：基于 `element-plus`，作为默认主版本

对外目标：
- 统一数据与公共能力（省市区原始数据、格式化工具）
- 避免跨 Vue 版本依赖冲突
- 支持独立发布 `vue2` 与 `vue3` 两个 npm 包
- npm scope 固定为个人账户 `@louismax`
- 使用 `yarn` 作为项目开发与安装命令示例
- 使用 Vite library mode 作为组件库构建方案

## 2. 目录结构

```text
cn-area-cascader/
├─ .gitignore
├─ yarn.lock
├─ package.json
├─ README.md
├─ README.zh-CN.md
├─ CHANGELOG.md
├─ .github/
│  ├─ workflows/
│  │  ├─ release-vue2.yml
│  │  └─ release-vue3.yml
│  └─ CODEOWNERS（可选）
├─ packages/
│  ├─ core/
│  │  ├─ src/
│  │  │  ├─ data/
│  │  │  │  └─ china-area-tree.json
│  │  │  ├─ index.ts
│  │  │  ├─ types.ts
│  │  │  └─ utils.ts
│  │  └─ package.json
│  ├─ vue2/
│  │  ├─ src/
│  │  │  ├─ components/
│  │  │  │  └─ CnAreaCascader.vue
│  │  │  ├─ index.ts（或 index.js）
│  │  │  └─ install.ts
│  │  ├─ vite.config.ts
│  │  ├─ package.json
│  │  └─ README.md
│  └─ vue3/
│     ├─ src/
│     │  ├─ components/
│     │  │  └─ CnAreaCascader.vue
│     │  ├─ index.ts
│     │  └─ install.ts
│     ├─ vite.config.ts
│     ├─ package.json
│     └─ README.md
└─ docs/
   ├─ API.md
   └─ MIGRATION.md
```

## 3. 架构说明

- `core`：仅负责无框架能力
  - 输出统一的树形数据结构（`[{ label, value, code, level, children: [...] }]`）
  - 提供 ID/Label 映射、扁平/搜索工具等辅助函数
  - 提供编辑回填工具，将业务编码转换为组件 `v-model` 需要的值格式
  - 不依赖 Vue、element、DOM
- `vue2`：组件实现 + install 入口
  - 依赖 `element-ui`
  - peerDependencies 使用 `vue@^2.7.0`
- `vue3`：组件实现 + install 入口
  - 依赖 `element-plus`
  - peerDependencies 使用 `element-plus@^2.10.5`
  - peerDependencies 使用 `vue@^3.0.0`
  - 作为默认主包发布

这样可避免在单一包内强绑定两个 UI 生态引起的依赖冲突。

## 4. 发布包命名

- Vue3 主版本：`@louismax/cn-area-cascader`
- Vue2 兼容版本：`@louismax/cn-area-cascader-vue2`
- 公共工具包：`@louismax/cn-area-cascader-core`

命名约定：
- `@louismax/cn-area-cascader` 默认表示 Vue3 + Element Plus 版本
- Vue2 项目需要显式安装 `@louismax/cn-area-cascader-vue2`
- `core` 包可被两个组件包依赖，也可供业务项目单独使用省市区数据与工具函数

## 5. 组件对外 API 建议

统一命名：`CnAreaCascader`

props（核心）：
- `modelValue` / `value`：`Array<string>` 或 `Array<number>`（兼容 v-model）
- `data`：树形数据，可覆盖默认的 core 数据
- `props`：自定义数据源字段映射
- `multiple`：是否开启多选区域
- `collapseSelected`：多选时是否折叠全选子级为父级，默认 `true`
- `showCheckedStrategy`：Vue3 多选时输入框已选项展示策略，默认跟随 `collapseSelected`
- `collapseTags`：Vue3 多选时是否折叠已选标签，默认多选时开启
- `collapseTagsTooltip`：Vue3 多选折叠标签时是否通过 tooltip 展示完整内容，默认 `true`
- `maxCollapseTags`：Vue3 多选折叠标签最大展示数量，默认 `auto`，按组件宽度估算
- `selectableNational`：是否显示“全国”根节点，默认 `false`
- `nationalLabel`：全国根节点展示名称，默认 `全国`
- `nationalValue`：全国根节点绑定值，默认 `100000`
- `showAllLevels`：是否展示完整路径文本，默认开启；开启全国根时默认关闭，避免 tag 显示 `全国 / 省`
- `includePathInfo`：对象返回时是否补充路径上下文信息，默认 `true`
- `checkStrictly`：单选时是否支持选择任意一级区域，默认 `false`
- `valueMode`：返回值格式，默认 `leaf-code`
- `placeholder`
- `disabled`
- `clearable`
- `filterable`
- `separator`

events（核心）：
- `change`
- `visible-change`
- `expand-change`
- `blur` / `focus`

功能建议：
- 默认使用省市区三级（可读到第三层）
- 支持纯文本回显与 ID 回显
- 提供 `getAreaText(value)` 便于显示
- 支持使用者传入自定义省市区数据源
- 支持通过字段映射适配不同数据结构
- 支持单选与多选区域，默认单选
- 支持配置单选时是否只能选择末级，默认只能选择末级
- 支持多选结果自动折叠，默认将已全选的子级提升为父级返回
- Vue3 基于 Element Plus 的 `show-checked-strategy` 控制多选输入框展示，默认折叠展示父级
- Vue3 多选默认折叠标签，并根据组件宽度自动估算可展示 tag 数量，避免输入框被大量标签撑高
- 可选显示全国根节点，开启后多选数据层级为 `全国 / 省 / 市 / 区`
- 选择全国时最终返回所有省级数据，不返回全国节点本身
- 支持配置返回末级编码、路径编码、末级对象、路径树

返回值格式：

```ts
type AreaValueMode = 'leaf-code' | 'path-code' | 'leaf-node' | 'path-node'
```

返回值说明：
- `leaf-code`：返回最后一级区域编码，默认值。例如 `110101`
- `path-code`：返回当前选中区域的路径编码列表。例如 `['110000', '110100', '110101']`
- `leaf-node`：返回最后一级区域对象，返回对象不包含 `children`，默认附带路径上下文
- `path-node`：返回当前选中区域的路径树，只包含当前选中路径上的 `children`，默认每个节点附带路径上下文
- 开启 `multiple` 后，每种模式返回对应的数组集合
- 对象返回默认补充 `pathLabels`、`pathValues`、`fullLabel`，方便区分重名区域

编辑回填工具：

```ts
createAreaModelValue(data, code, options)
createAreaModelValues(data, codes, options)
```

用途：
- `createAreaModelValue`：将单个区域编码转换为当前 `valueMode` 对应的单选 `v-model` 值
- `createAreaModelValues`：将多个区域编码转换为当前 `valueMode` 对应的多选 `v-model` 值
- `options.mode` 对应组件的 `valueMode`
- `options.fields` 支持自定义数据源字段映射
- `options.includePathInfo` 控制对象返回时是否补充路径上下文
- 多选默认开启 `collapseSelected`，如果某个父级下所有叶子节点都被选中，则只返回该父级
- 如需返回所有选中的原始叶子结果，可设置 `collapseSelected=false`
- Vue3 中 `showCheckedStrategy` 可显式设置为 `parent` 或 `child`，未设置时 `collapseSelected=true` 使用 `parent`，否则使用 `child`

安装示例：

```bash
yarn add @louismax/cn-area-cascader
```

Vue3 使用示例：

```ts
import CnAreaCascader from '@louismax/cn-area-cascader'
```

Vue2 安装示例：

```bash
yarn add @louismax/cn-area-cascader-vue2
```

## 6. 组件名与导出规范

- 组件名保持统一：`CnAreaCascader`
- 包导出：
  - 默认导出组件
  - 可选 `install` 插件式导出

建议使用 kebab-case 文件名 + PascalCase 组件名：
- 文件：`CnAreaCascader.vue`
- 导出名：`CnAreaCascader`

## 7. 省市区数据格式

默认 JSON 文件：`packages/core/src/data/china-area-tree.json`

字段定义：

```ts
export interface AreaFieldNames {
  label?: string
  value?: string
  code?: string
  level?: string
  children?: string
}

export interface AreaNode {
  label: string
  value: string
  code: string
  level: 1 | 2 | 3
  children?: AreaNode[]
}
```

字段说明：
- `label`：展示名称，例如 `北京市`
- `value`：级联组件绑定值，默认与 `code` 相同
- `code`：行政区划代码，使用字符串保存
- `level`：层级，`1` 表示省级，`2` 表示市级，`3` 表示区县级
- `children`：下级节点，仅有下级时提供，区县节点不强制提供空数组

数据示例：

```json
[
  {
    "label": "北京市",
    "value": "110000",
    "code": "110000",
    "level": 1,
    "children": [
      {
        "label": "北京市",
        "value": "110100",
        "code": "110100",
        "level": 2,
        "children": [
          {
            "label": "东城区",
            "value": "110101",
            "code": "110101",
            "level": 3
          }
        ]
      }
    ]
  }
]
```

设计约束：
- 行政区划代码统一使用字符串，避免数字类型导致编码格式问题
- 默认数据只包含 `label`、`value`、`code`、`level`、`children`
- `pinyin`、`shortName`、`zipCode` 等字段可作为增强数据包或可选字段扩展
- `lng`、`lat`、`weatherCode` 等定位与第三方天气编码字段不进入默认数据与增强数据
- 发布到 npm 的 JSON 数据文件使用单行压缩格式，减少包体积
- 数据来源、更新时间与变更说明需在 `CHANGELOG.md` 或发布说明中明确

自定义数据源：

组件默认使用 `core` 内置的 `china-area-tree.json`。使用者也可以通过 `data` 传入自定义省市区树，并通过 `props` 指定字段映射。

默认字段映射：

```ts
const defaultAreaProps = {
  label: 'label',
  value: 'value',
  code: 'code',
  level: 'level',
  children: 'children'
}
```

自定义数据示例：

```ts
const areaData = [
  {
    name: '北京市',
    id: '110000',
    areaCode: '110000',
    depth: 1,
    nodes: [
      {
        name: '北京市',
        id: '110100',
        areaCode: '110100',
        depth: 2,
        nodes: [
          {
            name: '东城区',
            id: '110101',
            areaCode: '110101',
            depth: 3
          }
        ]
      }
    ]
  }
]
```

组件使用示例：

```vue
<CnAreaCascader
  v-model="areaValue"
  :data="areaData"
  :props="{
    label: 'name',
    value: 'id',
    code: 'areaCode',
    level: 'depth',
    children: 'nodes'
  }"
/>
```

## 8. 构建与发布规则

- 所有子包各自独立 `package.json`
- 组件包统一使用 Vite library mode 构建
- Vue3 包使用 `@vitejs/plugin-vue`
- Vue2 包使用 `@vitejs/plugin-vue2`
- `vue`、`element-plus`、`element-ui`、`@louismax/cn-area-cascader-core` 均作为 external，不打进组件产物
- 根仓库提供统一脚本：
  - `yarn build`
  - `yarn build:core`
  - `yarn build:vue3`
  - `yarn build:vue2`
- 子包发布配置建议：

```json
{
  "publishConfig": {
    "access": "public"
  },
  "files": [
    "dist",
    "README.md",
    "package.json"
  ]
}
```

- 首次发布 scoped public package 时使用：

```bash
npm publish --access public
```

- CI 流程建议：
  1. 安装依赖
  2. 运行 lint/typecheck（如配置）
  3. build
  4. 检查发布内容
  5. 打标签发布指定包

## 9. Vue2 与 Vue3 差异点处理

- `vue2`：支持 `@Model`/`v-model` 老版机制与 `modelValue` 兼容层
- `vue3`：使用标准 `v-model`（`modelValue` + `update:modelValue`）
- 逻辑复用尽量放到 `core`，模板/生命周期/指令层分别实现

## 10. 里程碑（建议）

1. 完成 `core` 数据模型与转换工具
2. 完成 `vue3` 组件最小可用版（element-plus）
3. 完成 `vue2` 组件最小可用版（element-ui）
4. 完成统一类型定义与文档
5. CI + 发布测试
6. 打 tag 发布到 npm

## 11. 风险与边界

- element-ui 与 element-plus 的 `el-cascader` 参数细节存在差异，需在各自版本 README 说明
- 省市区数据版权与更新频率需明确（建议放在 `CHANGELOG` 与发布说明）
- 若要支持“区划号 + 拼音 + 简称 + 邮编”等增强字段，优先加到 `core` 的可选字段，避免影响 `el-cascader` 兼容字段
- 定位信息与第三方天气编码存在数据准确性、授权边界和更新频率问题，默认不作为公共 npm 数据能力提供
