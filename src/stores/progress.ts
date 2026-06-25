import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Language, SkillType, UserProgress } from '@/types'

const defaultProgress = (): UserProgress => ({
  language: 'en',
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

export const useProgressStore = defineStore(
  'progress',
  () => {
    const progressMap = ref<Record<Language, UserProgress>>({
      en: { ...defaultProgress(), language: 'en', vocabulary: { learned: 12, reviewing: 5, total: 100 }, dailyStreak: 3, totalPoints: 240, completedQuizzes: 8, skillLevels: { listening: 45, reading: 60, writing: 30, speaking: 20, vocabulary: 55, grammar: 40 } },
      ja: { ...defaultProgress(), language: 'ja' },
      ko: { ...defaultProgress(), language: 'ko' },
      fr: { ...defaultProgress(), language: 'fr' },
      es: { ...defaultProgress(), language: 'es' },
      de: { ...defaultProgress(), language: 'de' },
      zh: { ...defaultProgress(), language: 'zh' },
    } as Record<Language, UserProgress>)

    const learnedWords = ref<Set<string>>(new Set())
    const bookmarkedWords = ref<Set<string>>(new Set())

    function getProgress(lang: Language): UserProgress {
      return progressMap.value[lang] ?? { ...defaultProgress(), language: lang }
    }

    function addPoints(lang: Language, points: number) {
      const p = progressMap.value[lang]
      if (p) {
        p.totalPoints += points
        p.lastActivity = new Date().toISOString()
      }
    }

    function markWordLearned(wordId: string, lang: Language) {
      learnedWords.value.add(wordId)
      const p = progressMap.value[lang]
      if (p) p.vocabulary.learned++
    }

    function toggleBookmark(wordId: string) {
      if (bookmarkedWords.value.has(wordId)) {
        bookmarkedWords.value.delete(wordId)
      } else {
        bookmarkedWords.value.add(wordId)
      }
    }

    function recordQuizComplete(lang: Language, score: number, total: number, skill: SkillType) {
      const p = progressMap.value[lang]
      if (p) {
        p.completedQuizzes++
        p.totalPoints += Math.round((score / total) * 100)
        const pct = Math.round((score / total) * 100)
        p.skillLevels[skill] = Math.min(100, Math.round((p.skillLevels[skill] + pct) / 2))
        p.lastActivity = new Date().toISOString()
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
      }
    }

    const totalPointsAll = computed(() =>
      Object.values(progressMap.value).reduce((s, p) => s + p.totalPoints, 0),
    )

    return {
      progressMap,
      learnedWords,
      bookmarkedWords,
      getProgress,
      addPoints,
      markWordLearned,
      toggleBookmark,
      recordQuizComplete,
      updateStreak,
      totalPointsAll,
    }
  },
)
