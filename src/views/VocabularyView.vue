<template>
  <div class="container page-content">
    <div class="page-header">
      <div>
        <h1 class="section-title">📖 單字學習</h1>
        <p class="section-subtitle">
          {{ currentConfig.flag }} {{ currentConfig.name }} 單字庫 · 點擊 🔉 收聽發音
        </p>
      </div>
      <input v-model="searchQuery" class="search-input" placeholder="搜尋單字..." />
    </div>

    <!-- Coming Soon 語言 -->
    <div v-if="decks.length === 0" class="empty-state">
      <p class="empty-icon">🚧</p>
      <p class="empty-text">{{ currentConfig.name }} 單字庫即將推出，敬請期待！</p>
    </div>

    <template v-else>
      <!-- Deck（級數）選擇 -->
      <div class="deck-chips">
        <button
          v-for="deck in decks"
          :key="deck.id"
          class="chip"
          :class="{ active: currentDeckId === deck.id }"
          @click="selectDeck(deck.id)"
        >
          {{ deck.label }}
        </button>
      </div>

      <!-- 分類篩選（英文=主題、中日韓=詞性） -->
      <div v-if="categories.length > 1" class="category-chips">
        <button class="chip chip-sm" :class="{ active: selectedCategory === '' }" @click="selectedCategory = ''">
          全部分類
        </button>
        <button
          v-for="c in categories"
          :key="c.name"
          class="chip chip-sm"
          :class="{ active: selectedCategory === c.name }"
          @click="selectedCategory = selectedCategory === c.name ? '' : c.name"
        >
          {{ c.name }}（{{ c.count.toLocaleString() }}）
        </button>
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

      <div v-if="loading" class="empty-state">
        <p class="empty-icon">⏳</p>
        <p class="empty-text">單字庫載入中...</p>
      </div>

      <div v-else-if="filteredWords.length === 0" class="empty-state">
        <p class="empty-icon">🔍</p>
        <p class="empty-text">找不到符合條件的單字</p>
      </div>

      <template v-else>
        <div class="words-grid">
          <WordCard v-for="word in visibleWords" :key="word.id" :word="word" />
        </div>
        <div v-if="visibleWords.length < filteredWords.length" class="load-more-row">
          <button class="btn btn-primary" @click="visibleCount += PAGE_SIZE">
            載入更多（{{ visibleWords.length }} / {{ filteredWords.length }}）
          </button>
        </div>
      </template>
    </template>

    <div class="news-source-note">
      <p>📡 學習語境搭配 <strong>{{ currentConfig.newsSource.name }}</strong> 時事內容 ·
        <a :href="currentConfig.newsSource.url" target="_blank" rel="noopener">前往閱讀原文 →</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { useProgressStore } from '@/stores/progress'
import { DECKS, loadDeck, type DeckInfo } from '@/data/decks'
import WordCard from '@/components/vocabulary/WordCard.vue'
import type { VocabularyWord, WordEntry } from '@/types'

const PAGE_SIZE = 30

const langStore = useLanguageStore()
const progressStore = useProgressStore()

const currentConfig = computed(() => langStore.currentConfig)
const decks = computed<DeckInfo[]>(() => DECKS[langStore.currentLanguage] ?? [])

const currentDeckId = ref('')
const rawWords = ref<WordEntry[]>([])
const loading = ref(false)
const searchQuery = ref('')
const showBookmarksOnly = ref(false)
const showLearnedOnly = ref(false)
const visibleCount = ref(PAGE_SIZE)

const selectedCategory = ref('')

async function selectDeck(deckId: string) {
  currentDeckId.value = deckId
  loading.value = true
  visibleCount.value = PAGE_SIZE
  selectedCategory.value = ''
  rawWords.value = await loadDeck(langStore.currentLanguage, deckId)
  loading.value = false
}

/** 該 deck 的分類清單（按數量排序） */
const categories = computed(() => {
  const counts = new Map<string, number>()
  for (const w of rawWords.value) {
    if (w.category) counts.set(w.category, (counts.get(w.category) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

// 語言切換時自動載入第一個 deck
watch(
  () => langStore.currentLanguage,
  () => {
    rawWords.value = []
    currentDeckId.value = ''
    const first = decks.value[0]
    if (first) selectDeck(first.id)
  },
  { immediate: true },
)

const currentDeck = computed(() => decks.value.find((d) => d.id === currentDeckId.value))

/** WordEntry → WordCard 用的 VocabularyWord 格式 */
const allWords = computed<VocabularyWord[]>(() => {
  const source = selectedCategory.value
    ? rawWords.value.filter((w) => w.category === selectedCategory.value)
    : rawWords.value
  return source.map((w) => ({
    id: `${langStore.currentLanguage}-${currentDeckId.value}-${w.word}`,
    word: w.word,
    language: langStore.currentLanguage,
    phonetic: { ipa: '', pronunciation: w.reading ?? undefined },
    partOfSpeech: '',
    definition: w.meaning,
    definitionTranslation: '',
    examples: w.exampleSentence
      ? [{ text: w.exampleSentence, translation: w.exampleTranslation ?? '' }]
      : [],
    level: currentDeck.value?.difficulty ?? 'intermediate',
    tags: [w.level, ...(w.category ? [w.category] : []), ...(w.needsTranslation ? ['待翻譯'] : [])],
  }))
})

const filteredWords = computed(() => {
  let words = allWords.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    words = words.filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        w.definition.toLowerCase().includes(q) ||
        (w.phonetic.pronunciation ?? '').toLowerCase().includes(q),
    )
  }
  if (showBookmarksOnly.value) words = words.filter((w) => progressStore.bookmarkedWords.has(w.id))
  if (showLearnedOnly.value) words = words.filter((w) => progressStore.learnedWords.has(w.id))
  return words
})

const visibleWords = computed(() => filteredWords.value.slice(0, visibleCount.value))

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
.search-input {
  padding: 8px 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.88rem;
  outline: none;
  transition: border-color 0.15s;
  min-width: 200px;
}
.search-input:focus { border-color: var(--accent); }

.deck-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.category-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; }
.chip-sm { font-size: 0.76rem; padding: 4px 12px; }
.chip { padding: 7px 16px; border-radius: 20px; border: 1.5px solid var(--border); background: var(--bg-card); color: var(--text-secondary); font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.15s; }
.chip:hover { border-color: var(--accent); color: var(--accent); }
.chip.active { border-color: var(--accent); background: rgba(200, 151, 58, 0.12); color: var(--accent); }

.vocab-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
.vocab-stats { font-size: 0.85rem; color: var(--text-muted); display: flex; gap: 8px; flex-wrap: wrap; }
.divider-dot { color: var(--border); }
.view-toggles { display: flex; gap: 8px; }
.toggle-btn { font-size: 0.82rem; padding: 6px 12px; }
.toggle-btn.active { background: rgba(200, 151, 58, 0.12); border-color: var(--accent); color: var(--accent); }

.words-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }
.load-more-row { display: flex; justify-content: center; margin-top: 28px; }

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
