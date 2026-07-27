<template>
  <main class="page">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Vue3 + Element Plus</p>
        <h1>中国省市区级联选择，开箱即用又足够灵活</h1>
        <p class="summary">
          内置中国省市区数据，支持自定义数据源、单选、多选、父级折叠返回、全国根节点和业务编码回填。
        </p>
        <div class="hero-actions">
          <a class="primary-link" href="https://www.npmjs.com/package/@louismax/cn-area-cascader" target="_blank" rel="noreferrer">
            查看 npm
          </a>
          <a class="ghost-link" href="https://github.com/louismax/cn-area-cascader" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </div>

      <div class="install-card">
        <span class="card-label">安装</span>
        <div class="install-item">
          <strong>Vue3 + Element Plus</strong>
          <code>yarn add @louismax/cn-area-cascader</code>
          <a href="https://github.com/louismax/cn-area-cascader/blob/master/packages/vue3/README.md" target="_blank" rel="noreferrer">
            查看 Vue3 文档
          </a>
        </div>
        <div class="install-item">
          <strong>Vue2 + Element UI</strong>
          <code>yarn add @louismax/cn-area-cascader-vue2</code>
          <a href="https://github.com/louismax/cn-area-cascader/blob/master/packages/vue2/README.md" target="_blank" rel="noreferrer">
            查看 Vue2 文档
          </a>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="mode-panel">
        <div>
          <p class="section-kicker">全局配置</p>
          <h2>切换配置后，下方所有示例会同步变化</h2>
        </div>
        <div class="mode-tabs">
          <button
            v-for="item in valueModeOptions"
            :key="item.value"
            :class="{ active: valueMode === item.value }"
            type="button"
            @click="setValueMode(item.value)"
          >
            {{ item.label }}
          </button>
        </div>
        <div class="option-grid">
          <label class="option-toggle">
            <span>
              <strong>单选任意级</strong>
              <small>单选时允许选择省、市、区任意层级</small>
            </span>
            <el-switch v-model="checkStrictly" @change="resetValues" />
          </label>
          <label class="option-toggle">
            <span>
              <strong>多选折叠父级</strong>
              <small>子级全选时返回父级，减少结果冗余</small>
            </span>
            <el-switch v-model="collapseSelected" @change="resetValues" />
          </label>
          <label class="option-toggle">
            <span>
              <strong>显示全国根</strong>
              <small>多选时可从全国层统一操作省市区</small>
            </span>
            <el-switch v-model="selectableNational" @change="resetValues" />
          </label>
        </div>
      </div>

      <div class="demo-grid">
        <section class="demo-block">
          <div class="demo-heading">
            <span>01</span>
            <div>
              <h2>默认省市区数据</h2>
              <p>不传数据即可使用内置中国省市区。</p>
            </div>
          </div>
          <CnAreaCascader
            v-model="areaValue"
            :value-mode="valueMode"
            :check-strictly="checkStrictly"
            :selectable-national="selectableNational"
            filterable
          />
          <pre>{{ formatValue(areaValue) }}</pre>
        </section>

        <section class="demo-block">
          <div class="demo-heading">
            <span>02</span>
            <div>
              <h2>自定义数据源</h2>
              <p>通过 props 映射业务侧字段名。</p>
            </div>
          </div>
          <CnAreaCascader
            v-model="customValue"
            :data="customAreaData"
            :props="customProps"
            :value-mode="valueMode"
            :check-strictly="checkStrictly"
            :selectable-national="selectableNational"
            placeholder="请选择自定义区域"
            clearable
          />
          <pre>{{ formatValue(customValue) }}</pre>
        </section>

        <section class="demo-block">
          <div class="demo-heading">
            <span>03</span>
            <div>
              <h2>多选区域</h2>
              <p>重点体验父级折叠返回能力。</p>
            </div>
          </div>
          <CnAreaCascader
            v-model="multipleValue"
            :value-mode="valueMode"
            :check-strictly="checkStrictly"
            :collapse-selected="collapseSelected"
            :selectable-national="selectableNational"
            multiple
            filterable
          />
          <pre>{{ formatValue(multipleValue) }}</pre>
        </section>

        <section class="demo-block">
          <div class="demo-heading">
            <span>04</span>
            <div>
              <h2>编辑回填</h2>
              <p>接口只存编码，也能按当前返回方式回显。</p>
            </div>
          </div>
          <button class="fill-button" type="button" @click="fillEditValue">模拟编码 110101 回填</button>
          <CnAreaCascader
            v-model="editValue"
            :value-mode="valueMode"
            filterable
          />
          <pre>{{ formatValue(editValue) }}</pre>
        </section>

        <section class="demo-block wide">
          <div class="demo-heading">
            <span>05</span>
            <div>
              <h2>多选编辑回填</h2>
              <p>业务存多个区域编码时，可一次性转换成组件需要的值。</p>
            </div>
          </div>
          <button class="fill-button" type="button" @click="fillEditValue">模拟编码 110101、110102 回填</button>
          <CnAreaCascader
            v-model="editMultipleValue"
            :value-mode="valueMode"
            multiple
            filterable
          />
          <pre>{{ formatValue(editMultipleValue) }}</pre>
        </section>

        <section class="demo-block wide">
          <div class="demo-heading">
            <span>06</span>
            <div>
              <h2>Core 工具函数</h2>
              <p>组件外也可以直接使用数据查询、路径展示、编码转换等能力。</p>
            </div>
          </div>
          <div class="tool-install">
            <span>安装 Core 包</span>
            <code>yarn add @louismax/cn-area-cascader-core</code>
          </div>
          <div class="tool-grid">
            <article
              v-for="item in toolExamples"
              :key="item.title"
              class="tool-card"
            >
              <h3>{{ item.title }}</h3>
              <code>{{ item.code }}</code>
              <pre>{{ formatValue(item.result) }}</pre>
            </article>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import CnAreaCascader from '@louismax/cn-area-cascader'
import {
  createAreaModelValue,
  createAreaModelValues,
  findAreaPathByValue,
  flattenAreaTree,
  getAreaText
} from '@louismax/cn-area-cascader-core'
import type { AreaModelValue, AreaValueMode } from '@louismax/cn-area-cascader-core'

const areaValue = ref()
const valueMode = ref<AreaValueMode>('leaf-code')
const checkStrictly = ref(false)
const collapseSelected = ref(true)
const selectableNational = ref(false)
const customValue = ref<string[]>([])
const multipleValue = ref<string[]>([])
const editValue = ref<AreaModelValue>()
const editMultipleValue = ref<AreaModelValue[]>([])

const valueModeOptions: { label: string; value: AreaValueMode }[] = [
  { label: '末级编码', value: 'leaf-code' },
  { label: '路径编码', value: 'path-code' },
  { label: '末级对象', value: 'leaf-node' },
  { label: '路径树', value: 'path-node' }
]

const setValueMode = (mode: AreaValueMode) => {
  valueMode.value = mode
  resetValues()
}

const resetValues = () => {
  areaValue.value = valueMode.value === 'leaf-code' ? '' : undefined
  customValue.value = valueMode.value === 'leaf-code' ? '' : undefined
  multipleValue.value = []
  editValue.value = undefined
  editMultipleValue.value = []
}

const fillEditValue = () => {
  editValue.value = createAreaModelValue('110101', {
    mode: valueMode.value
  })
  editMultipleValue.value = createAreaModelValues(['110101', '110102'], {
    mode: valueMode.value
  })
}

const formatValue = (value: unknown) => {
  if (value === undefined || value === '') {
    return '暂无选择'
  }

  return JSON.stringify(value, null, 2)
}

const toolExamples = computed(() => {
  const sampleCode = '110101'
  const multipleCodes = ['110101', '110102']

  return [
    {
      title: '根据编码反查完整路径',
      code: "findAreaPathByValue('110101')",
      result: findAreaPathByValue(sampleCode)
    },
    {
      title: '生成省市区展示文本',
      code: "getAreaText(['110000', '110100', '110101'])",
      result: getAreaText(['110000', '110100', '110101'])
    },
    {
      title: '编码转换为当前返回格式',
      code: "createAreaModelValue('110101', { mode: valueMode })",
      result: createAreaModelValue(sampleCode, {
        mode: valueMode.value
      })
    },
    {
      title: '多个编码转换为多选值',
      code: "createAreaModelValues(['110101', '110102'], { mode: valueMode })",
      result: createAreaModelValues(multipleCodes, {
        mode: valueMode.value
      })
    },
    {
      title: '拍平树形数据',
      code: 'flattenAreaTree().slice(0, 3)',
      result: flattenAreaTree().slice(0, 3)
    }
  ]
})

const customProps = {
  label: 'name',
  value: 'id',
  code: 'areaCode',
  level: 'depth',
  children: 'nodes'
}

const customAreaData = [
  {
    name: '测试省',
    id: '900000',
    areaCode: '900000',
    depth: 1,
    nodes: [
      {
        name: '测试市',
        id: '900100',
        areaCode: '900100',
        depth: 2,
        nodes: [
          {
            name: '测试区',
            id: '900101',
            areaCode: '900101',
            depth: 3
          }
        ]
      }
    ]
  }
]
</script>
