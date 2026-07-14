// 英文 TOEIC：raw-data/en/toeic_vocabulary.json → src/data/en/toeic/words.json
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = JSON.parse(readFileSync(join(root, 'raw-data/en/toeic_vocabulary.json'), 'utf8'))

const seen = new Set()
const out = []
let skipped = 0

for (const item of src) {
  const word = (item.english_word ?? '').trim()
  const meaning = (item.chinese_definition ?? '').trim()
  if (!word || !meaning) { skipped++; continue }
  const key = word.toLowerCase()
  if (seen.has(key)) { skipped++; continue }
  seen.add(key)
  const ex = Array.isArray(item.examples) && item.examples[0] ? item.examples[0] : null
  out.push({
    word,
    reading: null,
    meaning,
    level: 'TOEIC',
    exampleSentence: ex?.english ?? null,
    exampleTranslation: ex?.chinese ?? null,
    category: item.category ?? null, // 主題分類（辦公日常、行銷與銷售…共 15 類）
  })
}

const outDir = join(root, 'src/data/en/toeic')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'words.json'), JSON.stringify(out, null, 1), 'utf8')
console.log(`en/toeic: ${out.length} 筆輸出，${skipped} 筆略過（重複或缺欄位）`)
