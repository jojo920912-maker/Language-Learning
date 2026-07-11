<template>
  <div class="container page-content">
    <div class="page-head-row">
      <div>
        <h1 class="section-title">✍️ 寫作練習</h1>
        <p class="section-subtitle">{{ currentConfig.flag }} {{ currentConfig.name }} · 針對考試題型進行寫作訓練</p>
      </div>
      <button class="btn btn-primary ai-btn" :disabled="ai.loading.value" @click="genAiPrompt">
        {{ ai.loading.value ? '生成中…' : '✨ AI 依程度出題' }}
      </button>
    </div>
    <p v-if="ai.error.value" class="ai-error">⚠️ {{ ai.error.value }} <RouterLink to="/profile">前往設定金鑰</RouterLink></p>

    <div class="prompts-grid">
      <div v-for="prompt in currentPrompts" :key="prompt.id" class="prompt-card card">
        <div class="prompt-header">
          <span class="badge" :class="`badge-${prompt.difficulty}`">{{ diffLabel(prompt.difficulty) }}</span>
          <span v-if="prompt.examType" class="badge badge-exam">{{ prompt.examType }}</span>
          <span v-if="prompt.wordLimit" class="tag">{{ prompt.wordLimit }} 字</span>
        </div>
        <h3 class="prompt-topic">{{ prompt.topic }}</h3>
        <p class="prompt-desc">{{ prompt.description }}</p>

        <div v-if="activePrompt?.id === prompt.id" class="writing-area">
          <div class="writing-toolbar">
            <span class="word-count">{{ wordCount }} / {{ prompt.wordLimit ?? '∞' }} 字</span>
            <button class="btn btn-ghost sm-btn" @click="readPrompt(prompt)">🔊 朗讀題目</button>
          </div>
          <textarea
            v-model="userText"
            class="writing-textarea"
            :placeholder="`在此輸入你的${currentConfig.name}作文...`"
            rows="10"
          />
          <div class="writing-actions">
            <button class="btn btn-primary" @click="showSample = !showSample">
              {{ showSample ? '隱藏範文' : '查看範文' }}
            </button>
            <button class="btn btn-ghost" @click="readUserText">🔊 朗讀我的作文</button>
            <button class="btn btn-ghost" @click="activePrompt = null; userText = ''; showSample = false">關閉</button>
          </div>
          <div v-if="showSample && prompt.sampleAnswer" class="sample-answer">
            <p class="sample-label">📖 範文參考</p>
            <p class="sample-text">{{ prompt.sampleAnswer }}</p>
          </div>
        </div>

        <button v-else class="btn btn-primary start-writing-btn" @click="startWriting(prompt)">
          開始寫作 ✍️
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import { useProgressStore } from '@/stores/progress'
import { useTextToSpeech } from '@/composables/useTextToSpeech'
import { useAI, hasApiKey } from '@/composables/useAI'
import { writingPrompts } from '@/data/writingPrompts'
import type { WritingPrompt, DifficultyLevel } from '@/types'

const progressStore = useProgressStore()
const ai = useAI()

function levelToDifficulty(pct: number): DifficultyLevel {
  if (pct < 34) return 'beginner'
  if (pct < 67) return 'intermediate'
  return 'advanced'
}

const aiPrompts = ref<WritingPrompt[]>([])

async function genAiPrompt() {
  if (!hasApiKey()) {
    ai.error.value = '尚未設定 Gemini API 金鑰'
    return
  }
  const lang = langStore.currentLanguage
  const diff = levelToDifficulty(progressStore.getProgress(lang).skillLevels.writing)
  try {
    const r = await ai.generateWritingPrompt(lang, diff)
    aiPrompts.value.unshift({
      id: `ai-wp-${Date.now()}`,
      topic: r.topic,
      description: r.description,
      language: lang,
      difficulty: diff,
      wordLimit: diff === 'beginner' ? 200 : diff === 'intermediate' ? 300 : 400,
    })
  } catch { /* error shown via ai.error */ }
}

const langStore = useLanguageStore()
const { speak } = useTextToSpeech()
const currentConfig = computed(() => langStore.currentConfig)

const activePrompt = ref<WritingPrompt | null>(null)
const userText = ref('')
const showSample = ref(false)

const wordCount = computed(() => userText.value.trim().split(/\s+/).filter(Boolean).length)

const currentPrompts = computed(() => [
  ...aiPrompts.value.filter((p) => p.language === langStore.currentLanguage),
  ...writingPrompts.filter((p) => p.language === langStore.currentLanguage),
])

function diffLabel(d: string) {
  return { beginner: '初級', intermediate: '中級', advanced: '高級' }[d] ?? d
}

function startWriting(prompt: WritingPrompt) {
  activePrompt.value = prompt
  userText.value = ''
  showSample.value = false
}

function readPrompt(prompt: WritingPrompt) {
  speak(prompt.topic + '. ' + prompt.description, prompt.language)
}

function readUserText() {
  if (userText.value && activePrompt.value) {
    speak(userText.value, activePrompt.value.language)
  }
}
</script>

<style scoped>
.page-head-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 8px; }
.ai-btn { flex-shrink: 0; }
.ai-error { font-size: 0.85rem; color: #c62828; margin-bottom: 16px; }
.ai-error a { color: var(--accent); font-weight: 700; }
.prompts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }
.prompt-card { padding: 20px; }
.prompt-header { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.prompt-topic { font-size: 1.15rem; margin-bottom: 8px; }
.prompt-desc { font-size: 0.88rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 16px; }

.writing-area { margin-top: 12px; }
.writing-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.word-count { font-size: 0.82rem; color: var(--text-muted); font-weight: 700; }
.sm-btn { font-size: 0.78rem; padding: 5px 10px; }
.writing-textarea { width: 100%; padding: 14px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 0.92rem; font-family: inherit; color: var(--text-primary); background: var(--bg-secondary); resize: vertical; line-height: 1.7; outline: none; transition: border-color 0.15s; }
.writing-textarea:focus { border-color: var(--accent); }
.writing-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
.sample-answer { margin-top: 16px; padding: 14px 16px; background: rgba(139,157,119,0.1); border-left: 3px solid var(--color-sage); border-radius: 0 var(--radius-sm) var(--radius-sm) 0; }
.sample-label { font-size: 0.78rem; font-weight: 700; color: var(--color-sage); margin-bottom: 8px; }
.sample-text { font-size: 0.88rem; color: var(--text-primary); line-height: 1.7; }

.start-writing-btn { width: 100%; justify-content: center; }

@media (max-width: 600px) { .prompts-grid { grid-template-columns: 1fr; } }
</style>
