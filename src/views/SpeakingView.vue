<template>
  <div class="container page-content">
    <h1 class="section-title">🎙️ 口說練習</h1>
    <p class="section-subtitle">{{ currentConfig.flag }} {{ currentConfig.name }} · 模仿跟讀，改善發音與流暢度</p>

    <div class="speaking-tips card">
      <h3 class="tips-title">💡 口說練習技巧</h3>
      <div class="tips-grid">
        <div class="tip-item">
          <span>1️⃣</span>
          <p>先聆聽範例句，注意語調與節奏</p>
        </div>
        <div class="tip-item">
          <span>2️⃣</span>
          <p>跟著朗讀（Shadow Listening），模仿音調</p>
        </div>
        <div class="tip-item">
          <span>3️⃣</span>
          <p>錄下自己的聲音，與範例比較</p>
        </div>
        <div class="tip-item">
          <span>4️⃣</span>
          <p>重複練習直到流暢自然</p>
        </div>
      </div>
    </div>

    <div class="sentences-section">
      <h2 class="section-title" style="margin-bottom:20px">跟讀練習句</h2>
      <div class="sentences-list">
        <div v-for="item in currentSentences" :key="item.id" class="sentence-card card">
          <div class="sentence-meta">
            <span class="badge" :class="`badge-${item.level}`">{{ diffLabel(item.level) }}</span>
            <span class="tag">{{ item.category }}</span>
          </div>
          <p class="sentence-text">{{ item.text }}</p>
          <p class="sentence-translation">{{ item.translation }}</p>
          <p v-if="item.phonetic" class="sentence-phonetic">{{ item.phonetic }}</p>
          <div class="sentence-actions">
            <button class="btn btn-primary play-btn" :class="{ playing: playingId === item.id }" @click="playSentence(item)">
              {{ playingId === item.id ? '⏸ 播放中' : '▶ 播放' }}
            </button>
            <div class="speed-row">
              <span class="speed-label">速度</span>
              <button v-for="s in [0.6, 0.8, 1.0]" :key="s" class="speed-chip" :class="{ active: speed === s }" @click="speed = s">{{ s }}x</button>
            </div>
          </div>
          <div class="repeat-tip">
            <span>🔁 建議跟讀 5-10 次 · 注意模仿語調和停頓</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { useTextToSpeech } from '@/composables/useTextToSpeech'

const langStore = useLanguageStore()
const { speak, isSpeaking } = useTextToSpeech()
const currentConfig = computed(() => langStore.currentConfig)

const speed = ref(0.8)
const playingId = ref<string | null>(null)

interface SentenceItem {
  id: string
  text: string
  translation: string
  phonetic?: string
  level: 'beginner' | 'intermediate' | 'advanced'
  category: string
  language: string
}

const sentences: SentenceItem[] = [
  { id: 'sp-en-001', text: 'Could you please repeat that more slowly?', translation: '可以請你說慢一點嗎？', phonetic: '/kʊd juː pliːz rɪˈpiːt ðæt mɔːr ˈsloʊli/', level: 'beginner', category: '日常對話', language: 'en' },
  { id: 'sp-en-002', text: 'I\'d like to schedule a meeting at your earliest convenience.', translation: '我想在您方便的最早時間安排一個會議。', phonetic: '/aɪd laɪk tə ˈskɛdʒuːl ə ˈmiːtɪŋ æt jɔːr ˈɜːlɪɪst kənˈviːniəns/', level: 'intermediate', category: '商務英語', language: 'en' },
  { id: 'sp-en-003', text: 'The implementation of sustainable energy solutions is paramount to addressing climate change effectively.', translation: '實施可持續能源解決方案對於有效應對氣候變化至關重要。', phonetic: '/ðə ˌɪmplɪmenˈteɪʃən əv səˈsteɪnəbəl ˈɛnərʤɪ səˈluːʃənz/', level: 'advanced', category: '學術英語', language: 'en' },
  { id: 'sp-ja-001', text: 'はじめまして、よろしくお願いします。', translation: '初次見面，請多關照。', phonetic: 'Hajimemashite, yoroshiku onegaishimasu.', level: 'beginner', category: '日常會話', language: 'ja' },
  { id: 'sp-ja-002', text: 'この資料を明日の会議までに確認していただけますか？', translation: '可以請您在明天的會議前確認這份資料嗎？', phonetic: 'Kono shiryō o ashita no kaigi made ni kakunin shite itadakemasu ka?', level: 'intermediate', category: 'ビジネス', language: 'ja' },
  { id: 'sp-ko-001', text: '안녕하세요, 처음 뵙겠습니다.', translation: '您好，初次見面。', phonetic: 'Annyeonghaseyo, cheoeum boepgesseumnida.', level: 'beginner', category: '일상 회화', language: 'ko' },
  { id: 'sp-ko-002', text: '오늘 회의 자료를 미리 검토해 주시겠어요?', translation: '可以請您提前審查今天的會議資料嗎？', phonetic: 'Oneul hoeui jaryoreul miri geomtohae jusigesseoyo?', level: 'intermediate', category: '비즈니스', language: 'ko' },
]

const currentSentences = computed(() => sentences.filter((s) => s.language === langStore.currentLanguage))

function diffLabel(d: string) {
  return { beginner: '初級', intermediate: '中級', advanced: '高級' }[d] ?? d
}

function playSentence(item: SentenceItem) {
  playingId.value = item.id
  speak(item.text, item.language as any, speed.value)
  setTimeout(() => { playingId.value = null }, item.text.length * 80)
}
</script>

<style scoped>
.speaking-tips { padding: 20px; margin-bottom: 32px; }
.tips-title { font-size: 1.05rem; margin-bottom: 14px; }
.tips-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
.tip-item { display: flex; gap: 10px; align-items: flex-start; font-size: 0.88rem; color: var(--text-secondary); }

.sentences-list { display: flex; flex-direction: column; gap: 16px; }
.sentence-card { padding: 20px; }
.sentence-meta { display: flex; gap: 8px; margin-bottom: 12px; }
.sentence-text { font-size: 1.05rem; color: var(--text-primary); margin-bottom: 6px; line-height: 1.5; font-weight: 500; }
.sentence-translation { font-size: 0.88rem; color: var(--text-muted); margin-bottom: 6px; }
.sentence-phonetic { font-size: 0.82rem; color: var(--color-sage); font-family: monospace; margin-bottom: 14px; }
.sentence-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
.play-btn { padding: 8px 20px; }
.play-btn.playing { background: var(--color-sage); }
.speed-row { display: flex; align-items: center; gap: 6px; }
.speed-label { font-size: 0.78rem; color: var(--text-muted); font-weight: 700; }
.speed-chip { padding: 4px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-card); font-size: 0.78rem; cursor: pointer; transition: all 0.15s; }
.speed-chip.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.repeat-tip { font-size: 0.78rem; color: var(--text-muted); padding: 8px 12px; background: var(--bg-secondary); border-radius: var(--radius-sm); }
</style>
