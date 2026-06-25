<template>
  <div class="container page-content">
    <div class="page-header">
      <div>
        <h1 class="section-title">📰 閱讀練習</h1>
        <p class="section-subtitle">搭配 {{ currentConfig.newsSource.name }} 等時事媒體，提升閱讀理解</p>
      </div>
      <a :href="currentConfig.newsSource.url" target="_blank" rel="noopener" class="btn btn-ghost news-link">
        前往 {{ currentConfig.newsSource.name }} {{ currentConfig.newsSource.logo }}
      </a>
    </div>

    <div class="article-filters">
      <button
        v-for="tag in filterTags"
        :key="tag"
        class="chip"
        :class="{ active: activeTag === tag }"
        @click="activeTag = activeTag === tag ? '' : tag"
      >
        {{ tag === '' ? '全部' : tag }}
      </button>
    </div>

    <!-- Article list -->
    <div v-if="!selectedArticle" class="articles-grid">
      <div
        v-for="article in filteredArticles"
        :key="article.id"
        class="article-card card"
        @click="openArticle(article)"
      >
        <div class="article-header">
          <div class="article-meta">
            <span class="badge" :class="`badge-${article.difficulty}`">{{ diffLabel(article.difficulty) }}</span>
            <span class="article-source">{{ article.source }}</span>
            <span class="article-time">⏱ {{ article.readingTime }} 分鐘</span>
          </div>
          <span class="article-lang">{{ langFlag(article.language) }}</span>
        </div>
        <h3 class="article-title">{{ article.title }}</h3>
        <p class="article-summary">{{ article.summary }}</p>
        <div class="article-tags">
          <span v-for="tag in article.tags.slice(0, 4)" :key="tag" class="tag">{{ tag }}</span>
        </div>
        <div class="article-footer">
          <span class="article-date">{{ article.publishedAt }}</span>
          <span class="read-link">閱讀全文 →</span>
        </div>
      </div>
    </div>

    <!-- Article detail -->
    <div v-else class="article-detail">
      <button class="btn btn-ghost back-btn" @click="selectedArticle = null">← 返回文章列表</button>

      <div class="article-full card">
        <div class="article-full-header">
          <div class="article-meta">
            <span class="badge" :class="`badge-${selectedArticle.difficulty}`">{{ diffLabel(selectedArticle.difficulty) }}</span>
            <a :href="selectedArticle.sourceUrl" target="_blank" rel="noopener" class="source-link">
              {{ selectedArticle.source }} ↗
            </a>
          </div>
          <h2 class="article-full-title">{{ selectedArticle.title }}</h2>
          <div class="article-tts-row">
            <button class="btn btn-primary tts-btn" @click="readArticle">
              {{ isSpeaking ? '⏸ 暫停朗讀' : '▶ 朗讀全文' }}
            </button>
            <span class="tts-hint">點擊聆聽文章朗讀</span>
          </div>
        </div>

        <div class="article-body">
          <p v-for="(paragraph, i) in paragraphs" :key="i" class="article-paragraph">
            {{ paragraph }}
          </p>
        </div>
      </div>

      <!-- Reading comprehension questions -->
      <div v-if="selectedArticle.questions?.length" class="comprehension-section">
        <h3 class="section-title">📝 閱讀理解練習</h3>
        <div class="questions-container">
          <QuizCard
            v-if="selectedArticle.questions && currentQuestionIdx < selectedArticle.questions.length && selectedArticle.questions[currentQuestionIdx] != null"
            :question="selectedArticle.questions[currentQuestionIdx]!"
            :question-number="currentQuestionIdx + 1"
            :total-questions="selectedArticle.questions.length"
            :is-last="currentQuestionIdx === selectedArticle.questions.length - 1"
            @answer="onAnswer"
            @next="nextArticleQuestion"
          />
          <div v-else class="all-done">
            <p>🎉 恭喜完成本篇閱讀測驗！</p>
            <button class="btn btn-ghost" @click="currentQuestionIdx = 0">重新練習</button>
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
import { articles } from '@/data/articles'
import { LANGUAGES } from '@/data/languages'
import QuizCard from '@/components/quiz/QuizCard.vue'
import type { Article } from '@/types'

const langStore = useLanguageStore()
const { speak, stop, isSpeaking } = useTextToSpeech()
const currentConfig = computed(() => langStore.currentConfig)

const selectedArticle = ref<Article | null>(null)
const activeTag = ref('')
const currentQuestionIdx = ref(0)
const articleScore = ref(0)

const filterTags = computed(() => {
  const tags = new Set<string>([''])
  filteredByLang.value.forEach((a) => a.tags.forEach((t) => tags.add(t)))
  return Array.from(tags)
})

const filteredByLang = computed(() =>
  articles.filter((a) => a.language === langStore.currentLanguage),
)

const filteredArticles = computed(() => {
  if (!activeTag.value) return filteredByLang.value
  return filteredByLang.value.filter((a) => a.tags.includes(activeTag.value))
})

const paragraphs = computed(() =>
  selectedArticle.value?.content.split('\n\n').filter(Boolean) ?? [],
)

function diffLabel(d: string) {
  return { beginner: '初級', intermediate: '中級', advanced: '高級' }[d] ?? d
}

function langFlag(lang: string) {
  return LANGUAGES.find((l) => l.code === lang)?.flag ?? ''
}

function openArticle(article: Article) {
  selectedArticle.value = article
  currentQuestionIdx.value = 0
  articleScore.value = 0
  stop()
}

function readArticle() {
  if (isSpeaking.value) {
    stop()
  } else {
    speak(selectedArticle.value?.content ?? '', langStore.currentLanguage, 0.85)
  }
}

function onAnswer(correct: boolean) {
  if (correct) articleScore.value++
}

function nextArticleQuestion() {
  if (selectedArticle.value && currentQuestionIdx.value < selectedArticle.value.questions!.length - 1) {
    currentQuestionIdx.value++
  } else {
    currentQuestionIdx.value = (selectedArticle.value?.questions?.length ?? 0)
  }
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
.news-link { font-size: 0.85rem; }

.article-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
.chip { padding: 6px 14px; border-radius: 20px; border: 1.5px solid var(--border); background: var(--bg-card); color: var(--text-secondary); font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.15s; }
.chip:hover { border-color: var(--accent); color: var(--accent); }
.chip.active { border-color: var(--accent); background: rgba(200, 151, 58, 0.12); color: var(--accent); }

.articles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
.article-card { padding: 20px; cursor: pointer; transition: all 0.2s; }
.article-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(74,44,23,0.13); }
.article-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.article-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.article-source { font-size: 0.78rem; font-weight: 700; color: var(--accent); }
.article-time { font-size: 0.75rem; color: var(--text-muted); }
.article-lang { font-size: 1.2rem; }
.article-title { font-size: 1.1rem; margin-bottom: 8px; line-height: 1.4; }
.article-summary { font-size: 0.88rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 12px; }
.article-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.article-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--border); }
.article-date { font-size: 0.78rem; color: var(--text-muted); }
.read-link { font-size: 0.82rem; font-weight: 700; color: var(--accent); }

.back-btn { margin-bottom: 20px; }
.article-full { padding: 28px; margin-bottom: 28px; }
.article-full-header { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
.article-full-title { font-size: 1.6rem; margin: 10px 0 16px; }
.source-link { font-size: 0.82rem; font-weight: 700; color: var(--accent); }
.article-tts-row { display: flex; align-items: center; gap: 12px; }
.tts-btn { font-size: 0.85rem; padding: 8px 18px; }
.tts-hint { font-size: 0.78rem; color: var(--text-muted); }
.article-paragraph { font-size: 0.95rem; line-height: 1.85; color: var(--text-primary); margin-bottom: 16px; }

.comprehension-section { margin-top: 8px; }
.comprehension-section .section-title { margin-bottom: 20px; }
.questions-container { max-width: 680px; }
.all-done { text-align: center; padding: 40px; background: var(--bg-secondary); border-radius: var(--radius-md); }
.all-done p { font-size: 1.1rem; margin-bottom: 16px; }

@media (max-width: 600px) {
  .articles-grid { grid-template-columns: 1fr; }
}
</style>
