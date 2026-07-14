// 韓文 TOPIK：raw-data/ko/topik_vocab.tsv → src/data/ko/topik1|topik2/words.json
// TSV 用 papaparse 解析。欄位：rank, word, part_of_speech, hanja, explanation, nikl_level, topik_level
// 分級：topik_level A → TOPIK I；B/C → TOPIK II；空值以 nikl_level（초급→I，중급/고급→II）補判，仍無法判定則略過
// 無中文釋義 → meaning 放韓文 explanation（可能為空）並標 needsTranslation
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import Papa from 'papaparse'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const tsv = readFileSync(join(root, 'raw-data/ko/topik_vocab.tsv'), 'utf8')

const { data } = Papa.parse(tsv, { header: true, delimiter: '\t', skipEmptyLines: true })

// 韓文詞性 → 中文標籤
const POS_MAP = {
  '명사': '名詞', '의존명사': '名詞', '고유 명사': '名詞',
  '동사': '動詞', '보조 용언': '動詞',
  '형용사': '形容詞', '부사': '副詞', '관형사': '冠形詞',
  '대명사': '代詞', '수사': '數詞', '감탄사': '感嘆詞',
  '조사': '助詞', '접사': '接辭',
}
function koCategory(pos) {
  return POS_MAP[(pos ?? '').trim()] ?? '其他'
}

const buckets = { topik1: [], topik2: [] }
const seen = { topik1: new Set(), topik2: new Set() }
let skipped = 0

for (const row of data) {
  // 去掉詞尾的同形異義編號（如 가격03 → 가격）
  const word = (row.word ?? '').trim().replace(/\d+$/, '').replace(/^-/, '')
  if (!word) { skipped++; continue }

  let bucket = null
  const tl = (row.topik_level ?? '').trim()
  if (tl === 'A') bucket = 'topik1'
  else if (tl === 'B' || tl === 'C') bucket = 'topik2'
  else {
    const nikl = (row.nikl_level ?? '').trim()
    if (nikl === '초급') bucket = 'topik1'
    else if (nikl === '중급' || nikl === '고급') bucket = 'topik2'
  }
  if (!bucket) { skipped++; continue }
  if (seen[bucket].has(word)) { skipped++; continue }
  seen[bucket].add(word)

  buckets[bucket].push({
    word,
    reading: null,
    meaning: (row.explanation ?? '').trim(),
    level: bucket === 'topik1' ? 'TOPIK I' : 'TOPIK II',
    exampleSentence: null,
    exampleTranslation: null,
    needsTranslation: true,
    category: koCategory(row.part_of_speech),
  })
}

for (const [name, words] of Object.entries(buckets)) {
  const outDir = join(root, `src/data/ko/${name}`)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'words.json'), JSON.stringify(words, null, 1), 'utf8')
  console.log(`ko/${name}: ${words.length} 筆輸出`)
}
console.log(`略過 ${skipped} 筆（無法分級或重複）`)
