import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Language, ExamType } from '@/types'
import { LANGUAGES } from '@/data/languages'

export const useLanguageStore = defineStore('language', () => {
  const currentLanguage = ref<Language>('en')
  const targetExam = ref<ExamType | null>(null)
  const uiLanguage = ref<'zh-TW' | 'en'>('zh-TW')

  const currentConfig = computed(() => LANGUAGES.find((l) => l.code === currentLanguage.value)!)
  const availableExams = computed(() => currentConfig.value?.exams ?? [])

  function setLanguage(lang: Language) {
    currentLanguage.value = lang
    targetExam.value = null
  }

  function setTargetExam(exam: ExamType | null) {
    targetExam.value = exam
  }

  return {
    currentLanguage,
    targetExam,
    uiLanguage,
    currentConfig,
    availableExams,
    setLanguage,
    setTargetExam,
  }
})
