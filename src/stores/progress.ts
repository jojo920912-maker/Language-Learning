import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import type { Language, SkillType, UserProgress } from '@/types'

const defaultProgress = (lang: Language): UserProgress => ({
  language: lang,
  vocabulary: { learned: 0, reviewing: 0, total: 100 },
  dailyStreak: 0,
  totalPoints: 0,
  skillLevels: {
    listening: 0,
    reading: 0,
    writing: 0,
    speaking: 0,
    vocabulary: 0,
    grammar: 0,
  },
  completedQuizzes: 0,
  lastActivity: new Date().toISOString(),
})

const ALL_LANGS: Language[] = ['en', 'ja', 'ko', 'fr', 'es', 'de', 'zh']

function emptyProgressMap(): Record<Language, UserProgress> {
  return Object.fromEntries(ALL_LANGS.map((l) => [l, defaultProgress(l)])) as Record<
    Language,
    UserProgress
  >
}

export const useProgressStore = defineStore('progress', () => {
  const progressMap = ref<Record<Language, UserProgress>>(emptyProgressMap())
  const learnedWords = ref<Set<string>>(new Set())
  const bookmarkedWords = ref<Set<string>>(new Set())

  let saveTimer: ReturnType<typeof setTimeout> | null = null

  function progressDocRef(uid: string) {
    return doc(db, 'users', uid, 'progress', 'data')
  }

  /** 登入後從 Firestore 載入學習進度 */
  async function loadFromCloud(uid: string) {
    try {
      const snap = await getDoc(progressDocRef(uid))
      if (snap.exists()) {
        const data = snap.data()
        if (data.progressMap) {
          progressMap.value = { ...emptyProgressMap(), ...data.progressMap }
        }
        learnedWords.value = new Set<string>(data.learnedWords ?? [])
        bookmarkedWords.value = new Set<string>(data.bookmarkedWords ?? [])
      }
    } catch (e) {
      console.error('載入學習進度失敗：', e)
    }
  }

  /** 登出時重置為空白進度 */
  function reset() {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = null
    progressMap.value = emptyProgressMap()
    learnedWords.value = new Set()
    bookmarkedWords.value = new Set()
  }

  /** 寫入 Firestore（1 秒 debounce 合併連續操作）；未登入時不動作 */
  function scheduleSave() {
    const uid = auth.currentUser?.uid
    if (!uid) return
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(async () => {
      try {
        await setDoc(progressDocRef(uid), {
          progressMap: JSON.parse(JSON.stringify(progressMap.value)),
          learnedWords: Array.from(learnedWords.value),
          bookmarkedWords: Array.from(bookmarkedWords.value),
          updatedAt: new Date().toISOString(),
        })
      } catch (e) {
        console.error('儲存學習進度失敗：', e)
      }
    }, 1000)
  }

  function getProgress(lang: Language): UserProgress {
    return progressMap.value[lang] ?? defaultProgress(lang)
  }

  function addPoints(lang: Language, points: number) {
    const p = progressMap.value[lang]
    if (p) {
      p.totalPoints += points
      p.lastActivity = new Date().toISOString()
      scheduleSave()
    }
  }

  function markWordLearned(wordId: string, lang: Language) {
    learnedWords.value.add(wordId)
    const p = progressMap.value[lang]
    if (p) p.vocabulary.learned++
    scheduleSave()
  }

  function toggleBookmark(wordId: string) {
    if (bookmarkedWords.value.has(wordId)) {
      bookmarkedWords.value.delete(wordId)
    } else {
      bookmarkedWords.value.add(wordId)
    }
    scheduleSave()
  }

  function recordQuizComplete(lang: Language, score: number, total: number, skill: SkillType) {
    const p = progressMap.value[lang]
    if (p) {
      p.completedQuizzes++
      p.totalPoints += Math.round((score / total) * 100)
      const pct = Math.round((score / total) * 100)
      p.skillLevels[skill] = Math.min(100, Math.round((p.skillLevels[skill] + pct) / 2))
      p.lastActivity = new Date().toISOString()
      scheduleSave()
    }
  }

  function updateStreak(lang: Language) {
    const p = progressMap.value[lang]
    if (p) {
      const lastDate = new Date(p.lastActivity).toDateString()
      const today = new Date().toDateString()
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      if (lastDate === yesterday) p.dailyStreak++
      else if (lastDate !== today) p.dailyStreak = 1
      scheduleSave()
    }
  }

  const totalPointsAll = computed(() =>
    Object.values(progressMap.value).reduce((s, p) => s + p.totalPoints, 0),
  )

  return {
    progressMap,
    learnedWords,
    bookmarkedWords,
    loadFromCloud,
    reset,
    getProgress,
    addPoints,
    markWordLearned,
    toggleBookmark,
    recordQuizComplete,
    updateStreak,
    totalPointsAll,
  }
})
