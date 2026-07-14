// 中文 HSK 3.0：raw-data/zh/{1-7}.json → src/data/zh/hsk{1-7}/words.json
// 來源已內建繁體欄位（forms[].traditional），不需要 OpenCC 簡繁轉換
// 釋義是英文 → 標 needsTranslation，階段 6 批次翻譯
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// pos 代碼（ICTCLAS 風格）→ 詞性中文標籤，取第一個 pos
function posToCategory(pos) {
  const p = Array.isArray(pos) && pos[0] ? pos[0] : ''
  if (p.startsWith('vn')) return '動詞'
  if (p.startsWith('n')) return '名詞'
  if (p.startsWith('v')) return '動詞'
  if (p.startsWith('a')) return '形容詞'
  if (p === 'd') return '副詞'
  if (p === 'm' || p.startsWith('q') || p === 'mq') return '數量詞'
  if (p === 'r') return '代詞'
  if (p === 'p') return '介詞'
  if (p.startsWith('c')) return '連詞'
  if (p === 'u' || p === 'y') return '助詞'
  if (p === 't' || p === 'tg' || p === 'f' || p === 's') return '時間・方位'
  return '其他'
}

for (const n of [1, 2, 3, 4, 5, 6, 7]) {
  const src = JSON.parse(readFileSync(join(root, `raw-data/zh/${n}.json`), 'utf8'))
  const level = n === 7 ? 'HSK7-9' : `HSK${n}`
  const seen = new Set()
  const out = []
  let skipped = 0

  for (const item of src) {
    const form = Array.isArray(item.forms) && item.forms[0] ? item.forms[0] : null
    const word = (form?.traditional ?? '').trim()
    if (!word || seen.has(word)) { skipped++; continue }
    seen.add(word)
    const meanings = Array.isArray(form?.meanings) ? form.meanings.join('; ') : ''
    out.push({
      word,
      reading: form?.transcriptions?.pinyin ?? null,
      meaning: meanings,
      level,
      exampleSentence: null,
      exampleTranslation: null,
      needsTranslation: true,
      category: posToCategory(item.pos),
    })
  }

  const outDir = join(root, `src/data/zh/hsk${n}`)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'words.json'), JSON.stringify(out, null, 1), 'utf8')
  console.log(`zh/hsk${n} (${level}): ${out.length} 筆輸出，${skipped} 筆略過`)
}
