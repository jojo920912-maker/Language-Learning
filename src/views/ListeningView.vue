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

    <!-- Listening exercises -->
    <div class="exercises-section">
      <h2 class="section-title" style="margin-bottom:20px">聽力練習題</h2>
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
import { ref, computed } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { useTextToSpeech } from '@/composables/useTextToSpeech'
import { listeningQuestions } from '@/data/quizzes'
import QuizCard from '@/components/quiz/QuizCard.vue'
import type { ListeningExercise } from '@/types'

const langStore = useLanguageStore()
const { speak, stop, isSpeaking } = useTextToSpeech()
const currentConfig = computed(() => langStore.currentConfig)

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
    questions: [],
    source: 'NHK Web Easy',
    duration: 30,
  },
  {
    id: 'le-ko-001',
    title: 'KBS 뉴스: 한국 문화',
    transcript: '안녕하세요. 오늘 뉴스입니다. 최근 한국 드라마와 K-팝이 전 세계적으로 큰 인기를 얻고 있습니다. 이로 인해 한국어를 배우는 외국인도 크게 늘고 있습니다. 전문가들은 이를 한류의 새로운 물결이라고 평가하고 있습니다.',
    language: 'ko',
    difficulty: 'intermediate',
    questions: [],
    source: 'KBS World',
    duration: 35,
  },
]

const currentExercises = computed(() => exercises.filter((e) => e.language === langStore.currentLanguage))

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
