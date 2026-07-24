<template>
  <main class="page">
    <section class="panel">
      <div class="intro">
        <p class="eyebrow">Vue3 + Element Plus</p>
        <h1>cn-area-cascader 示例</h1>
        <p class="summary">默认数据、自定义字段映射、选择结果都在这里可以直接试。</p>
      </div>

      <div class="demo-grid">
        <section class="demo-block">
          <h2>默认省市区数据</h2>
          <CnAreaCascader v-model="defaultValue" filterable />
          <pre>{{ defaultValue }}</pre>
        </section>

        <section class="demo-block">
          <h2>自定义数据源</h2>
          <CnAreaCascader
            v-model="customValue"
            :data="customAreaData"
            :props="customProps"
            placeholder="请选择自定义区域"
            clearable
          />
          <pre>{{ customValue }}</pre>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CnAreaCascader from '@louismax/cn-area-cascader'

const defaultValue = ref<string[]>([])
const customValue = ref<string[]>([])

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
