<template>
  <div class="container page-content">
    <div class="page-header">
      <div>
        <h1 class="section-title">📖 單字學習</h1>
        <p class="section-subtitle">
          {{ currentConfig.flag }} {{ currentConfig.name }} 單字庫 · 點擊 🔉 收聽發音
        </p>
      </div>
      <div class="header-filters">
        <select v-model="filterLevel" class="filter-select">
          <option value="">全部程度</option>
          <option value="beginner">初級</option>
          <option value="intermediate">中級</option>
          <option value="advanced">高級</option>
        </select>
        <input v-model="searchQuery" class="search-input" placeholder="搜尋單字..." />
      </div>
    </div>

    <div class="vocab-toolbar">
      <div class="vocab-stats">
        <span>共 {{ filteredWords.length }} 個單字</span>
        <span class="divider-dot">·</span>
        <span>已學習 {{ learnedCount }} 個</span>
        <span class="divider-dot">·</span>
        <span>書籤 {{ bookmarkCount }} 個</span>
      </div>
      <div class="view-toggles">
        <button class="btn btn-ghost toggle-btn" :class="{ active: showBookmarksOnly }" @click="showBookmarksOnly = !showBookmarksOnly">
          🔖 只看書籤
        </button>
        <button class="btn btn-ghost toggle-btn" :class="{ active: showLearnedOnly }" @click="showLearnedOnly = !showLearnedOnly">
          ✓ 只看已學
        </button>
      </div>
    </div>

    <div v-if="filteredWords.length === 0" class="empty-state">
      <p class="empty-icon">🔍</p>
      <p class="empty-text">找不到符合條件的單字</p>
    </div>

    <div class="words-grid" v-else>
      <WordCard v-for="word in filteredWords" :key="word.id" :word="word" />
    </div>

    <div class="news-source-note">
      <p>📡 學習語境搭配 <strong>{{ currentConfig.newsSource.name }}</strong> 時事內容 ·
        <a :href="currentConfig.newsSource.url" target="_blank" rel="noopener">前往閱讀原文 →</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { useProgressStore } from '@/stores/progress'
import { englishVocabulary } from '@/data/vocabulary/english'
import { japaneseVocabulary } from '@/data/vocabulary/japanese'
import { koreanVocabulary } from '@/data/vocabulary/korean'
import WordCard from '@/components/vocabulary/WordCard.vue'
import type { VocabularyWord } from '@/types'

const langStore = useLanguageStore()
const progressStore = useProgressStore()

const currentConfig = computed(() => langStore.currentConfig)

const filterLevel = ref('')
const searchQuery = ref('')
const showBookmarksOnly = ref(false)
const showLearnedOnly = ref(false)

const allWords = computed<VocabularyWord[]>(() => {
  const map: Record<string, VocabularyWord[]> = {
    en: englishVocabulary,
    ja: japaneseVocabulary,
    ko: koreanVocabulary,
  }
  return map[langStore.currentLanguage] ?? []
})

const filteredWords = computed(() => {
  let words = allWords.value
  if (filterLevel.value) words = words.filter((w) => w.level === filterLevel.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    words = words.filter((w) => w.word.toLowerCase().includes(q) || w.definition.toLowerCase().includes(q) || w.definitionTranslation.includes(q))
  }
  if (showBookmarksOnly.value) words = words.filter((w) => progressStore.bookmarkedWords.has(w.id))
  if (showLearnedOnly.value) words = words.filter((w) => progressStore.learnedWords.has(w.id))
  return words
})

const learnedCount = computed(() => allWords.value.filter((w) => progressStore.learnedWords.has(w.id)).length)
const bookmarkCount = computed(() => allWords.value.filter((w) => progressStore.bookmarkedWords.has(w.id)).length)
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.header-filters { display: flex; gap: 10px; flex-wrap: wrap; }
.filter-select, .search-input {
  padding: 8px 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.88rem;
  outline: none;
  transition: border-color 0.15s;
}
.filter-select:focus, .search-input:focus { border-color: var(--accent); }
.search-input { min-width: 180px; }

.vocab-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.vocab-stats { font-size: 0.85rem; color: var(--text-muted); display: flex; gap: 8px; flex-wrap: wrap; }
.divider-dot { color: var(--border); }
.view-toggles { display: flex; gap: 8px; }
.toggle-btn { font-size: 0.82rem; padding: 6px 12px; }
.toggle-btn.active { background: rgba(200, 151, 58, 0.12); border-color: var(--accent); color: var(--accent); }

.words-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }

.empty-state { text-align: center; padding: 60px 20px; color: var(--text-muted); }
.empty-icon { font-size: 3rem; margin-bottom: 12px; }
.empty-text { font-size: 1rem; }

.news-source-note {
  margin-top: 32px;
  padding: 14px 18px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  font-size: 0.85rem;
  color: var(--text-muted);
  text-align: center;
}

@media (max-width: 600px) {
  .words-grid { grid-template-columns: 1fr; }
}
</style>
