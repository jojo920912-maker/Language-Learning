<template>
  <div class="container page-content">
    <h1 class="section-title">✍️ 寫作練習</h1>
    <p class="section-subtitle">{{ currentConfig.flag }} {{ currentConfig.name }} · 針對考試題型進行寫作訓練</p>

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
import { useLanguageStore } from '@/stores/language'
import { useTextToSpeech } from '@/composables/useTextToSpeech'
import type { WritingPrompt } from '@/types'

const langStore = useLanguageStore()
const { speak } = useTextToSpeech()
const currentConfig = computed(() => langStore.currentConfig)

const activePrompt = ref<WritingPrompt | null>(null)
const userText = ref('')
const showSample = ref(false)

const wordCount = computed(() => userText.value.trim().split(/\s+/).filter(Boolean).length)

const prompts: WritingPrompt[] = [
  { id: 'wp-en-001', topic: 'Technology in Education', description: 'Discuss the advantages and disadvantages of using technology in modern education. Include specific examples.', language: 'en', difficulty: 'intermediate', wordLimit: 250, examType: 'TOEFL', sampleAnswer: 'Technology has revolutionized education in countless ways. Interactive whiteboards, online resources, and learning management systems have made education more accessible and engaging. However, over-reliance on technology can lead to shorter attention spans and reduced critical thinking. The key is finding balance — using technology as a tool to enhance learning, not replace traditional teaching methods. Schools that integrate technology thoughtfully tend to produce more engaged and independent learners.' },
  { id: 'wp-en-002', topic: 'Work-Life Balance', description: 'Some people believe that work should always come first, while others prioritize personal life. Discuss both views and give your own opinion.', language: 'en', difficulty: 'advanced', wordLimit: 300, examType: 'IELTS' },
  { id: 'wp-ja-001', topic: '環境問題について', description: '現代社会における環境問題について、原因と解決策を含めて論じてください。', language: 'ja', difficulty: 'intermediate', wordLimit: 400, examType: 'JLPT_N2', sampleAnswer: '現代社会では、地球温暖化や海洋汚染など様々な環境問題が深刻化しています。その主な原因は、工業化による温室効果ガスの排出と、プラスチック製品の過剰使用です。解決のためには、再生可能エネルギーの普及と、個人レベルでの消費行動の見直しが必要です。政府、企業、個人が協力して取り組むことで、持続可能な社会を実現できると考えます。' },
  { id: 'wp-ko-001', topic: '소셜 미디어의 영향', description: '소셜 미디어가 현대 사회에 미치는 긍정적, 부정적 영향에 대해 써 보세요.', language: 'ko', difficulty: 'intermediate', wordLimit: 300, examType: 'TOPIK_II' },
]

const currentPrompts = computed(() => prompts.filter((p) => p.language === langStore.currentLanguage))

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
