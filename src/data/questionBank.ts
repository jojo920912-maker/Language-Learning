import type { Language, QuizQuestion, DifficultyLevel, WordEntry } from '@/types'
import { DECKS, loadDeck } from './decks'

/**
 * 題庫引擎：從 44k 單字資料程式化生成分級題目。
 * 題型：
 *  - meaning       ：單字 → 選意思/讀音（全語言）
 *  - reverse       ：意思/讀音 → 選單字（全語言）
 *  - cloze         ：例句克漏字（僅 en，有例句才出）
 *  - sentence-read ：句子閱讀理解，選正確中文翻譯（僅 en）
 *  - listen-word   ：聽發音選答案（全語言，QuizCard 以 TTS 播放 passage）
 */
export type BankKind = 'meaning' | 'reverse' | 'cloze' | 'sentence-read' | 'listen-word'

export const ALL_KINDS: BankKind[] = ['meaning', 'reverse', 'cloze', 'sentence-read', 'listen-word']

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

/** 依使用者技能百分比換算難度 */
export function levelFromSkill(pct: number): DifficultyLevel {
  if (pct < 34) return 'beginner'
  if (pct < 67) return 'intermediate'
  return 'advanced'
}

/** 依難度決定一批練習的題量（使用者需求：初階一次 250 起） */
export function batchSizeFor(level: DifficultyLevel): number {
  return level === 'beginner' ? 250 : level === 'intermediate' ? 500 : 1000
}

/** 該語言在指定難度可用的 deck；找不到同級就往鄰近級數退 */
function decksForLevel(lang: Language, level: DifficultyLevel): string[] {
  const all = DECKS[lang] ?? []
  const exact = all.filter((d) => d.difficulty === level).map((d) => d.id)
  if (exact.length) return exact
  return all.map((d) => d.id)
}

/** en 單一 deck 內再分級（粗略但可用：片語與長字視為較難） */
function enWordLevel(w: WordEntry): DifficultyLevel {
  const tokens = w.word.trim().split(/\s+/).length
  if (tokens >= 3 || w.word.length >= 12) return 'advanced'
  if (tokens === 2 || w.word.length >= 8) return 'intermediate'
  return 'beginner'
}

interface Pools {
  words: WordEntry[]
  meanings: string[]
  readings: string[]
  wordsText: string[]
  translations: string[]
}

function buildPools(words: WordEntry[]): Pools {
  return {
    words,
    meanings: words.map((w) => w.meaning).filter(Boolean),
    readings: words.map((w) => w.reading ?? '').filter(Boolean),
    wordsText: words.map((w) => w.word),
    translations: words.map((w) => w.exampleTranslation ?? '').filter(Boolean),
  }
}

function pickDistractors(pool: string[], correct: string, n = 3): string[] | null {
  const set = new Set<string>()
  let guard = 0
  while (set.size < n && guard < 80) {
    guard++
    const c = pool[Math.floor(Math.random() * pool.length)]!
    if (c && c !== correct) set.add(c)
  }
  return set.size === n ? [...set] : null
}

function mcq(
  id: string, lang: Language, level: DifficultyLevel,
  skill: QuizQuestion['skill'], question: string,
  correct: string, distractors: string[], explanation: string, passage?: string,
): QuizQuestion {
  return {
    id, type: 'multiple-choice', skill, language: lang, question,
    options: shuffle([correct, ...distractors]),
    correctAnswer: correct, explanation, difficulty: level, passage,
  }
}

/** 每語言的答案欄位設定 */
const ANSWER_FIELD: Record<Language, 'meaning' | 'reading'> = {
  en: 'meaning', ja: 'reading', zh: 'reading', ko: 'meaning',
}

function questionForWord(w: WordEntry, lang: Language, level: DifficultyLevel, kind: BankKind, pools: Pools, idx: number): QuizQuestion | null {
  const field = ANSWER_FIELD[lang]
  const ans = w[field]
  const id = `bank-${lang}-${kind}-${idx}-${w.word.slice(0, 12)}`
  const noun = field === 'reading' ? (lang === 'zh' ? '拼音' : '讀音') : '意思'
  const pool = field === 'reading' ? pools.readings : pools.meanings

  switch (kind) {
    case 'meaning': {
      if (!ans) return null
      const d = pickDistractors(pool, ans)
      if (!d) return null
      return mcq(id, lang, level, 'vocabulary', `「${w.word}」的${noun}是？`, ans, d,
        `「${w.word}」${w.reading ? `（${w.reading}）` : ''}：${ans}`)
    }
    case 'reverse': {
      if (!ans) return null
      const d = pickDistractors(pools.wordsText, w.word)
      if (!d) return null
      return mcq(id, lang, level, 'vocabulary', `${noun}為「${ans}」的是哪一個？`, w.word, d,
        `${ans} → ${w.word}${w.reading ? `（${w.reading}）` : ''}`)
    }
    case 'cloze': {
      if (lang !== 'en' || !w.exampleSentence) return null
      const re = new RegExp(w.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      if (!re.test(w.exampleSentence)) return null
      const blanked = w.exampleSentence.replace(re, '______')
      const d = pickDistractors(pools.wordsText, w.word)
      if (!d) return null
      return mcq(id, lang, level, 'grammar', `選出最適合填入空格的詞：\n${blanked}`, w.word, d,
        `原句：${w.exampleSentence}${w.exampleTranslation ? `\n（${w.exampleTranslation}）` : ''}`)
    }
    case 'sentence-read': {
      if (lang !== 'en' || !w.exampleSentence || !w.exampleTranslation) return null
      const d = pickDistractors(pools.translations, w.exampleTranslation)
      if (!d) return null
      return mcq(id, lang, level, 'reading', '這句話的中文意思是？', w.exampleTranslation, d,
        `關鍵字「${w.word}」：${w.meaning}`, w.exampleSentence)
    }
    case 'listen-word': {
      if (!ans) return null
      // passage 由 QuizCard 的聽力播放鈕以 TTS 朗讀
      const spoken = lang === 'ja' ? (w.reading ?? w.word) : w.word
      if (lang === 'ja' || lang === 'ko') {
        const d = pickDistractors(pools.wordsText, w.word)
        if (!d) return null
        return mcq(id, lang, level, 'listening', '▶ 播放後，選出你聽到的單字', w.word, d,
          `聽到的是「${w.word}」${w.reading ? `（${w.reading}）` : ''}${w.meaning ? `：${w.meaning}` : ''}`, spoken)
      }
      const d = pickDistractors(pool, ans)
      if (!d) return null
      return mcq(id, lang, level, 'listening',
        lang === 'zh' ? '▶ 播放後，選出正確拼音' : '▶ 播放後，選出聽到單字的意思',
        ans, d, `聽到的是「${w.word}」：${ans}`, spoken)
    }
  }
}

/** 生成一批分級題目。kinds 不填 = 全題型混合。 */
export async function generateBatch(
  lang: Language, level: DifficultyLevel, count: number, kinds: BankKind[] = ALL_KINDS,
): Promise<QuizQuestion[]> {
  const deckIds = decksForLevel(lang, level)
  let words: WordEntry[] = []
  for (const id of deckIds) words = words.concat(await loadDeck(lang, id))
  if (lang === 'en') words = words.filter((w) => enWordLevel(w) === level)
  if (words.length < 8) {
    // 該級距詞太少（防呆）：放寬為全部
    words = []
    for (const d of DECKS[lang] ?? []) words = words.concat(await loadDeck(lang, d.id))
  }

  const pools = buildPools(words)
  const out: QuizQuestion[] = []
  const shuffled = shuffle(words)
  let i = 0
  while (out.length < count && i < shuffled.length * kinds.length) {
    const w = shuffled[i % shuffled.length]!
    const kind = kinds[Math.floor(i / shuffled.length) % kinds.length]!
    const q = questionForWord(w, lang, level, kind, pools, i)
    if (q) out.push(q)
    i++
  }
  return shuffle(out)
}

/** 統計該語言題庫理論總量（給 UI 顯示「題庫共 N 題」） */
export async function bankTotal(lang: Language): Promise<number> {
  let words: WordEntry[] = []
  for (const d of DECKS[lang] ?? []) words = words.concat(await loadDeck(lang, d.id))
  const field = ANSWER_FIELD[lang]
  const withAns = words.filter((w) => w[field]).length
  let total = withAns * 2 // meaning + reverse
  total += words.length // listen-word（有答案欄位者）約略同 withAns，取保守值前先算：
  total = withAns * 3
  if (lang === 'en') {
    const withEx = words.filter((w) => w.exampleSentence && w.exampleTranslation).length
    total += withEx * 2 // cloze + sentence-read
  }
  return total
}
