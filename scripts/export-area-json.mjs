import { mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const inputFile = resolve(process.argv[2] || 's_city.tsv')
const outDir = resolve(process.argv[3] || 'packages/core/src/data')

const columns = [
  'id',
  'parent_id',
  'area_name',
  'merger_name',
  'short_name',
  'merger_short_name',
  'level_type',
  'city_code',
  'zip_code',
  'pin_yin',
  'jian_pin',
  'first_char',
  'ing',
  'lat',
  'remarks',
  'q_weather_code',
  'syscreatetime',
  'sysupdatetime'
]

const toValue = (value) => {
  if (value === undefined || value === null || value === '' || value === '\\N') {
    return undefined
  }

  const text = String(value)

  if (text.startsWith('"') && text.endsWith('"')) {
    return text.slice(1, -1).replace(/""/g, '"')
  }

  return text
}

const toLiteNode = (row) => ({
  label: row.area_name,
  value: row.id,
  code: row.id,
  level: Number(row.level_type)
})

const toFullNode = (row) => {
  const node = {
    ...toLiteNode(row),
    parentCode: row.parent_id
  }

  const optionalFields = {
    fullName: row.merger_name,
    shortName: row.short_name,
    fullShortName: row.merger_short_name,
    cityCode: row.city_code,
    zipCode: row.zip_code,
    pinyin: row.pin_yin,
    jianpin: row.jian_pin,
    firstChar: row.first_char
  }

  for (const [key, value] of Object.entries(optionalFields)) {
    if (value !== undefined) {
      node[key] = value
    }
  }

  return node
}

const parseRows = () => {
  const content = readFileSync(inputFile, 'utf8').trim()

  if (!content) {
    return []
  }

  return content
    .split(/\r?\n/)
    .map((line) => {
      const values = line.split('\t')
      const row = {}

      columns.forEach((column, index) => {
        row[column] = toValue(values[index])
      })

      return row
    })
    .filter((row) => row.id && row.parent_id && row.area_name && ['1', '2', '3'].includes(row.level_type))
}

const buildTree = (rows, createNode) => {
  const nodeMap = new Map()
  const roots = []

  rows.forEach((row) => {
    nodeMap.set(row.id, createNode(row))
  })

  rows.forEach((row) => {
    const node = nodeMap.get(row.id)
    const parent = nodeMap.get(row.parent_id)

    if (parent) {
      parent.children ||= []
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

const writeJson = (file, data) => {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, `${JSON.stringify(data)}\n`, 'utf8')
}

const formatSize = (bytes) => {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`
  }

  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

const rows = parseRows()
const liteTree = buildTree(rows, toLiteNode)
const fullTree = buildTree(rows, toFullNode)
const liteFile = resolve(outDir, 'china-area-tree.json')
const fullFile = resolve(outDir, 'china-area-tree.full.json')

writeJson(liteFile, liteTree)
writeJson(fullFile, fullTree)

console.log(`rows: ${rows.length}`)
console.log(`${liteFile}: ${formatSize(statSync(liteFile).size)}`)
console.log(`${fullFile}: ${formatSize(statSync(fullFile).size)}`)
