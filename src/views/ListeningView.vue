<template>
  <div class="container page-content">
    <h1 class="section-title">🎧 聽力訓練</h1>
    <p class="section-subtitle">{{ currentConfig.flag }} {{ currentConfig.name }} · 提升聽力理解與反應能力</p>

    <div class="listening-intro card">
      <div class="intro-grid">
        <div class="intro-item">
          <span class="intro-icon">🔊</span>
          <h3>朗讀練習</h3>
          <p>點擊任何文字讓 AI 朗讀，跟著重複以提升口音</p>
        </div>
        <div class="intro-item">
          <span class="intro-icon">📻</span>
          <h3>廣播速度</h3>
          <p>選擇 0.7x ~ 1.2x 播放速度，從慢到快循序練習</p>
        </div>
        <div class="intro-item">
          <span class="intro-icon">📝</span>
          <h3>聽力題目</h3>
          <p>根據對話、演講、播報等不同場景回答問題</p>
        </div>
      </div>
    </div>

    <!-- 依程度聽力題庫（TTS 播放，不需金鑰） -->
    <BankPractice
      title="🎧 聽力題庫（依程度自動出題）"
      :kinds="listenKinds"
      skill="listening"
    />

    <!-- Sentence shadowing practice -->
    <div class="sentences-practice-section">
      <div class="sp-header">
        <h2 class="section-title" style="margin-bottom:4px">🗣️ 句子跟讀練習</h2>
        <button class="btn btn-ghost" @click="reloadSentences">🔄 換一批</button>
      </div>
      <p class="section-subtitle">點播放聽 AI 朗讀，跟著唸；點「顯示翻譯」對照理解</p>

      <div v-if="loadingSentences" class="sp-loading">句子載入中…</div>
      <div v-else class="sentence-cards">
        <div v-for="(s, i) in sentences" :key="i" class="sentence-card card">
          <p class="sentence-text">{{ s.text }}</p>
          <p v-if="revealed.has(i)" class="sentence-translation">{{ s.translation }}</p>
          <div class="sentence-actions">
            <button class="btn btn-primary sm" @click="speak(s.text, langStore.currentLanguage, spSpeed)">▶ 播放</button>
            <div class="speed-mini">
              <button v-for="sp in [0.7, 0.85, 1.0]" :key="sp" class="speed-chip" :class="{ active: spSpeed === sp }" @click="spSpeed = sp">{{ sp }}x</button>
            </div>
            <button class="btn btn-ghost sm" @click="toggleReveal(i)">{{ revealed.has(i) ? '隱藏翻譯' : '顯示翻譯' }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Listening exercises -->
    <div class="exercises-section">
      <div class="sp-header">
        <h2 class="section-title" style="margin-bottom:4px">聽力練習題</h2>
        <button class="btn btn-primary" :disabled="ai.loading.value" @click="genAiListening">
          {{ ai.loading.value ? '生成中…' : '✨ AI 依程度生成' }}
        </button>
      </div>
      <p v-if="ai.error.value" class="ai-error">⚠️ {{ ai.error.value }} <RouterLink to="/profile">前往設定金鑰</RouterLink></p>
      <div class="exercise-list">
        <div v-for="ex in currentExercises" :key="ex.id" class="exercise-card card">
          <div class="exercise-header">
            <div>
              <h3 class="exercise-title">{{ ex.title }}</h3>
              <div class="exercise-meta">
                <span class="badge" :class="`badge-${ex.difficulty}`">{{ diffLabel(ex.difficulty) }}</span>
                <span class="tag">{{ ex.source }}</span>
                <span v-if="ex.duration" class="tag">⏱ {{ ex.duration }}秒</span>
              </div>
            </div>
          </div>

          <div class="transcript-block" v-if="visibleTranscripts.has(ex.id)">
            <p class="transcript-label">📄 逐字稿</p>
            <div class="transcript-row">
              <button class="tts-play-btn" @click="playTranscript(ex)">
                {{ playingId === ex.id ? '⏸' : '▶' }} 播放
              </button>
              <div class="speed-controls">
                <button
                  v-for="speed in [0.7, 0.85, 1.0, 1.2]"
                  :key="speed"
                  class="speed-btn"
                  :class="{ active: playSpeed === speed }"
                  @click="playSpeed = speed"
                >{{ speed }}x</button>
              </div>
            </div>
            <p class="transcript-text">{{ ex.transcript }}</p>
          </div>

          <div class="exercise-actions">
            <button class="btn btn-primary" @click="openExercise(ex)">開始作答 →</button>
            <button class="btn btn-ghost" @click="toggleTranscript(ex.id)">
              {{ visibleTranscripts.has(ex.id) ? '隱藏逐字稿' : '顯示逐字稿' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Active quiz -->
    <Transition name="fade">
      <div v-if="activeExercise" class="active-exercise-overlay" @click.self="activeExercise = null">
        <div class="active-exercise-panel card">
          <button class="close-btn" @click="activeExercise = null">✕</button>
          <h3 class="panel-title">{{ activeExercise.title }}</h3>

          <div class="play-section">
            <button class="big-play-btn" @click="playTranscript(activeExercise)">
              {{ playingId === activeExercise.id ? '⏸ 暫停' : '▶ 播放聽力材料' }}
            </button>
            <div class="speed-controls">
              <button
                v-for="speed in [0.7, 0.85, 1.0, 1.2]"
                :key="speed"
                class="speed-btn"
                :class="{ active: playSpeed === speed }"
                @click="playSpeed = speed"
              >{{ speed }}x</button>
            </div>
            <p class="play-hint">建議先播放 2-3 次再作答</p>
          </div>

          <div class="exercise-questions">
            <QuizCard
              v-if="activeQuestionIdx < activeExercise.questions.length && activeExercise.questions[activeQuestionIdx] != null"
              :question="activeExercise.questions[activeQuestionIdx]!"
              :question-number="activeQuestionIdx + 1"
              :total-questions="activeExercise.questions.length"
              :is-last="activeQuestionIdx === activeExercise.questions.length - 1"
              @answer="() => {}"
              @next="activeQuestionIdx++"
            />
            <div v-else class="done-msg">
              <p>🎉 聽力練習完成！</p>
              <button class="btn btn-ghost" @click="activeExercise = null">關閉</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { useTextToSpeech } from '@/composables/useTextToSpeech'
import { listeningQuestions } from '@/data/quizzes'
import { DECKS } from '@/data/decks'
import { loadSentencePractice, type SentenceItem } from '@/data/sentencePractice'
import { useProgressStore } from '@/stores/progress'
import { useAI, hasApiKey } from '@/composables/useAI'
import { RouterLink } from 'vue-router'
import QuizCard from '@/components/quiz/QuizCard.vue'
import BankPractice from '@/components/quiz/BankPractice.vue'
import type { BankKind } from '@/data/questionBank'
import type { ListeningExercise, DifficultyLevel } from '@/types'

const listenKinds: BankKind[] = ['listen-word']

const langStore = useLanguageStore()
const progressStore = useProgressStore()
const ai = useAI()
const { speak, stop, isSpeaking } = useTextToSpeech()
const currentConfig = computed(() => langStore.currentConfig)

// 句子跟讀練習
const sentences = ref<SentenceItem[]>([])
const loadingSentences = ref(false)
const revealed = ref(new Set<number>())
const spSpeed = ref(0.85)

async function reloadSentences() {
  loadingSentences.value = true
  revealed.value = new Set()
  const deck = DECKS[langStore.currentLanguage]?.[0]
  sentences.value = deck ? await loadSentencePractice(langStore.currentLanguage, deck.id, 12) : []
  loadingSentences.value = false
}

function toggleReveal(i: number) {
  const s = new Set(revealed.value)
  if (s.has(i)) s.delete(i)
  else s.add(i)
  revealed.value = s
}

watch(() => langStore.currentLanguage, reloadSentences, { immediate: true })

const playSpeed = ref(1.0)
const playingId = ref<string | null>(null)
const visibleTranscripts = ref(new Set<string>())
const activeExercise = ref<ListeningExercise | null>(null)
const activeQuestionIdx = ref(0)

const exercises: ListeningExercise[] = [
  {
    id: 'le-en-001',
    title: 'Business Meeting Rescheduling',
    transcript: 'A: We need to reschedule the quarterly review. Can you check everyone\'s availability for next week? B: Sure, I see Tuesday afternoon is free for most people. How about 2 PM? A: That works for me. I\'ll send out the calendar invite. B: Great. Should I also prepare the agenda? A: Yes, please. Include the sales figures and the new marketing proposal.',
    language: 'en',
    difficulty: 'intermediate',
    questions: listeningQuestions,
    source: 'TOEIC Practice',
    duration: 45,
  },
  {
    id: 'le-en-002',
    title: 'News Broadcast: Technology Update',
    transcript: 'Good evening. In today\'s technology news, several major tech companies have announced new partnerships aimed at developing more sustainable artificial intelligence systems. The initiative, supported by researchers from twelve countries, aims to reduce the carbon footprint of large language models by 40% within the next three years. Experts say this could mark a turning point in how the industry approaches environmental responsibility.',
    language: 'en',
    difficulty: 'advanced',
    questions: listeningQuestions[0] ? [listeningQuestions[0]] : [],
    source: 'BBC News Style',
    duration: 60,
  },
  {
    id: 'le-ja-001',
    title: 'NHK ニュース：日本の祭り',
    transcript: '今日は日本の伝統的な夏祭りについてお伝えします。各地で花火大会や盆踊りが開催され、多くの人が浴衣を着て参加しています。観光客にとっても、日本文化を体験する絶好の機会となっています。',
    language: 'ja',
    difficulty: 'intermediate',
    questions: [
      {
        id: 'le-ja-001-q1',
        type: 'multiple-choice',
        skill: 'listening',
        language: 'ja',
        question: 'このニュースの内容と合っているものはどれですか。',
        options: [
          '多くの人が浴衣を着て夏祭りに参加している',
          '今年の花火大会は中止になった',
          '外国人は祭りに参加できない',
          '盆踊りは冬に行われる',
        ],
        correctAnswer: '多くの人が浴衣を着て夏祭りに参加している',
        explanation: '「多くの人が浴衣を着て参加しています」と述べられています。',
        difficulty: 'intermediate',
        examType: 'JLPT_N3',
      },
    ],
    source: 'NHK Web Easy',
    duration: 30,
  },
  {
    id: 'le-ja-002',
    title: '会話：レストランの予約',
    transcript: 'A：はい、レストラン花です。B：あのう、明日の夜7時に4人で予約をお願いしたいんですが。A：申し訳ございません。明日の7時は満席でして、8時からでしたらご案内できます。B：じゃあ、8時でお願いします。A：かしこまりました。お名前をお願いいたします。',
    language: 'ja',
    difficulty: 'beginner',
    questions: [
      {
        id: 'le-ja-002-q1',
        type: 'multiple-choice',
        skill: 'listening',
        language: 'ja',
        question: '予約は何時になりましたか。',
        options: ['8時', '7時', '6時', '9時'],
        correctAnswer: '8時',
        explanation: '7時は満席だったため、「じゃあ、8時でお願いします」と8時に予約しました。',
        difficulty: 'beginner',
        examType: 'JLPT_N4',
      },
    ],
    source: 'JLPT Practice',
    duration: 30,
  },
  {
    id: 'le-ko-001',
    title: 'KBS 뉴스: 한국 문화',
    transcript: '안녕하세요. 오늘 뉴스입니다. 최근 한국 드라마와 K-팝이 전 세계적으로 큰 인기를 얻고 있습니다. 이로 인해 한국어를 배우는 외국인도 크게 늘고 있습니다. 전문가들은 이를 한류의 새로운 물결이라고 평가하고 있습니다.',
    language: 'ko',
    difficulty: 'intermediate',
    questions: [
      {
        id: 'le-ko-001-q1',
        type: 'multiple-choice',
        skill: 'listening',
        language: 'ko',
        question: '이 뉴스의 중심 내용은 무엇입니까?',
        options: [
          '한류의 인기로 한국어를 배우는 외국인이 늘고 있다',
          '한국 드라마 제작비가 올랐다',
          '외국 영화가 한국에서 인기가 많다',
          'K-팝 콘서트 표가 비싸졌다',
        ],
        correctAnswer: '한류의 인기로 한국어를 배우는 외국인이 늘고 있다',
        explanation: '"한국어를 배우는 외국인도 크게 늘고 있습니다"가 핵심 내용입니다.',
        difficulty: 'intermediate',
        examType: 'TOPIK_II',
      },
    ],
    source: 'KBS World',
    duration: 35,
  },
  {
    id: 'le-ko-002',
    title: '대화: 카페에서 주문하기',
    transcript: '직원: 어서 오세요. 주문하시겠어요? 손님: 아이스 아메리카노 한 잔하고 치즈케이크 하나 주세요. 직원: 매장에서 드시고 가세요? 손님: 아니요, 포장해 주세요. 직원: 네, 모두 만 이천 원입니다.',
    language: 'ko',
    difficulty: 'beginner',
    questions: [
      {
        id: 'le-ko-002-q1',
        type: 'multiple-choice',
        skill: 'listening',
        language: 'ko',
        question: '손님은 어떻게 주문했습니까?',
        options: ['포장 주문을 했다', '매장에서 먹기로 했다', '주문을 취소했다', '커피만 주문했다'],
        correctAnswer: '포장 주문을 했다',
        explanation: '"아니요, 포장해 주세요"라고 말했으므로 포장 주문입니다.',
        difficulty: 'beginner',
        examType: 'TOPIK_I',
      },
    ],
    source: 'TOPIK Practice',
    duration: 25,
  },
  {
    id: 'le-zh-001',
    title: '新聞：週末天氣預報',
    transcript: '各位聽眾朋友大家好，現在為您播報天氣。本週末全國大部分地區天氣晴朗，氣溫在二十五到三十度之間，非常適合戶外活動。不過南部沿海地區週日下午可能出現雷陣雨，提醒外出的朋友記得攜帶雨具。',
    language: 'zh',
    difficulty: 'beginner',
    questions: [
      {
        id: 'le-zh-001-q1',
        type: 'multiple-choice',
        skill: 'listening',
        language: 'zh',
        question: '根據天氣預報，哪個地區週日可能下雨？',
        options: ['南部沿海地區', '北部山區', '西部高原', '中部平原'],
        correctAnswer: '南部沿海地區',
        explanation: '預報提到「南部沿海地區週日下午可能出現雷陣雨」。',
        difficulty: 'beginner',
        examType: 'HSK3',
      },
    ],
    source: 'CRI Online',
    duration: 30,
  },
  {
    id: 'le-zh-002',
    title: '對話：面試安排',
    transcript: '人事：您好，這裡是大同公司人事部。想跟您確認明天上午十點的面試時間，您方便嗎？應徵者：不好意思，明天上午我有事，可以改到下午嗎？人事：可以的，那改到下午兩點，地點在公司三樓會議室。應徵者：好的，謝謝您，明天見。',
    language: 'zh',
    difficulty: 'intermediate',
    questions: [
      {
        id: 'le-zh-002-q1',
        type: 'multiple-choice',
        skill: 'listening',
        language: 'zh',
        question: '面試最後改到什麼時間？',
        options: ['明天下午兩點', '明天上午十點', '今天下午兩點', '後天上午十點'],
        correctAnswer: '明天下午兩點',
        explanation: '應徵者上午有事，人事說「那改到下午兩點」。',
        difficulty: 'intermediate',
        examType: 'HSK4',
      },
    ],
    source: 'HSK Practice',
    duration: 35,
  },
]

const aiExercises = ref<ListeningExercise[]>([])
const currentExercises = computed(() =>
  [...aiExercises.value, ...exercises].filter((e) => e.language === langStore.currentLanguage),
)

function levelToDifficulty(pct: number): DifficultyLevel {
  if (pct < 34) return 'beginner'
  if (pct < 67) return 'intermediate'
  return 'advanced'
}

async function genAiListening() {
  if (!hasApiKey()) { ai.error.value = '尚未設定 Gemini API 金鑰'; return }
  const lang = langStore.currentLanguage
  const diff = levelToDifficulty(progressStore.getProgress(lang).skillLevels.listening)
  try {
    const r = await ai.generateListening(lang, diff)
    const id = `ai-le-${Date.now()}`
    aiExercises.value.unshift({
      id, title: r.title, transcript: r.transcript, language: lang, difficulty: diff,
      source: 'AI 生成', duration: Math.max(20, Math.round(r.transcript.length / 5)),
      questions: r.questions.map((q, i) => ({
        id: `${id}-q${i}`, type: 'multiple-choice', skill: 'listening', language: lang,
        question: q.question, options: q.options, correctAnswer: q.correctAnswer,
        explanation: q.explanation, difficulty: diff,
      })),
    })
  } catch { /* ai.error shown */ }
}

function diffLabel(d: string) {
  return { beginner: '初級', intermediate: '中級', advanced: '高級' }[d] ?? d
}

function toggleTranscript(id: string) {
  if (visibleTranscripts.value.has(id)) visibleTranscripts.value.delete(id)
  else visibleTranscripts.value.add(id)
}

function playTranscript(ex: ListeningExercise) {
  if (playingId.value === ex.id && isSpeaking.value) {
    stop()
    playingId.value = null
  } else {
    playingId.value = ex.id
    speak(ex.transcript, ex.language, playSpeed.value)
    setTimeout(() => { playingId.value = null }, ex.transcript.length * 60)
  }
}

function openExercise(ex: ListeningExercise) {
  activeExercise.value = ex
  activeQuestionIdx.value = 0
}
</script>

<style scoped>
.listening-intro { padding: 24px; margin-bottom: 32px; }

.sentences-practice-section { margin-bottom: 40px; }
.sp-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.sp-loading { text-align: center; padding: 30px; color: var(--text-muted); }
.ai-error { font-size: 0.85rem; color: #c62828; margin-bottom: 16px; }
.ai-error a { color: var(--accent); font-weight: 700; }
.sentence-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; margin-top: 16px; }
.sentence-card { padding: 16px 18px; }
.sentence-text { font-size: 1rem; color: var(--text-primary); line-height: 1.6; margin-bottom: 6px; }
.sentence-translation { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 10px; padding: 8px 10px; background: var(--bg-secondary); border-radius: var(--radius-sm); }
.sentence-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
.sentence-actions .sm { padding: 6px 14px; font-size: 0.82rem; }
.speed-mini { display: flex; gap: 4px; }
.speed-mini .speed-chip { padding: 3px 8px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-card); font-size: 0.72rem; cursor: pointer; }
.speed-mini .speed-chip.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.intro-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; }
.intro-item { text-align: center; }
.intro-icon { font-size: 2rem; display: block; margin-bottom: 8px; }
.intro-item h3 { font-size: 1rem; margin-bottom: 6px; }
.intro-item p { font-size: 0.83rem; color: var(--text-muted); line-height: 1.5; }

.exercises-section { margin-bottom: 40px; }
.exercise-list { display: flex; flex-direction: column; gap: 16px; }
.exercise-card { padding: 20px; }
.exercise-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
.exercise-title { font-size: 1.05rem; margin-bottom: 8px; }
.exercise-meta { display: flex; gap: 8px; flex-wrap: wrap; }

.transcript-block { background: var(--bg-secondary); border-radius: var(--radius-sm); padding: 14px 16px; margin-bottom: 16px; }
.transcript-label { font-size: 0.78rem; font-weight: 700; color: var(--text-muted); margin-bottom: 10px; }
.transcript-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; flex-wrap: wrap; }
.tts-play-btn { padding: 6px 16px; border-radius: var(--radius-sm); background: var(--accent); color: #fff; font-size: 0.85rem; font-weight: 700; cursor: pointer; }
.speed-controls { display: flex; gap: 4px; }
.speed-btn { padding: 4px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-card); font-size: 0.78rem; cursor: pointer; transition: all 0.15s; }
.speed-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.transcript-text { font-size: 0.9rem; color: var(--text-primary); line-height: 1.7; }

.exercise-actions { display: flex; gap: 10px; flex-wrap: wrap; }

.active-exercise-overlay {
  position: fixed; inset: 0; background: rgba(74,44,23,0.4); z-index: 200;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.active-exercise-panel { width: 100%; max-width: 680px; max-height: 90vh; overflow-y: auto; padding: 28px; position: relative; }
.close-btn { position: absolute; top: 16px; right: 16px; background: var(--bg-secondary); border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 0.9rem; }
.panel-title { font-size: 1.3rem; margin-bottom: 20px; padding-right: 40px; }
.play-section { background: rgba(168,197,218,0.15); border-radius: var(--radius-sm); padding: 16px; margin-bottom: 24px; text-align: center; }
.big-play-btn { padding: 12px 32px; background: var(--accent); color: #fff; border-radius: var(--radius-md); font-size: 1rem; font-weight: 700; cursor: pointer; margin-bottom: 12px; }
.play-hint { font-size: 0.78rem; color: var(--text-muted); margin-top: 8px; }
.done-msg { text-align: center; padding: 32px; }
.done-msg p { font-size: 1.1rem; margin-bottom: 16px; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
