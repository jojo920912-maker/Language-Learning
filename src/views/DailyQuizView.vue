<template>
  <div class="container page-content">
    <div class="page-header">
      <div>
        <h1 class="section-title">📝 每日測驗</h1>
        <p class="section-subtitle">{{ currentConfig.flag }} {{ currentConfig.name }} · 每天練習，持續進步</p>
      </div>
    </div>

    <!-- Before quiz -->
    <div v-if="!quizStarted && !quizCompleted" class="quiz-setup card">
      <div class="setup-content">
        <div class="setup-icon">📝</div>
        <h2 class="setup-title">今日測驗</h2>
        <p class="setup-desc">選擇題型和難度，開始今天的學習測驗！</p>

        <div class="setup-options">
          <div class="option-group">
            <label class="option-label">測驗語言</label>
            <div class="option-chips">
              <button
                v-for="lang in languages"
                :key="lang.code"
                class="chip"
                :class="{ active: langStore.currentLanguage === lang.code }"
                @click="langStore.setLanguage(lang.code)"
              >
                {{ lang.flag }} {{ lang.name }}
              </button>
            </div>
          </div>

          <div class="option-group">
            <label class="option-label">題目數量</label>
            <div class="option-chips">
              <button v-for="n in [5, 10, 15]" :key="n" class="chip" :class="{ active: questionCount === n }" @click="questionCount = n">
                {{ n }} 題
              </button>
            </div>
          </div>

          <div class="option-group">
            <label class="option-label">技能類型</label>
            <div class="option-chips">
              <button
                v-for="s in skillOptions"
                :key="s.value"
                class="chip"
                :class="{ active: selectedSkill === s.value }"
                @click="selectedSkill = s.value"
              >
                {{ s.icon }} {{ s.label }}
              </button>
            </div>
          </div>

          <div class="option-group">
            <label class="option-label">出題來源</label>
            <div class="option-chips">
              <button class="chip" :class="{ active: quizSource === 'deck' }" @click="quizSource = 'deck'">📚 單字庫</button>
              <button class="chip" :class="{ active: quizSource === 'marathon' }" @click="quizSource = 'marathon'">🏃 題庫馬拉松（依程度）</button>
            </div>
            <p v-if="quizSource === 'marathon'" class="ai-hint">
              依你的程度出一大批混合題型（初級 250、中級 500、高級 1000 題），隨時可提前結算。
              <span v-if="bankCount !== null">本語言題庫共 {{ bankCount.toLocaleString() }} 題。</span>
            </p>
          </div>
        </div>

        <button class="btn btn-primary start-btn" :disabled="loadingQuiz" @click="startQuiz">
          {{ loadingQuiz ? '出題中…' : '開始測驗 🚀' }}
        </button>
      </div>
    </div>

    <!-- Quiz in progress -->
    <div v-else-if="quizStarted && !quizCompleted" class="quiz-container">
      <div class="quiz-progress-bar">
        <div class="quiz-progress-fill" :style="{ width: progressPct + '%' }" />
      </div>
      <div v-if="quizSource === 'marathon'" class="marathon-bar">
        <span>🏃 馬拉松 · 難度{{ diffLabelZh }} · 已答 {{ answeredCount }} / {{ quizQuestions.length }}</span>
        <button class="btn btn-ghost finish-early-btn" @click="finishQuiz">提前結算</button>
      </div>

      <QuizCard
        v-if="currentQuestion"
        :question="currentQuestion"
        :question-number="currentIndex + 1"
        :total-questions="quizQuestions.length"
        :is-last="currentIndex === quizQuestions.length - 1"
        @answer="onAnswer"
        @next="nextQuestion"
      />
    </div>

    <!-- Quiz completed -->
    <div v-else-if="quizCompleted" class="quiz-result card">
      <div class="result-header">
        <div class="result-emoji">{{ scoreEmoji }}</div>
        <h2 class="result-title">測驗完成！</h2>
        <p class="result-score">{{ correctCount }} / {{ answeredCount }} 題答對</p>
        <div class="result-pct">{{ scorePct }}%</div>
      </div>

      <div class="result-breakdown">
        <div class="breakdown-item" :class="correctCount > answeredCount / 2 ? 'good' : 'retry'">
          <span>✓ 答對</span>
          <span>{{ correctCount }} 題</span>
        </div>
        <div class="breakdown-item retry">
          <span>✗ 答錯</span>
          <span>{{ answeredCount - correctCount }} 題</span>
        </div>
        <div class="breakdown-item">
          <span>⭐ 獲得點數</span>
          <span>+{{ earnedPoints }}</span>
        </div>
      </div>

      <div class="result-actions">
        <button class="btn btn-primary" @click="restartQuiz">再來一次 🔄</button>
        <RouterLink to="/vocabulary" class="btn btn-ghost">複習單字 📖</RouterLink>
        <RouterLink to="/exam" class="btn btn-ghost">考試準備 🎯</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import { useProgressStore } from '@/stores/progress'
import { LANGUAGES } from '@/data/languages'
import { dailyQuizzes } from '@/data/quizzes'
import { DECKS } from '@/data/decks'
import { generateVocabQuiz } from '@/data/quizGenerator'
import { generateBatch, bankTotal, batchSizeFor, levelFromSkill } from '@/data/questionBank'
import QuizCard from '@/components/quiz/QuizCard.vue'
import type { QuizQuestion, DifficultyLevel } from '@/types'

const quizSource = ref<'deck' | 'marathon'>('deck')

const langStore = useLanguageStore()
const progressStore = useProgressStore()

// 題庫總量（選馬拉松時才載入，按語言快取）
const bankCount = ref<number | null>(null)
const bankCache = new Map<string, number>()
watch([quizSource, () => langStore.currentLanguage], async ([src]) => {
  if (src !== 'marathon') return
  const lang = langStore.currentLanguage
  if (bankCache.has(lang)) { bankCount.value = bankCache.get(lang)!; return }
  bankCount.value = null
  const n = await bankTotal(lang)
  bankCache.set(lang, n)
  bankCount.value = n
})

const currentConfig = computed(() => langStore.currentConfig)
const languages = LANGUAGES

const quizStarted = ref(false)
const quizCompleted = ref(false)
const questionCount = ref(5)
const selectedSkill = ref('all')
const currentIndex = ref(0)
const correctCount = ref(0)
const answeredCount = ref(0)
const quizQuestions = ref<QuizQuestion[]>(dailyQuizzes)
const loadingQuiz = ref(false)
const marathonDiff = ref<DifficultyLevel>('beginner')
const diffLabelZh = computed(() => ({ beginner: '初級', intermediate: '中級', advanced: '高級' }[marathonDiff.value]))

const skillOptions = [
  { value: 'all', icon: '🌟', label: '全部' },
  { value: 'vocabulary', icon: '📖', label: '單字' },
  { value: 'reading', icon: '📰', label: '閱讀' },
  { value: 'listening', icon: '🎧', label: '聽力' },
  { value: 'grammar', icon: '🔤', label: '文法' },
]

const currentQuestion = computed(() => quizQuestions.value[currentIndex.value])
const progressPct = computed(() => ((currentIndex.value) / quizQuestions.value.length) * 100)
const scorePct = computed(() => (answeredCount.value ? Math.round((correctCount.value / answeredCount.value) * 100) : 0))
const earnedPoints = computed(() => scorePct.value)
const scoreEmoji = computed(() => {
  const pct = scorePct.value
  if (pct >= 90) return '🏆'
  if (pct >= 70) return '🎉'
  if (pct >= 50) return '💪'
  return '📚'
})

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

function beginWith(questions: QuizQuestion[]) {
  quizQuestions.value = questions
  currentIndex.value = 0
  correctCount.value = 0
  answeredCount.value = 0
  quizStarted.value = true
  quizCompleted.value = false
  loadingQuiz.value = false
}

async function startQuiz() {
  loadingQuiz.value = true
  const lang = langStore.currentLanguage

  // 題庫馬拉松：依程度出一大批混合題型
  if (quizSource.value === 'marathon') {
    const diff = levelFromSkill(progressStore.getProgress(lang).skillLevels.vocabulary)
    marathonDiff.value = diff
    const batch = await generateBatch(lang, diff, batchSizeFor(diff))
    if (batch.length) { beginWith(batch); return }
    loadingQuiz.value = false
    alert('題庫載入失敗，請改用單字庫模式')
    return
  }

  // 精選題（人工撰寫，含閱讀/聽力/文法）
  let curated = dailyQuizzes.filter((q) => q.language === lang)
  if (selectedSkill.value !== 'all') curated = curated.filter((q) => q.skill === selectedSkill.value)

  // 從單字庫自動生成單字題（全部或選「單字」時）
  let generated: QuizQuestion[] = []
  if (selectedSkill.value === 'all' || selectedSkill.value === 'vocabulary') {
    const deck = DECKS[lang]?.[0]
    if (deck) {
      generated = await generateVocabQuiz(lang, deck.id, questionCount.value * 2, deck.difficulty)
    }
  }

  const pool = shuffle([...generated, ...curated])
  let picked = pool.slice(0, questionCount.value)
  if (picked.length === 0) {
    picked = dailyQuizzes.filter((q) => q.language === lang).slice(0, questionCount.value)
  }
  beginWith(picked)
}

function onAnswer(correct: boolean) {
  answeredCount.value++
  if (correct) correctCount.value++
}

function finishQuiz() {
  quizCompleted.value = true
  const total = Math.max(1, answeredCount.value)
  progressStore.recordQuizComplete(langStore.currentLanguage, correctCount.value, total, 'vocabulary')
  progressStore.addPoints(langStore.currentLanguage, earnedPoints.value)
}

function nextQuestion() {
  if (currentIndex.value < quizQuestions.value.length - 1) {
    currentIndex.value++
  } else {
    finishQuiz()
  }
}

function restartQuiz() {
  quizStarted.value = false
  quizCompleted.value = false
}
</script>

<style scoped>
.page-header { margin-bottom: 28px; }

.quiz-setup { padding: 40px; text-align: center; }
.setup-content { max-width: 600px; margin: 0 auto; }
.setup-icon { font-size: 3rem; margin-bottom: 12px; }
.setup-title { font-size: 1.6rem; margin-bottom: 8px; }
.setup-desc { color: var(--text-muted); margin-bottom: 32px; }

.setup-options { display: flex; flex-direction: column; gap: 20px; margin-bottom: 32px; text-align: left; }
.option-group { display: flex; flex-direction: column; gap: 10px; }
.option-label { font-size: 0.82rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.option-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  padding: 7px 16px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.chip:hover { border-color: var(--accent); color: var(--accent); }
.chip.active { border-color: var(--accent); background: rgba(200, 151, 58, 0.12); color: var(--accent); }

.ai-hint { font-size: 0.78rem; color: var(--text-muted); }
.marathon-bar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; font-size: 0.85rem; color: var(--text-secondary); font-weight: 700; flex-wrap: wrap; }
.finish-early-btn { font-size: 0.8rem; padding: 5px 12px; }
.ai-hint a { color: var(--accent); font-weight: 700; }
.start-btn { width: 100%; max-width: 300px; justify-content: center; padding: 14px; font-size: 1rem; }

.quiz-container { max-width: 680px; margin: 0 auto; }
.quiz-progress-bar { height: 4px; background: var(--color-latte); border-radius: 2px; margin-bottom: 24px; overflow: hidden; }
.quiz-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--color-cinnamon)); border-radius: 2px; transition: width 0.5s ease; }

.quiz-result {
  max-width: 500px;
  margin: 0 auto;
  padding: 40px 32px;
  text-align: center;
}
.result-emoji { font-size: 4rem; margin-bottom: 12px; }
.result-title { font-size: 1.8rem; margin-bottom: 8px; }
.result-score { color: var(--text-muted); font-size: 1.1rem; margin-bottom: 8px; }
.result-pct { font-size: 3rem; font-weight: 700; color: var(--accent); margin-bottom: 28px; font-family: 'Playfair Display', serif; }

.result-breakdown { display: flex; gap: 12px; justify-content: center; margin-bottom: 28px; flex-wrap: wrap; }
.breakdown-item { padding: 10px 18px; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 0.88rem; display: flex; flex-direction: column; gap: 4px; align-items: center; min-width: 90px; }
.breakdown-item span:first-child { color: var(--text-muted); font-size: 0.78rem; }
.breakdown-item span:last-child { font-weight: 700; color: var(--text-primary); }
.breakdown-item.good { border-color: #388e3c; background: #e8f5e9; }
.breakdown-item.retry { border-color: #f57c00; background: #fff3e0; }

.result-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
</style>
