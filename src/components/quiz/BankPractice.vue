<template>
  <div class="bank-practice">
    <!-- 未開始 -->
    <div v-if="state === 'idle'" class="bp-intro card">
      <div class="bp-intro-text">
        <h3 class="bp-title">{{ title }}</h3>
        <p class="bp-desc">
          依你的{{ skillZh }}程度（目前：{{ diffZh }}）出題，本批 {{ batchSize.toLocaleString() }} 題，可隨時提前結算。
          <span v-if="total !== null">題庫共 {{ total.toLocaleString() }} 題。</span>
        </p>
      </div>
      <button class="btn btn-primary" :disabled="loading" @click="start">
        {{ loading ? '出題中…' : '開始練習 🚀' }}
      </button>
    </div>

    <!-- 進行中 -->
    <div v-else-if="state === 'running'">
      <div class="bp-bar">
        <span>難度{{ diffZh }} · 已答 {{ answered }} / {{ questions.length }} · 答對 {{ correct }}</span>
        <button class="btn btn-ghost bp-finish" @click="finish">提前結算</button>
      </div>
      <QuizCard
        v-if="questions[idx]"
        :key="questions[idx]!.id"
        :question="questions[idx]!"
        :question-number="idx + 1"
        :total-questions="questions.length"
        :is-last="idx === questions.length - 1"
        @answer="onAnswer"
        @next="next"
      />
    </div>

    <!-- 結算 -->
    <div v-else class="bp-result card">
      <p class="bp-result-emoji">{{ pct >= 70 ? '🎉' : '💪' }}</p>
      <p class="bp-result-text">答了 {{ answered }} 題，答對 {{ correct }} 題（{{ pct }}%），獲得 {{ pct }} 點</p>
      <div class="bp-result-actions">
        <button class="btn btn-primary" @click="start">再來一批 🔄</button>
        <button class="btn btn-ghost" @click="state = 'idle'">返回</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { useProgressStore } from '@/stores/progress'
import { generateBatch, bankTotal, batchSizeFor, levelFromSkill, type BankKind } from '@/data/questionBank'
import QuizCard from '@/components/quiz/QuizCard.vue'
import type { QuizQuestion, SkillType } from '@/types'

const props = defineProps<{
  title: string
  kinds: BankKind[]
  skill: SkillType
}>()

const langStore = useLanguageStore()
const progressStore = useProgressStore()

const state = ref<'idle' | 'running' | 'done'>('idle')
const loading = ref(false)
const questions = ref<QuizQuestion[]>([])
const idx = ref(0)
const answered = ref(0)
const correct = ref(0)
const total = ref<number | null>(null)
const totalCache = new Map<string, number>()

const skillZhMap: Record<string, string> = { reading: '閱讀', listening: '聽力', vocabulary: '單字', writing: '寫作', speaking: '口說', grammar: '文法' }
const skillZh = computed(() => skillZhMap[props.skill] ?? props.skill)
const diff = computed(() => levelFromSkill(progressStore.getProgress(langStore.currentLanguage).skillLevels[props.skill]))
const diffZh = computed(() => ({ beginner: '初級', intermediate: '中級', advanced: '高級' }[diff.value]))
const batchSize = computed(() => batchSizeFor(diff.value))
const pct = computed(() => (answered.value ? Math.round((correct.value / answered.value) * 100) : 0))

watch(() => langStore.currentLanguage, async (lang) => {
  state.value = 'idle'
  if (totalCache.has(lang)) { total.value = totalCache.get(lang)!; return }
  total.value = null
  const n = await bankTotal(lang)
  totalCache.set(lang, n)
  total.value = n
}, { immediate: true })

async function start() {
  loading.value = true
  questions.value = await generateBatch(langStore.currentLanguage, diff.value, batchSize.value, props.kinds)
  idx.value = 0
  answered.value = 0
  correct.value = 0
  loading.value = false
  state.value = questions.value.length ? 'running' : 'idle'
}

function onAnswer(ok: boolean) {
  answered.value++
  if (ok) correct.value++
}

function next() {
  if (idx.value < questions.value.length - 1) idx.value++
  else finish()
}

function finish() {
  state.value = 'done'
  const t = Math.max(1, answered.value)
  progressStore.recordQuizComplete(langStore.currentLanguage, correct.value, t, props.skill)
  progressStore.addPoints(langStore.currentLanguage, pct.value)
}
</script>

<style scoped>
.bp-intro { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 20px 24px; flex-wrap: wrap; margin-bottom: 24px; }
.bp-title { font-size: 1.05rem; margin-bottom: 4px; }
.bp-desc { font-size: 0.85rem; color: var(--text-muted); }
.bp-bar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px; font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); flex-wrap: wrap; }
.bp-finish { font-size: 0.8rem; padding: 5px 12px; }
.bp-result { text-align: center; padding: 28px; margin-bottom: 24px; }
.bp-result-emoji { font-size: 2.5rem; margin-bottom: 8px; }
.bp-result-text { font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 16px; }
.bp-result-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
</style>
