import type { QuizQuestion, Language, ExamType, DifficultyLevel } from '@/types'
import { loadDeck } from './decks'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

/** 各語言用哪個欄位當「答案」，以及題目怎麼問 */
function questionConfig(lang: Language): { field: 'meaning' | 'reading'; prompt: (w: string) => string } {
  switch (lang) {
    case 'en':
      return { field: 'meaning', prompt: (w) => `「${w}」的中文意思是？` }
    case 'ja':
      return { field: 'reading', prompt: (w) => `「${w}」的正確讀音（假名）是？` }
    case 'zh':
      return { field: 'reading', prompt: (w) => `「${w}」的正確拼音是？` }
    case 'ko':
      return { field: 'meaning', prompt: (w) => `「${w}」對應的意思是？` }
  }
}

/** 由單字庫自動生成選擇題。distractor 從同一副牌隨機抽取。 */
export async function generateVocabQuiz(
  lang: Language,
  deckId: string,
  count: number,
  difficulty: DifficultyLevel = 'intermediate',
  examType?: ExamType,
): Promise<QuizQuestion[]> {
  const words = await loadDeck(lang, deckId)
  const cfg = questionConfig(lang)

  // 只用「答案欄位」有值、且不重複的單字
  const seen = new Set<string>()
  const pool = words.filter((w) => {
    const ans = w[cfg.field]
    if (!ans || !w.word || seen.has(w.word)) return false
    seen.add(w.word)
    return true
  })

  if (pool.length < 4) return []

  const answerValues = pool.map((w) => w[cfg.field] as string)
  const picked = shuffle(pool).slice(0, count)
  const questions: QuizQuestion[] = []

  picked.forEach((w, idx) => {
    const correct = w[cfg.field] as string
    // 抽 3 個不同的干擾答案
    const distractors = new Set<string>()
    let guard = 0
    while (distractors.size < 3 && guard < 60) {
      guard++
      const cand = answerValues[Math.floor(Math.random() * answerValues.length)]!
      if (cand !== correct) distractors.add(cand)
    }
    if (distractors.size < 3) return

    const options = shuffle([correct, ...distractors])
    questions.push({
      id: `gen-${lang}-${deckId}-${Date.now()}-${idx}`,
      type: 'multiple-choice',
      skill: 'vocabulary',
      language: lang,
      question: cfg.prompt(w.word),
      options,
      correctAnswer: correct,
      explanation: `「${w.word}」${w.reading ? `（${w.reading}）` : ''}：${correct}`,
      difficulty,
      examType,
    })
  })

  return questions
}
