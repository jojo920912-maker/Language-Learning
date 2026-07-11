import { ref } from 'vue'
import type { Language, QuizQuestion, DifficultyLevel } from '@/types'

const KEY_STORAGE = 'lc_gemini_key'
const MODEL = 'gemini-2.0-flash'

const apiKey = ref<string>(localStorage.getItem(KEY_STORAGE) ?? '')

export function setApiKey(key: string) {
  apiKey.value = key.trim()
  if (apiKey.value) localStorage.setItem(KEY_STORAGE, apiKey.value)
  else localStorage.removeItem(KEY_STORAGE)
}

export function hasApiKey() {
  return apiKey.value.length > 0
}

const LANG_NAME: Record<Language, string> = {
  en: '英文', ja: '日文', ko: '韓文', zh: '中文',
}

interface GeneratedReading {
  title: string
  content: string
  summary: string
  questions: { question: string; options: string[]; correctAnswer: string; explanation: string }[]
}

interface GeneratedListening {
  title: string
  transcript: string
  questions: { question: string; options: string[]; correctAnswer: string; explanation: string }[]
}

async function callGemini(prompt: string): Promise<string> {
  if (!apiKey.value) throw new Error('尚未設定 Gemini API 金鑰')
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey.value}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.9, responseMimeType: 'application/json' },
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    if (res.status === 400 || res.status === 403) throw new Error('API 金鑰無效或權限不足')
    if (res.status === 429) throw new Error('已達免費使用量上限，請稍後再試')
    throw new Error(`AI 請求失敗（${res.status}）：${err.slice(0, 120)}`)
  }
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('AI 未回傳內容')
  return text
}

function parseJSON<T>(text: string): T {
  // 移除可能的 ```json ... ``` 包裝
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
  return JSON.parse(cleaned) as T
}

const DIFF_LABEL: Record<DifficultyLevel, string> = {
  beginner: '初級（簡單詞彙與句型）',
  intermediate: '中級',
  advanced: '高級（進階詞彙與複雜句型）',
}

export function useAI() {
  const loading = ref(false)
  const error = ref('')

  async function generateReading(lang: Language, difficulty: DifficultyLevel, topic?: string): Promise<GeneratedReading> {
    loading.value = true
    error.value = ''
    try {
      const prompt = `你是語言學習教材編輯。請用「${LANG_NAME[lang]}」撰寫一篇${DIFF_LABEL[difficulty]}程度的閱讀短文${topic ? `，主題與「${topic}」相關` : ''}。
嚴格以 JSON 回傳，格式：
{"title":"標題(用${LANG_NAME[lang]})","content":"200-350字的文章(用${LANG_NAME[lang]})","summary":"繁體中文一句話摘要","questions":[{"question":"閱讀理解題(用${LANG_NAME[lang]})","options":["A","B","C","D"],"correctAnswer":"正確選項原文","explanation":"繁體中文解說"}]}
請出 2 題理解題。correctAnswer 必須完全等於 options 之一。`
      return parseJSON<GeneratedReading>(await callGemini(prompt))
    } catch (e: any) {
      error.value = e?.message ?? 'AI 生成失敗'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function generateListening(lang: Language, difficulty: DifficultyLevel): Promise<GeneratedListening> {
    loading.value = true
    error.value = ''
    try {
      const prompt = `你是語言聽力教材編輯。請用「${LANG_NAME[lang]}」撰寫一段${DIFF_LABEL[difficulty]}程度的聽力對話或短講（會用語音合成朗讀）。
嚴格以 JSON 回傳：
{"title":"標題(用${LANG_NAME[lang]})","transcript":"對話或短講逐字稿(用${LANG_NAME[lang]}，100-200字)","questions":[{"question":"聽力理解題(用${LANG_NAME[lang]})","options":["A","B","C","D"],"correctAnswer":"正確選項原文","explanation":"繁體中文解說"}]}
請出 2 題。correctAnswer 必須完全等於 options 之一。`
      return parseJSON<GeneratedListening>(await callGemini(prompt))
    } catch (e: any) {
      error.value = e?.message ?? 'AI 生成失敗'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function generateWritingPrompt(lang: Language, difficulty: DifficultyLevel): Promise<{ topic: string; description: string }> {
    loading.value = true
    error.value = ''
    try {
      const prompt = `請為「${LANG_NAME[lang]}」學習者出一個${DIFF_LABEL[difficulty]}程度的寫作題目。
嚴格以 JSON 回傳：{"topic":"題目(用${LANG_NAME[lang]})","description":"寫作要求說明(用${LANG_NAME[lang]})"}`
      return parseJSON(await callGemini(prompt))
    } catch (e: any) {
      error.value = e?.message ?? 'AI 生成失敗'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function generateQuiz(lang: Language, difficulty: DifficultyLevel, count = 5): Promise<QuizQuestion[]> {
    loading.value = true
    error.value = ''
    try {
      const prompt = `請為「${LANG_NAME[lang]}」學習者出 ${count} 題${DIFF_LABEL[difficulty]}程度的選擇題（單字、文法、閱讀混合）。
嚴格以 JSON 陣列回傳：[{"question":"題目(用${LANG_NAME[lang]})","options":["A","B","C","D"],"correctAnswer":"正確選項原文","explanation":"繁體中文解說"}]
correctAnswer 必須完全等於 options 之一。`
      const raw = parseJSON<{ question: string; options: string[]; correctAnswer: string; explanation: string }[]>(await callGemini(prompt))
      return raw.map((q, i) => ({
        id: `ai-${lang}-${Date.now()}-${i}`,
        type: 'multiple-choice',
        skill: 'vocabulary',
        language: lang,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty,
      }))
    } catch (e: any) {
      error.value = e?.message ?? 'AI 生成失敗'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { loading, error, generateReading, generateListening, generateWritingPrompt, generateQuiz }
}
