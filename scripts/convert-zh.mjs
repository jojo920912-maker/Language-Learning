// 中文 HSK 3.0：raw-data/zh/{1-7}.json → src/data/zh/hsk{1-7}/words.json
// 來源已內建繁體欄位（forms[].traditional），不需要 OpenCC 簡繁轉換
// 釋義是英文 → 標 needsTranslation，階段 6 批次翻譯
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

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
    })
  }

  const outDir = join(root, `src/data/zh/hsk${n}`)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'words.json'), JSON.stringify(out, null, 1), 'utf8')
  console.log(`zh/hsk${n} (${level}): ${out.length} 筆輸出，${skipped} 筆略過`)
}
