<template>
  <div class="quiz-card card">
    <div class="quiz-header">
      <div class="quiz-meta">
        <span class="badge badge-exam">{{ question.examType ?? question.skill }}</span>
        <span class="badge" :class="`badge-${question.difficulty}`">{{ diffLabel }}</span>
        <span class="skill-badge">{{ skillLabel }}</span>
      </div>
      <div class="question-number">{{ questionNumber }} / {{ totalQuestions }}</div>
    </div>

    <div class="quiz-body">
      <!-- Passage for reading comprehension -->
      <div v-if="question.passage" class="passage-block">
        <p class="passage-label">📄 閱讀段落</p>
        <div class="passage-text">{{ question.passage }}</div>
      </div>

      <!-- Audio for listening -->
      <div v-if="question.skill === 'listening'" class="listening-block">
        <p class="listening-label">🎧 聽力材料</p>
        <button class="btn btn-primary audio-play-btn" @click="playListening" :disabled="!question.passage">
          {{ isPlaying ? '⏸ 暫停' : '▶ 播放' }}
        </button>
        <p class="listening-hint">點擊播放後回答問題</p>
      </div>

      <p class="question-text">{{ question.question }}</p>

      <!-- Multiple choice options -->
      <div v-if="question.type === 'multiple-choice'" class="options-list">
        <button
          v-for="(opt, i) in question.options"
          :key="i"
          class="option-btn"
          :class="getOptionClass(opt)"
          :disabled="answered"
          @click="selectAnswer(opt)"
        >
          <span class="option-letter">{{ String.fromCharCode(65 + i) }}</span>
          <span class="option-text">{{ opt }}</span>
          <span v-if="answered && opt === question.correctAnswer" class="option-correct">✓</span>
          <span v-else-if="answered && opt === selectedAnswer && opt !== question.correctAnswer" class="option-wrong">✗</span>
        </button>
      </div>

      <!-- Fill in the blank -->
      <div v-else-if="question.type === 'fill-blank'" class="fill-blank">
        <input
          v-model="textAnswer"
          class="fill-input"
          placeholder="輸入答案..."
          :disabled="answered"
          @keyup.enter="submitText"
        />
        <button class="btn btn-primary" :disabled="answered || !textAnswer" @click="submitText">
          確認
        </button>
      </div>
    </div>

    <!-- Explanation -->
    <Transition name="slide-down">
      <div v-if="answered" class="explanation-block" :class="isCorrect ? 'correct' : 'incorrect'">
        <div class="explanation-header">
          <span class="explanation-icon">{{ isCorrect ? '🎉' : '💡' }}</span>
          <span class="explanation-title">{{ isCorrect ? '答對了！' : '再接再厲！' }}</span>
        </div>
        <p class="explanation-text">{{ question.explanation }}</p>
        <p v-if="!isCorrect" class="correct-answer-text">
          正確答案：<strong>{{ Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer }}</strong>
        </p>
      </div>
    </Transition>

    <div v-if="answered" class="quiz-footer">
      <button class="btn btn-primary next-btn" @click="$emit('next')">
        {{ isLast ? '完成測驗 🎊' : '下一題 →' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTextToSpeech } from '@/composables/useTextToSpeech'
import type { QuizQuestion } from '@/types'

const props = defineProps<{
  question: QuizQuestion
  questionNumber: number
  totalQuestions: number
  isLast?: boolean
}>()

const emit = defineEmits<{
  answer: [correct: boolean]
  next: []
}>()

const { speak } = useTextToSpeech()

const selectedAnswer = ref<string | null>(null)
const textAnswer = ref('')
const answered = ref(false)
const isCorrect = ref(false)
const isPlaying = ref(false)

const diffLabel = computed(() => ({ beginner: '初級', intermediate: '中級', advanced: '高級' }[props.question.difficulty] ?? props.question.difficulty))
const skillLabel = computed(() => {
  const map: Record<string, string> = { listening: '聽力', reading: '閱讀', writing: '寫作', speaking: '口說', vocabulary: '單字', grammar: '文法' }
  return map[props.question.skill] ?? props.question.skill
})

function getOptionClass(opt: string) {
  if (!answered.value) return selectedAnswer.value === opt ? 'selected' : ''
  if (opt === props.question.correctAnswer) return 'correct'
  if (opt === selectedAnswer.value) return 'incorrect'
  return ''
}

function selectAnswer(opt: string) {
  if (answered.value) return
  selectedAnswer.value = opt
  answered.value = true
  isCorrect.value = opt === props.question.correctAnswer
  emit('answer', isCorrect.value)
}

function submitText() {
  if (!textAnswer.value || answered.value) return
  answered.value = true
  const correct = Array.isArray(props.question.correctAnswer)
    ? props.question.correctAnswer.includes(textAnswer.value.trim())
    : textAnswer.value.trim().toLowerCase() === String(props.question.correctAnswer).toLowerCase()
  isCorrect.value = correct
  selectedAnswer.value = textAnswer.value
  emit('answer', isCorrect.value)
}

function playListening() {
  if (props.question.passage) {
    isPlaying.value = true
    speak(props.question.passage, props.question.language, 0.8)
    setTimeout(() => { isPlaying.value = false }, 5000)
  }
}
</script>

<style scoped>
.quiz-card { overflow: visible; }

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  gap: 12px;
  flex-wrap: wrap;
}
.quiz-meta { display: flex; gap: 8px; flex-wrap: wrap; }
.skill-badge { font-size: 0.78rem; color: var(--text-muted); font-weight: 700; }
.question-number { font-size: 0.85rem; font-weight: 700; color: var(--text-muted); }

.quiz-body { padding: 20px; }

.passage-block {
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  margin-bottom: 16px;
  border-left: 3px solid var(--accent);
}
.passage-label { font-size: 0.78rem; font-weight: 700; color: var(--accent); margin-bottom: 8px; }
.passage-text { font-size: 0.9rem; color: var(--text-primary); line-height: 1.7; }

.listening-block {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(168, 197, 218, 0.15);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.listening-label { font-size: 0.88rem; font-weight: 700; color: var(--color-sky); }
.audio-play-btn { font-size: 0.85rem; padding: 8px 16px; }
.listening-hint { font-size: 0.78rem; color: var(--text-muted); }

.question-text {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
  line-height: 1.5;
}

.options-list { display: flex; flex-direction: column; gap: 10px; }
.option-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.9rem;
  text-align: left;
  transition: all 0.15s;
  width: 100%;
}
.option-btn:not(:disabled):hover { border-color: var(--accent); background: rgba(200, 151, 58, 0.05); }
.option-btn.selected { border-color: var(--accent); background: rgba(200, 151, 58, 0.08); }
.option-btn.correct { border-color: #388e3c; background: #e8f5e9; color: #2e7d32; }
.option-btn.incorrect { border-color: #c62828; background: #fce4ec; color: #c62828; }
.option-btn:disabled { cursor: default; }
.option-letter { width: 24px; height: 24px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; }
.option-text { flex: 1; }
.option-correct, .option-wrong { font-weight: 700; flex-shrink: 0; }

.fill-blank { display: flex; gap: 10px; }
.fill-input { flex: 1; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 0.95rem; background: var(--bg-card); color: var(--text-primary); outline: none; transition: border-color 0.15s; }
.fill-input:focus { border-color: var(--accent); }

.explanation-block {
  margin: 0 20px 0;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  margin-bottom: 16px;
}
.explanation-block.correct { background: #e8f5e9; border-left: 3px solid #388e3c; }
.explanation-block.incorrect { background: #fff3e0; border-left: 3px solid #f57c00; }
.explanation-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.explanation-title { font-weight: 700; font-size: 0.95rem; }
.explanation-text { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; }
.correct-answer-text { font-size: 0.88rem; margin-top: 8px; color: var(--text-secondary); }

.quiz-footer { padding: 0 20px 20px; display: flex; justify-content: flex-end; }
.next-btn { padding: 10px 24px; }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from { opacity: 0; transform: translateY(-10px); }
.slide-down-leave-to { opacity: 0; }
</style>
