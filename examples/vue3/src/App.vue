<template>
  <main class="page">
    <section class="panel">
      <div class="intro">
        <p class="eyebrow">Vue3 + Element Plus</p>
        <h1>cn-area-cascader 示例</h1>
        <p class="summary">默认数据、自定义字段映射、选择结果都在这里可以直接试。</p>
      </div>

      <div class="mode-panel">
        <h2>返回方式</h2>
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
        <div class="option-toggle">
          <span>可选择任意级</span>
          <el-switch v-model="checkStrictly" @change="resetValues" />
        </div>
        <div class="option-toggle">
          <span>多选折叠父级</span>
          <el-switch v-model="collapseSelected" @change="resetValues" />
        </div>
        <div class="option-toggle">
          <span>显示全国根</span>
          <el-switch v-model="selectableNational" @change="resetValues" />
        </div>
      </div>

      <div class="demo-grid">
        <section class="demo-block">
          <h2>默认省市区数据</h2>
          <CnAreaCascader
            v-model="areaValue"
            :value-mode="valueMode"
            :check-strictly="checkStrictly"
            :selectable-national="selectableNational"
            filterable
          />
          <pre>{{ areaValue }}</pre>
        </section>

        <section class="demo-block">
          <h2>自定义数据源</h2>
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
          <pre>{{ customValue }}</pre>
        </section>

        <section class="demo-block">
          <h2>多选区域</h2>
          <CnAreaCascader
            v-model="multipleValue"
            :value-mode="valueMode"
            :check-strictly="checkStrictly"
            :collapse-selected="collapseSelected"
            :selectable-national="selectableNational"
            multiple
            filterable
          />
          <pre>{{ multipleValue }}</pre>
        </section>

        <section class="demo-block">
          <h2>编辑回填</h2>
          <button class="fill-button" type="button" @click="fillEditValue">模拟接口编码回填</button>
          <CnAreaCascader
            v-model="editValue"
            :value-mode="valueMode"
            filterable
          />
          <pre>{{ editValue }}</pre>
        </section>

        <section class="demo-block">
          <h2>多选编辑回填</h2>
          <button class="fill-button" type="button" @click="fillEditValue">模拟接口编码回填</button>
          <CnAreaCascader
            v-model="editMultipleValue"
            :value-mode="valueMode"
            multiple
            filterable
          />
          <pre>{{ editMultipleValue }}</pre>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CnAreaCascader from '@louismax/cn-area-cascader'
import { chinaAreaTree, createAreaModelValue, createAreaModelValues } from '@louismax/cn-area-cascader-core'
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
  editValue.value = createAreaModelValue(chinaAreaTree, '110101', {
    mode: valueMode.value
  })
  editMultipleValue.value = createAreaModelValues(chinaAreaTree, ['110101', '110102'], {
    mode: valueMode.value
  })
}

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
