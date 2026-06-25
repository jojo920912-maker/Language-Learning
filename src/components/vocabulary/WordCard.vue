<template>
  <div class="word-card card fade-up" :class="`lang-${word.language}`">
    <div class="word-card-header">
      <div class="word-main">
        <h3 class="word-text">{{ word.word }}</h3>
        <div class="phonetic-row">
          <span v-if="word.phonetic.kk || word.phonetic.ipa" class="phonetic">
            {{ word.phonetic.kk || word.phonetic.ipa }}
          </span>
          <span v-if="word.phonetic.romaji" class="romanization">{{ word.phonetic.romaji }}</span>
          <span v-if="word.phonetic.pronunciation" class="romanization">{{ word.phonetic.pronunciation }}</span>
        </div>
        <span class="part-of-speech">{{ word.partOfSpeech }}</span>
      </div>

      <div class="word-actions">
        <button
          class="btn btn-icon audio-btn"
          :class="{ speaking: isSpeaking }"
          :title="isSpeaking ? '播放中...' : '播放發音'"
          @click="playAudio"
        >
          <span>{{ isSpeaking ? '🔊' : '🔉' }}</span>
        </button>
        <button class="btn btn-icon" :title="isBookmarked ? '移除書籤' : '加入書籤'" @click="toggleBookmark">
          <span>{{ isBookmarked ? '🔖' : '📌' }}</span>
        </button>
      </div>
    </div>

    <div class="word-body">
      <div class="definition-block">
        <p class="definition">{{ word.definition }}</p>
        <p class="definition-translation">{{ word.definitionTranslation }}</p>
      </div>

      <div class="memory-tip" v-if="word.memoryTip && showDetails">
        <span class="tip-icon">💡</span>
        <span>{{ word.memoryTip }}</span>
      </div>

      <div class="examples-section" v-if="showDetails">
        <p class="examples-title">範例句子</p>
        <div v-for="(ex, i) in word.examples" :key="i" class="example-item">
          <div class="example-text-row">
            <button class="example-audio-btn" @click="speak(ex.text, word.language, 0.8)" title="播放例句">
              🔈
            </button>
            <p class="example-text" v-html="highlightWord(ex.text, ex.highlight)" />
          </div>
          <p class="example-translation">{{ ex.translation }}</p>
        </div>
      </div>

      <div class="word-tags">
        <span v-for="tag in word.tags" :key="tag" class="tag">{{ tag }}</span>
        <span class="badge" :class="`badge-${word.level}`">{{ levelLabel }}</span>
      </div>
    </div>

    <div class="word-card-footer">
      <button class="btn btn-ghost toggle-btn" @click="showDetails = !showDetails">
        {{ showDetails ? '收起詳情 ▲' : '展開詳情 ▼' }}
      </button>
      <button class="btn btn-primary learn-btn" @click="markLearned" :disabled="isLearned">
        {{ isLearned ? '✓ 已學習' : '標記已學習' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTextToSpeech } from '@/composables/useTextToSpeech'
import { useProgressStore } from '@/stores/progress'
import type { VocabularyWord } from '@/types'

const props = defineProps<{ word: VocabularyWord }>()

const { speak, isSpeaking } = useTextToSpeech()
const progressStore = useProgressStore()

const showDetails = ref(false)

const isBookmarked = computed(() => progressStore.bookmarkedWords.has(props.word.id))
const isLearned = computed(() => progressStore.learnedWords.has(props.word.id))

const levelLabel = computed(() => {
  const map: Record<string, string> = { beginner: '初級', intermediate: '中級', advanced: '高級' }
  return map[props.word.level] ?? props.word.level
})

function playAudio() {
  speak(props.word.word, props.word.language)
}

function toggleBookmark() {
  progressStore.toggleBookmark(props.word.id)
}

function markLearned() {
  progressStore.markWordLearned(props.word.id, props.word.language)
}

function highlightWord(text: string, highlight?: string): string {
  if (!highlight) return text
  const regex = new RegExp(`(${highlight})`, 'gi')
  return text.replace(regex, '<mark class="word-highlight">$1</mark>')
}
</script>

<style scoped>
.word-card {
  padding: 0;
  transition: transform 0.2s, box-shadow 0.2s;
}
.word-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(74, 44, 23, 0.13);
}

.word-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 20px 0;
  gap: 12px;
}

.word-main { flex: 1; }

.word-text {
  font-family: 'Playfair Display', serif;
  font-size: 1.6rem;
  color: var(--text-primary);
  line-height: 1.2;
  margin-bottom: 4px;
}

.phonetic-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}
.phonetic {
  font-size: 0.88rem;
  color: var(--text-muted);
  font-family: monospace;
}
.romanization {
  font-size: 0.85rem;
  color: var(--color-sage);
  font-style: italic;
}
.part-of-speech {
  font-size: 0.78rem;
  color: var(--accent);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.word-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.audio-btn { font-size: 1.1rem; }
.audio-btn.speaking { animation: pulse 0.6s ease infinite; background: rgba(200, 151, 58, 0.15); }

.word-body { padding: 16px 20px; }

.definition-block { margin-bottom: 12px; }
.definition { font-size: 0.95rem; color: var(--text-primary); margin-bottom: 4px; }
.definition-translation { font-size: 0.88rem; color: var(--text-muted); font-style: italic; }

.memory-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: rgba(200, 151, 58, 0.08);
  border-left: 3px solid var(--accent);
  padding: 10px 12px;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
}
.tip-icon { flex-shrink: 0; font-size: 1rem; }

.examples-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.example-item {
  padding: 10px 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  margin-bottom: 8px;
}
.example-text-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 4px;
}
.example-audio-btn {
  background: none;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  flex-shrink: 0;
  padding: 0;
  line-height: 1.5;
  opacity: 0.6;
  transition: opacity 0.15s;
}
.example-audio-btn:hover { opacity: 1; }
.example-text { font-size: 0.9rem; color: var(--text-primary); }
.example-translation { font-size: 0.83rem; color: var(--text-muted); padding-left: 22px; }

:deep(.word-highlight) {
  background: rgba(200, 151, 58, 0.25);
  color: var(--accent);
  border-radius: 2px;
  padding: 0 2px;
  font-weight: 700;
}

.word-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.word-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  gap: 8px;
}
.toggle-btn { font-size: 0.82rem; }
.learn-btn { font-size: 0.85rem; padding: 8px 16px; }
.learn-btn:disabled { opacity: 0.6; cursor: default; background: var(--color-sage); }
</style>
