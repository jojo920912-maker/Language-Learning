// 日文 JLPT：raw-data/ja/n{1-5}_vocab_cleaned.csv → src/data/ja/jlpt-n{1-5}/words.json
// 來源只有「漢字,假名」兩欄，無釋義 → meaning 留空並標 needsTranslation，階段 6 批次補
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

for (const n of [5, 4, 3, 2, 1]) {
  const csv = readFileSync(join(root, `raw-data/ja/n${n}_vocab_cleaned.csv`), 'utf8')
  const lines = csv.split(/\r?\n/).filter(Boolean)
  const seen = new Set()
  const out = []
  let skipped = 0

  for (const line of lines.slice(1)) {
    // cleaned 版固定兩欄，不含引號跟內嵌逗號
    const idx = line.indexOf(',')
    if (idx === -1) { skipped++; continue }
    const word = line.slice(0, idx).trim()
    const reading = line.slice(idx + 1).trim()
    if (!word || seen.has(word)) { skipped++; continue }
    seen.add(word)
    out.push({
      word,
      reading: reading || null,
      meaning: '',
      level: `N${n}`,
      exampleSentence: null,
      exampleTranslation: null,
      needsTranslation: true,
    })
  }

  const outDir = join(root, `src/data/ja/jlpt-n${n}`)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'words.json'), JSON.stringify(out, null, 1), 'utf8')
  console.log(`ja/jlpt-n${n}: ${out.length} 筆輸出，${skipped} 筆略過`)
}
