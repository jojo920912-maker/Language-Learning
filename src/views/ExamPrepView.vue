<template>
  <div class="container page-content">
    <h1 class="section-title">🎯 考試準備專區</h1>
    <p class="section-subtitle">針對各大語言考試的專屬練習，提升應試能力</p>

    <!-- Language tabs -->
    <div class="lang-tabs">
      <button
        v-for="lang in languages"
        :key="lang.code"
        class="lang-tab"
        :class="{ active: selectedLang === lang.code }"
        @click="selectLang(lang.code)"
      >
        {{ lang.flag }} {{ lang.name }}
      </button>
    </div>

    <!-- Exam cards for selected language -->
    <div class="exam-grid" v-if="currentExams.length">
      <div
        v-for="exam in currentExams"
        :key="exam.type"
        class="exam-card card"
        :class="{ selected: selectedExam === exam.type }"
        @click="selectExam(exam.type)"
      >
        <div class="exam-card-header">
          <span class="exam-icon">{{ exam.icon }}</span>
          <div>
            <h3 class="exam-name">{{ EXAM_LABELS[exam.type] }}</h3>
            <p class="exam-level">{{ exam.levelDesc }}</p>
          </div>
          <span v-if="selectedExam === exam.type" class="selected-check">✓</span>
        </div>
        <p class="exam-desc">{{ exam.description }}</p>
        <div class="exam-sections">
          <span v-for="section in exam.sections" :key="section" class="tag">{{ section }}</span>
        </div>
        <div class="exam-info">
          <span>⏱ {{ exam.duration }}</span>
          <span>📊 {{ exam.score }}</span>
        </div>
      </div>
    </div>

    <!-- Practice section -->
    <div v-if="selectedExam && !quizStarted" class="practice-section">
      <div class="practice-header">
        <h2 class="section-title">{{ EXAM_LABELS[selectedExam] }} 練習題</h2>
        <p class="section-subtitle">選擇題型開始練習</p>
      </div>

      <div class="skill-tabs">
        <button
          v-for="skill in skillOptions"
          :key="skill.value"
          class="skill-tab"
          :class="{ active: selectedSkill === skill.value }"
          @click="selectedSkill = skill.value"
        >
          {{ skill.icon }} {{ skill.label }}
        </button>
      </div>

      <div class="strategy-card card" v-if="examStrategy">
        <h3 class="strategy-title">📚 考試攻略</h3>
        <ul class="strategy-list">
          <li v-for="tip in examStrategy" :key="tip">{{ tip }}</li>
        </ul>
      </div>

      <button class="btn btn-primary start-practice-btn" @click="startPractice">
        開始練習 🚀
      </button>
    </div>

    <!-- Quiz -->
    <div v-else-if="quizStarted && !quizCompleted" class="quiz-section">
      <div class="quiz-progress-bar">
        <div class="quiz-progress-fill" :style="{ width: (currentIdx / practiceQuestions.length * 100) + '%' }" />
      </div>
      <div class="quiz-wrapper">
        <QuizCard
          v-if="practiceQuestions[currentIdx] != null"
          :question="practiceQuestions[currentIdx]!"
          :question-number="currentIdx + 1"
          :total-questions="practiceQuestions.length"
          :is-last="currentIdx === practiceQuestions.length - 1"
          @answer="onAnswer"
          @next="nextQ"
        />
      </div>
    </div>

    <!-- Result -->
    <div v-else-if="quizCompleted" class="result-panel card">
      <div class="result-emoji">{{ scoreEmoji }}</div>
      <h2>{{ EXAM_LABELS[selectedExam!] }} 練習結果</h2>
      <p class="result-score">{{ correctCount }} / {{ practiceQuestions.length }} · {{ scorePct }}%</p>
      <div class="result-actions">
        <button class="btn btn-primary" @click="restartPractice">再練一次</button>
        <button class="btn btn-ghost" @click="quizCompleted = false; quizStarted = false">返回題型選擇</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { LANGUAGES, EXAM_LABELS } from '@/data/languages'
import { dailyQuizzes } from '@/data/quizzes'
import QuizCard from '@/components/quiz/QuizCard.vue'
import type { Language, ExamType } from '@/types'

const langStore = useLanguageStore()
const languages = LANGUAGES

const selectedLang = ref<Language>(langStore.currentLanguage)
const selectedExam = ref<ExamType | null>(null)
const selectedSkill = ref('all')
const quizStarted = ref(false)
const quizCompleted = ref(false)
const currentIdx = ref(0)
const correctCount = ref(0)
const practiceQuestions = ref(dailyQuizzes.slice(0, 5))

const skillOptions = [
  { value: 'all', icon: '🌟', label: '綜合' },
  { value: 'vocabulary', icon: '📖', label: '單字' },
  { value: 'reading', icon: '📰', label: '閱讀' },
  { value: 'listening', icon: '🎧', label: '聽力' },
  { value: 'grammar', icon: '🔤', label: '文法' },
]

interface ExamInfo {
  type: ExamType
  icon: string
  levelDesc: string
  description: string
  sections: string[]
  duration: string
  score: string
  language: Language
}

const examInfos: ExamInfo[] = [
  { type: 'TOEIC', icon: '🏢', levelDesc: '職場英語', description: '測量在職場環境中使用英語溝通的能力，廣受企業採用', sections: ['聽力', '閱讀'], duration: '120 分鐘', score: '10-990 分', language: 'en' },
  { type: 'TOEFL', icon: '🎓', levelDesc: '學術英語', description: '美國大學入學必備，測量學術英語聽說讀寫全方位能力', sections: ['閱讀', '聽力', '口說', '寫作'], duration: '~3 小時', score: '0-120 分', language: 'en' },
  { type: 'IELTS', icon: '🌐', levelDesc: '國際英語', description: '英聯邦國家留學移民必備，分學術與一般培訓兩版本', sections: ['聽力', '閱讀', '寫作', '口說'], duration: '~2.75 小時', score: '1-9 分', language: 'en' },
  { type: 'JLPT_N5', icon: '🌸', levelDesc: 'JLPT N5', description: '日語能力測驗最基礎等級，掌握基本日語單字和句型', sections: ['文字語彙', '文法閱讀', '聽解'], duration: '105 分鐘', score: '0-180 分', language: 'ja' },
  { type: 'JLPT_N4', icon: '🌸', levelDesc: 'JLPT N4', description: '能理解日常生活中使用的基礎日語', sections: ['文字語彙', '文法閱讀', '聽解'], duration: '125 分鐘', score: '0-180 分', language: 'ja' },
  { type: 'JLPT_N3', icon: '🌸', levelDesc: 'JLPT N3', description: '能理解日常生活中的日語，程度介於 N4 和 N2 之間', sections: ['文字語彙', '文法閱讀', '聽解'], duration: '140 分鐘', score: '0-180 分', language: 'ja' },
  { type: 'JLPT_N2', icon: '🌸', levelDesc: 'JLPT N2', description: '除日常生活場景外，也能理解較廣泛場合的日語', sections: ['文字語彙', '文法閱讀', '聽解'], duration: '155 分鐘', score: '0-180 分', language: 'ja' },
  { type: 'JLPT_N1', icon: '🌸', levelDesc: 'JLPT N1', description: '能理解廣泛場合中使用的日語，為最高等級', sections: ['文字語彙', '文法閱讀', '聽解'], duration: '170 分鐘', score: '0-180 分', language: 'ja' },
  { type: 'TOPIK_I', icon: '🇰🇷', levelDesc: 'TOPIK I', description: '韓語能力考試初級，對應 1-2 級', sections: ['聽力', '閱讀'], duration: '100 分鐘', score: '0-200 分', language: 'ko' },
  { type: 'TOPIK_II', icon: '🇰🇷', levelDesc: 'TOPIK II', description: '韓語能力考試中高級，對應 3-6 級', sections: ['聽力', '閱讀', '寫作'], duration: '180 分鐘', score: '0-300 分', language: 'ko' },
  { type: 'DELF_B1', icon: '🇫🇷', levelDesc: 'DELF B1', description: '法語獨立使用者，能理解日常生活相關主題', sections: ['聽力', '閱讀', '寫作', '口說'], duration: '~1.7 小時', score: '0-100 分', language: 'fr' },
  { type: 'DELE_B1', icon: '🇪🇸', levelDesc: 'DELE B1', description: '西班牙語能力認證 B1 中級', sections: ['閱讀', '聽力', '寫作', '口說'], duration: '~3 小時', score: '合格/不合格', language: 'es' },
  { type: 'GOETHE_B1', icon: '🇩🇪', levelDesc: 'Goethe B1', description: '德語 B1 證書，能在德語環境中獨立生活', sections: ['閱讀', '聽力', '寫作', '口說'], duration: '~3.25 小時', score: '0-100 分', language: 'de' },
  { type: 'HSK3', icon: '🇨🇳', levelDesc: 'HSK 3級', description: '漢語水平考試 3 級，能用漢語進行一般性交流', sections: ['聽力', '閱讀', '書寫'], duration: '85 分鐘', score: '0-300 分', language: 'zh' },
]

const currentExams = computed(() => examInfos.filter((e) => e.language === selectedLang.value))

const examStrategies: Partial<Record<ExamType, string[]>> = {
  TOEIC: ['先練習填答技巧，時間管理非常重要', '聽力部分注意說話者的情緒和語調', '多益商業詞彙要優先記憶', '閱讀部分先看問題再讀文章'],
  TOEFL: ['學術詞彙（Academic Word List）是核心', '口說練習使用 PREP 結構：Point, Reason, Example, Point', '整合性寫作需要同時聽和讀', '考場可以使用記事板記筆記'],
  JLPT_N3: ['每天記 30 個新詞彙', '多練習 N3 文法句型和接續用法', '聽力題目只播一次，需集中注意力', '多讀日文新聞如 NHK Web Easy'],
  TOPIK_II: ['掌握連接詞和文章邏輯連貫性', '寫作部分要使用正式體（합쇼체）', '聽力題目類型要事先熟悉', '多讀韓文新聞擴展詞彙量'],
}

const examStrategy = computed(() => selectedExam.value ? examStrategies[selectedExam.value] : null)

const scorePct = computed(() => Math.round((correctCount.value / practiceQuestions.value.length) * 100))
const scoreEmoji = computed(() => {
  if (scorePct.value >= 90) return '🏆'
  if (scorePct.value >= 70) return '🎉'
  if (scorePct.value >= 50) return '💪'
  return '📚'
})

function selectLang(lang: Language) {
  selectedLang.value = lang
  selectedExam.value = null
  langStore.setLanguage(lang)
  quizStarted.value = false
  quizCompleted.value = false
}

function selectExam(exam: ExamType) {
  selectedExam.value = exam
  quizStarted.value = false
  quizCompleted.value = false
}

function startPractice() {
  let questions = dailyQuizzes.filter((q) => q.language === selectedLang.value)
  if (selectedSkill.value !== 'all') questions = questions.filter((q) => q.skill === selectedSkill.value)
  practiceQuestions.value = questions.length ? questions : dailyQuizzes.filter((q) => q.language === selectedLang.value).slice(0, 5)
  if (!practiceQuestions.value.length) practiceQuestions.value = dailyQuizzes.slice(0, 5)
  currentIdx.value = 0
  correctCount.value = 0
  quizStarted.value = true
  quizCompleted.value = false
}

function onAnswer(correct: boolean) { if (correct) correctCount.value++ }

function nextQ() {
  if (currentIdx.value < practiceQuestions.value.length - 1) currentIdx.value++
  else quizCompleted.value = true
}

function restartPractice() {
  currentIdx.value = 0
  correctCount.value = 0
  quizCompleted.value = false
  quizStarted.value = false
}
</script>

<style scoped>
.lang-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
.lang-tab { padding: 7px 16px; border-radius: 20px; border: 1.5px solid var(--border); background: var(--bg-card); color: var(--text-secondary); font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.15s; }
.lang-tab:hover, .lang-tab.active { border-color: var(--accent); background: rgba(200,151,58,0.1); color: var(--accent); }

.exam-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 32px; }
.exam-card { padding: 18px; cursor: pointer; transition: all 0.2s; border: 2px solid var(--border); }
.exam-card:hover { border-color: var(--accent); transform: translateY(-2px); }
.exam-card.selected { border-color: var(--accent); background: rgba(200,151,58,0.05); }
.exam-card-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
.exam-icon { font-size: 1.8rem; }
.exam-name { font-size: 1.1rem; font-weight: 600; }
.exam-level { font-size: 0.78rem; color: var(--text-muted); }
.selected-check { margin-left: auto; color: var(--accent); font-weight: 700; font-size: 1.2rem; }
.exam-desc { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 10px; line-height: 1.5; }
.exam-sections { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.exam-info { display: flex; gap: 12px; font-size: 0.8rem; color: var(--text-muted); }

.practice-section { margin-top: 8px; }
.skill-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
.skill-tab { padding: 7px 16px; border-radius: 20px; border: 1.5px solid var(--border); background: var(--bg-card); color: var(--text-secondary); font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.15s; }
.skill-tab.active { border-color: var(--accent); background: rgba(200,151,58,0.1); color: var(--accent); }

.strategy-card { padding: 20px; margin-bottom: 20px; background: linear-gradient(135deg, rgba(200,151,58,0.06), rgba(184,169,201,0.06)); }
.strategy-title { font-size: 1rem; margin-bottom: 12px; }
.strategy-list { padding-left: 18px; display: flex; flex-direction: column; gap: 8px; }
.strategy-list li { font-size: 0.88rem; color: var(--text-secondary); }

.start-practice-btn { width: 100%; max-width: 300px; justify-content: center; padding: 14px; font-size: 1rem; }

.quiz-section { max-width: 680px; }
.quiz-progress-bar { height: 4px; background: var(--color-latte); border-radius: 2px; margin-bottom: 24px; overflow: hidden; }
.quiz-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--color-cinnamon)); transition: width 0.5s; }

.result-panel { max-width: 480px; padding: 40px; text-align: center; }
.result-emoji { font-size: 4rem; margin-bottom: 12px; }
.result-panel h2 { margin-bottom: 8px; }
.result-score { font-size: 1.3rem; color: var(--accent); font-weight: 700; margin-bottom: 28px; }
.result-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

@media (max-width: 600px) { .exam-grid { grid-template-columns: 1fr; } }
</style>
