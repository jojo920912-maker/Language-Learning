<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-logo">
        <span>☕</span>
        <h1>Sip & Speak</h1>
        <p>建立帳號，開始你的語言學習旅程</p>
      </div>

      <!-- Step indicator -->
      <div class="step-indicator">
        <div v-for="s in 2" :key="s" class="step-dot" :class="{ active: step >= s, done: step > s }">
          <span>{{ step > s ? '✓' : s }}</span>
        </div>
        <div class="step-line" />
      </div>
      <div class="step-labels">
        <span :class="{ active: step >= 1 }">基本資料</span>
        <span :class="{ active: step >= 2 }">學習設定</span>
      </div>

      <!-- Step 1: Basic info -->
      <form v-if="step === 1" class="auth-form" @submit.prevent="goStep2">
        <div class="form-group">
          <label class="form-label">暱稱</label>
          <input v-model="name" type="text" class="form-input" :class="{ error: errors.name }"
            placeholder="你的名字或暱稱" required />
          <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" class="form-input" :class="{ error: errors.email }"
            placeholder="your@email.com" autocomplete="email" required />
          <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">密碼</label>
          <div class="input-with-toggle">
            <input v-model="password" :type="showPw ? 'text' : 'password'" class="form-input"
              :class="{ error: errors.password }" placeholder="至少 8 個字元" autocomplete="new-password" required />
            <button type="button" class="pw-toggle" @click="showPw = !showPw" tabindex="-1">
              {{ showPw ? '🙈' : '👁️' }}
            </button>
          </div>
          <div class="pw-strength" v-if="password">
            <div class="pw-bar">
              <div class="pw-fill" :style="{ width: pwStrength.pct + '%', background: pwStrength.color }" />
            </div>
            <span class="pw-label" :style="{ color: pwStrength.color }">{{ pwStrength.label }}</span>
          </div>
          <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">確認密碼</label>
          <input v-model="confirmPassword" :type="showPw ? 'text' : 'password'" class="form-input"
            :class="{ error: errors.confirm }" placeholder="再輸入一次密碼" autocomplete="new-password" required />
          <span v-if="errors.confirm" class="form-error">{{ errors.confirm }}</span>
        </div>

        <div v-if="errorMsg" class="alert-error"><span>⚠️</span> {{ errorMsg }}</div>

        <button type="submit" class="btn btn-primary submit-btn">下一步 →</button>
      </form>

      <!-- Step 2: Learning preferences -->
      <form v-else-if="step === 2" class="auth-form" @submit.prevent="onSubmit">
        <div class="form-group">
          <label class="form-label">選擇頭像</label>
          <div class="avatar-grid">
            <button v-for="a in avatars" :key="a" type="button" class="avatar-btn"
              :class="{ selected: avatar === a }" @click="avatar = a">{{ a }}</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">想學習的語言（可多選）</label>
          <div class="lang-chips">
            <button v-for="lang in languages" :key="lang.code" type="button" class="lang-chip"
              :class="{ selected: selectedLangs.includes(lang.code) }" @click="toggleLang(lang.code)">
              {{ lang.flag }} {{ lang.name }}
            </button>
          </div>
          <span v-if="errors.langs" class="form-error">{{ errors.langs }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">每日學習目標</label>
          <div class="goal-chips">
            <button v-for="g in goals" :key="g.min" type="button" class="goal-chip"
              :class="{ selected: dailyGoal === g.min }" @click="dailyGoal = g.min">
              {{ g.label }}
            </button>
          </div>
        </div>

        <div v-if="errorMsg" class="alert-error"><span>⚠️</span> {{ errorMsg }}</div>

        <div class="form-row">
          <button type="button" class="btn btn-ghost back-btn" @click="step = 1">← 返回</button>
          <button type="submit" class="btn btn-primary submit-btn flex-1" :disabled="loading">
            <span v-if="loading" class="spinner" />
            <span v-else>完成註冊 ✓</span>
          </button>
        </div>
      </form>

      <div class="auth-divider"><span>已有帳號？</span></div>
      <p class="auth-switch">
        <RouterLink to="/login" class="switch-link">返回登入</RouterLink>
      </p>
    </div>

    <div class="auth-deco">
      <span v-for="i in decos" :key="i.id" class="deco-item" :style="i.style">{{ i.emoji }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { LANGUAGES } from '@/data/languages'
import type { Language } from '@/types'

const router = useRouter()
const userStore = useUserStore()

const step = ref(1)
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPw = ref(false)
const avatar = ref('☕')
const selectedLangs = ref<Language[]>(['en'])
const dailyGoal = ref(15)
const loading = ref(false)
const errorMsg = ref('')
const errors = reactive({ name: '', email: '', password: '', confirm: '', langs: '' })

const languages = LANGUAGES
const avatars = ['☕', '🌸', '🎯', '📚', '🌙', '⭐', '🦊', '🐧', '🌿', '🎵', '🍵', '🌊']
const goals = [
  { min: 5, label: '5 分鐘' },
  { min: 15, label: '15 分鐘' },
  { min: 30, label: '30 分鐘' },
  { min: 60, label: '1 小時' },
]

const decos = [
  { id: 1, emoji: '☕', style: 'top:8%;left:6%;font-size:2.5rem;opacity:0.13;' },
  { id: 2, emoji: '🌸', style: 'top:25%;right:5%;font-size:2rem;opacity:0.12;' },
  { id: 3, emoji: '📖', style: 'bottom:25%;left:4%;font-size:2rem;opacity:0.1;' },
]

const pwStrength = computed(() => {
  const pw = password.value
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const levels = [
    { pct: 25, color: '#c62828', label: '太弱' },
    { pct: 50, color: '#f57c00', label: '普通' },
    { pct: 75, color: '#689f38', label: '良好' },
    { pct: 100, color: '#388e3c', label: '強' },
  ]
  return levels[Math.max(0, score - 1)] ?? levels[0]!
})

function toggleLang(code: Language) {
  const idx = selectedLangs.value.indexOf(code)
  if (idx === -1) selectedLangs.value.push(code)
  else if (selectedLangs.value.length > 1) selectedLangs.value.splice(idx, 1)
}

function goStep2() {
  Object.assign(errors, { name: '', email: '', password: '', confirm: '', langs: '' })
  errorMsg.value = ''
  if (!name.value.trim()) { errors.name = '請輸入暱稱'; return }
  if (!email.value) { errors.email = '請輸入 Email'; return }
  if (password.value.length < 8) { errors.password = '密碼至少需要 8 個字元'; return }
  if (password.value !== confirmPassword.value) { errors.confirm = '兩次輸入的密碼不一致'; return }
  step.value = 2
}

async function onSubmit() {
  if (selectedLangs.value.length === 0) { errors.langs = '請至少選擇一種語言'; return }
  loading.value = true
  errorMsg.value = ''
  await new Promise((r) => setTimeout(r, 700))
  const result = userStore.register(name.value.trim(), email.value, password.value, selectedLangs.value)
  if (result.success) {
    const user = userStore.currentUser
    if (user) userStore.updateProfile({ avatar: avatar.value, dailyGoalMinutes: dailyGoal.value })
    router.push('/')
  } else {
    errorMsg.value = result.error ?? '註冊失敗'
  }
  loading.value = false
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px 20px; position: relative; overflow: hidden; }
.auth-card { width: 100%; max-width: 460px; padding: 36px; position: relative; z-index: 1; }
.auth-logo { text-align: center; margin-bottom: 24px; }
.auth-logo span { font-size: 2.2rem; display: block; margin-bottom: 6px; }
.auth-logo h1 { font-size: 1.4rem; font-weight: 600; margin-bottom: 4px; }
.auth-logo p { font-size: 0.85rem; color: var(--text-muted); }

.step-indicator { display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: 6px; position: relative; }
.step-dot { width: 30px; height: 30px; border-radius: 50%; border: 2px solid var(--border); background: var(--bg-card); display: flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 700; color: var(--text-muted); transition: all 0.2s; z-index: 1; }
.step-dot.active { border-color: var(--accent); background: var(--accent); color: #fff; }
.step-dot.done { border-color: var(--color-sage); background: var(--color-sage); color: #fff; }
.step-line { position: absolute; top: 50%; left: calc(50% - 30px); width: 60px; height: 2px; background: var(--border); transform: translateY(-50%); z-index: 0; }
.step-labels { display: flex; justify-content: center; gap: 60px; margin-bottom: 24px; }
.step-labels span { font-size: 0.75rem; color: var(--text-muted); }
.step-labels span.active { color: var(--accent); font-weight: 700; }

.auth-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); }
.form-input { padding: 11px 14px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 0.95rem; background: var(--bg-secondary); color: var(--text-primary); outline: none; transition: border-color 0.15s; width: 100%; }
.form-input:focus { border-color: var(--accent); background: var(--bg-card); }
.form-input.error { border-color: #c62828; }
.form-error { font-size: 0.78rem; color: #c62828; }
.input-with-toggle { position: relative; }
.input-with-toggle .form-input { padding-right: 44px; }
.pw-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; font-size: 1rem; cursor: pointer; }
.pw-strength { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.pw-bar { flex: 1; height: 4px; background: var(--color-latte); border-radius: 2px; overflow: hidden; }
.pw-fill { height: 100%; border-radius: 2px; transition: all 0.3s; }
.pw-label { font-size: 0.75rem; font-weight: 700; min-width: 30px; }

.avatar-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.avatar-btn { width: 44px; height: 44px; border-radius: 50%; border: 2px solid var(--border); background: var(--bg-secondary); font-size: 1.3rem; cursor: pointer; transition: all 0.15s; }
.avatar-btn:hover { border-color: var(--accent); transform: scale(1.1); }
.avatar-btn.selected { border-color: var(--accent); background: rgba(200,151,58,0.1); }

.lang-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.lang-chip { padding: 6px 14px; border-radius: 20px; border: 1.5px solid var(--border); background: var(--bg-card); font-size: 0.85rem; cursor: pointer; transition: all 0.15s; color: var(--text-secondary); }
.lang-chip:hover { border-color: var(--accent); }
.lang-chip.selected { border-color: var(--accent); background: rgba(200,151,58,0.1); color: var(--accent); font-weight: 700; }

.goal-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.goal-chip { padding: 8px 18px; border-radius: 20px; border: 1.5px solid var(--border); background: var(--bg-card); font-size: 0.88rem; cursor: pointer; transition: all 0.15s; color: var(--text-secondary); }
.goal-chip:hover { border-color: var(--accent); }
.goal-chip.selected { border-color: var(--accent); background: rgba(200,151,58,0.1); color: var(--accent); font-weight: 700; }

.alert-error { padding: 10px 14px; background: #fce4ec; border: 1px solid #ef9a9a; border-radius: var(--radius-sm); font-size: 0.88rem; color: #c62828; display: flex; align-items: center; gap: 8px; }
.form-row { display: flex; gap: 10px; }
.back-btn { flex-shrink: 0; }
.flex-1 { flex: 1; }
.submit-btn { justify-content: center; padding: 13px; font-size: 1rem; }
.submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }

.auth-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0 12px; color: var(--text-muted); font-size: 0.82rem; }
.auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
.auth-switch { text-align: center; font-size: 0.88rem; }
.switch-link { color: var(--accent); font-weight: 700; }
.auth-deco { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.deco-item { position: absolute; animation: pulse 4s ease infinite; }
</style>
