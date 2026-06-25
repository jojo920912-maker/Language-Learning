<template>
  <div class="auth-page">
    <div class="auth-card card">
      <!-- Invalid/expired token -->
      <div v-if="tokenInvalid" class="invalid-section">
        <div class="invalid-icon">⚠️</div>
        <h2>連結無效或已過期</h2>
        <p>密碼重設連結已過期（有效期 30 分鐘），請重新申請。</p>
        <RouterLink to="/forgot-password" class="btn btn-primary">重新申請 →</RouterLink>
      </div>

      <!-- Reset form -->
      <div v-else-if="step === 'form'">
        <div class="auth-logo">
          <span>🔐</span>
          <h1>重設密碼</h1>
          <p>請輸入你的新密碼</p>
        </div>

        <form class="auth-form" @submit.prevent="onSubmit">
          <div class="form-group">
            <label class="form-label">新密碼</label>
            <div class="input-with-toggle">
              <input v-model="newPw" :type="showPw ? 'text' : 'password'" class="form-input"
                :class="{ error: errors.newPw }" placeholder="至少 8 個字元" required />
              <button type="button" class="pw-toggle" @click="showPw = !showPw" tabindex="-1">
                {{ showPw ? '🙈' : '👁️' }}
              </button>
            </div>
            <div class="pw-strength" v-if="newPw">
              <div class="pw-bar">
                <div class="pw-fill" :style="{ width: pwStrength.pct + '%', background: pwStrength.color }" />
              </div>
              <span class="pw-label" :style="{ color: pwStrength.color }">{{ pwStrength.label }}</span>
            </div>
            <span v-if="errors.newPw" class="form-error">{{ errors.newPw }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">確認新密碼</label>
            <input v-model="confirmPw" :type="showPw ? 'text' : 'password'" class="form-input"
              :class="{ error: errors.confirm }" placeholder="再輸入一次新密碼" required />
            <span v-if="errors.confirm" class="form-error">{{ errors.confirm }}</span>
          </div>

          <div v-if="errorMsg" class="alert-error"><span>⚠️</span> {{ errorMsg }}</div>

          <button type="submit" class="btn btn-primary submit-btn" :disabled="loading">
            <span v-if="loading" class="spinner" />
            <span v-else>確認重設密碼</span>
          </button>
        </form>
      </div>

      <!-- Success -->
      <div v-else-if="step === 'done'" class="success-section">
        <div class="success-icon">🎉</div>
        <h2>密碼重設成功！</h2>
        <p>你的密碼已更新，請使用新密碼登入。</p>
        <RouterLink to="/login" class="btn btn-primary">前往登入 →</RouterLink>
      </div>
    </div>

    <div class="auth-deco">
      <span class="deco-item" style="top:12%;left:8%;font-size:2rem;opacity:0.12;">☕</span>
      <span class="deco-item" style="bottom:18%;right:6%;font-size:2rem;opacity:0.1;">🔐</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()

const token = ref('')
const tokenInvalid = ref(false)
const step = ref<'form' | 'done'>('form')
const newPw = ref('')
const confirmPw = ref('')
const showPw = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const errors = reactive({ newPw: '', confirm: '' })

onMounted(() => {
  token.value = String(route.query.token ?? '')
  if (!token.value) tokenInvalid.value = true
})

const pwStrength = computed(() => {
  const pw = newPw.value
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

async function onSubmit() {
  Object.assign(errors, { newPw: '', confirm: '' })
  errorMsg.value = ''
  if (newPw.value.length < 8) { errors.newPw = '密碼至少需要 8 個字元'; return }
  if (newPw.value !== confirmPw.value) { errors.confirm = '兩次輸入的密碼不一致'; return }

  loading.value = true
  await new Promise((r) => setTimeout(r, 600))
  const result = userStore.resetPassword(token.value, newPw.value)
  loading.value = false

  if (result.success) {
    step.value = 'done'
  } else {
    tokenInvalid.value = true
  }
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px 20px; position: relative; overflow: hidden; }
.auth-card { width: 100%; max-width: 420px; padding: 36px; position: relative; z-index: 1; }
.auth-logo { text-align: center; margin-bottom: 28px; }
.auth-logo span { font-size: 2.2rem; display: block; margin-bottom: 8px; }
.auth-logo h1 { font-size: 1.4rem; font-weight: 600; margin-bottom: 6px; }
.auth-logo p { font-size: 0.88rem; color: var(--text-muted); }
.auth-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); }
.form-input { padding: 11px 14px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 0.95rem; background: var(--bg-secondary); color: var(--text-primary); outline: none; transition: border-color 0.15s; width: 100%; }
.form-input:focus { border-color: var(--accent); }
.form-input.error { border-color: #c62828; }
.form-error { font-size: 0.78rem; color: #c62828; }
.input-with-toggle { position: relative; }
.input-with-toggle .form-input { padding-right: 44px; }
.pw-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; font-size: 1rem; cursor: pointer; }
.pw-strength { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.pw-bar { flex: 1; height: 4px; background: var(--color-latte); border-radius: 2px; overflow: hidden; }
.pw-fill { height: 100%; border-radius: 2px; transition: all 0.3s; }
.pw-label { font-size: 0.75rem; font-weight: 700; min-width: 30px; }
.alert-error { padding: 10px 14px; background: #fce4ec; border: 1px solid #ef9a9a; border-radius: var(--radius-sm); font-size: 0.88rem; color: #c62828; display: flex; align-items: center; gap: 8px; }
.submit-btn { width: 100%; justify-content: center; padding: 13px; font-size: 1rem; }
.submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }

.invalid-section, .success-section { text-align: center; padding: 12px 0; }
.invalid-icon, .success-icon { font-size: 3rem; margin-bottom: 16px; display: block; }
.invalid-section h2, .success-section h2 { font-size: 1.3rem; margin-bottom: 10px; }
.invalid-section p, .success-section p { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 24px; }
.invalid-section .btn, .success-section .btn { display: inline-flex; }

.auth-deco { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.deco-item { position: absolute; animation: pulse 4s ease infinite; }
</style>
