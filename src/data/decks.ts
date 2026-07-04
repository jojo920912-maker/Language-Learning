import type { Language, WordEntry } from '@/types'

export interface DeckInfo {
  id: string
  label: string
  /** 對應 WordCard 難度徽章 */
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

/** 已上線語言的單字庫（法西德為 Coming Soon，不在此列） */
export const DECKS: Partial<Record<Language, DeckInfo[]>> = {
  en: [{ id: 'toeic', label: 'TOEIC', difficulty: 'intermediate' }],
  ja: [
    { id: 'jlpt-n5', label: 'JLPT N5', difficulty: 'beginner' },
    { id: 'jlpt-n4', label: 'JLPT N4', difficulty: 'beginner' },
    { id: 'jlpt-n3', label: 'JLPT N3', difficulty: 'intermediate' },
    { id: 'jlpt-n2', label: 'JLPT N2', difficulty: 'intermediate' },
    { id: 'jlpt-n1', label: 'JLPT N1', difficulty: 'advanced' },
  ],
  zh: [
    { id: 'hsk1', label: 'HSK 1', difficulty: 'beginner' },
    { id: 'hsk2', label: 'HSK 2', difficulty: 'beginner' },
    { id: 'hsk3', label: 'HSK 3', difficulty: 'intermediate' },
    { id: 'hsk4', label: 'HSK 4', difficulty: 'intermediate' },
    { id: 'hsk5', label: 'HSK 5', difficulty: 'advanced' },
    { id: 'hsk6', label: 'HSK 6', difficulty: 'advanced' },
    { id: 'hsk7', label: 'HSK 7-9', difficulty: 'advanced' },
  ],
  ko: [
    { id: 'topik1', label: 'TOPIK I', difficulty: 'beginner' },
    { id: 'topik2', label: 'TOPIK II', difficulty: 'intermediate' },
  ],
}

/** 尚未開放的語言 */
export const COMING_SOON_LANGS: Language[] = ['fr', 'es', 'de']

// 以 glob 懶載入各 deck 的 words.json，切換時才下載對應檔案
const wordModules = import.meta.glob('./*/*/words.json', { import: 'default' }) as Record<
  string,
  () => Promise<WordEntry[]>
>

export async function loadDeck(lang: Language, deckId: string): Promise<WordEntry[]> {
  const loader = wordModules[`./${lang}/${deckId}/words.json`]
  if (!loader) return []
  try {
    return await loader()
  } catch (e) {
    console.error(`載入單字庫失敗 ${lang}/${deckId}：`, e)
    return []
  }
}
