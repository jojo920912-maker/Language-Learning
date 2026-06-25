<template>
  <div class="auth-page">
    <div class="auth-card card">
      <RouterLink to="/login" class="back-nav">← 返回登入</RouterLink>

      <!-- Email input step -->
      <div v-if="step === 'input'">
        <div class="auth-logo">
          <span>🔑</span>
          <h1>忘記密碼</h1>
          <p>輸入你的 Email，我們將傳送重設連結給你</p>
        </div>

        <form class="auth-form" @submit.prevent="onSendReset">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="email" type="email" class="form-input" :class="{ error: emailError }"
              placeholder="your@email.com" required />
            <span v-if="emailError" class="form-error">{{ emailError }}</span>
          </div>

          <div v-if="errorMsg" class="alert-error"><span>⚠️</span> {{ errorMsg }}</div>

          <button type="submit" class="btn btn-primary submit-btn" :disabled="loading">
            <span v-if="loading" class="spinner" />
            <span v-else>傳送重設連結</span>
          </button>
        </form>
      </div>

      <!-- Sent step (shows token for demo) -->
      <div v-else-if="step === 'sent'" class="sent-section">
        <div class="sent-icon">📬</div>
        <h2 class="sent-title">重設連結已傳送！</h2>
        <p class="sent-desc">已將密碼重設連結傳送至 <strong>{{ email }}</strong></p>

        <!-- Demo notice: show the reset token since there's no real email server -->
        <div class="demo-notice">
          <p class="demo-label">🛠 Demo 模式提示</p>
          <p class="demo-desc">因為這是前端展示，沒有實際 Email 伺服器。請點擊下方按鈕直接前往重設密碼頁面：</p>
          <RouterLink :to="`/reset-password?token=${resetToken}`" class="btn btn-primary demo-btn">
            前往重設密碼 →
          </RouterLink>
        </div>

        <p class="resend-hint">
          沒有收到？
          <button class="resend-btn" @click="step = 'input'">重新傳送</button>
        </p>
      </div>
    </div>

    <div class="auth-deco">
      <span class="deco-item" style="top:15%;left:8%;font-size:2rem;opacity:0.12;">☕</span>
      <span class="deco-item" style="bottom:20%;right:6%;font-size:2rem;opacity:0.1;">🔑</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const step = ref<'input' | 'sent'>('input')
const email = ref('')
const emailError = ref('')
const errorMsg = ref('')
const loading = ref(false)
const resetToken = ref('')

async function onSendReset() {
  emailError.value = ''
  errorMsg.value = ''
  if (!email.value) { emailError.value = '請輸入 Email'; return }

  loading.value = true
  await new Promise((r) => setTimeout(r, 800))

  const result = userStore.sendResetEmail(email.value)
  loading.value = false

  if (result.success) {
    resetToken.value = result.token ?? ''
    step.value = 'sent'
  } else {
    errorMsg.value = result.error ?? '傳送失敗'
  }
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px 20px; position: relative; overflow: hidden; }
.auth-card { width: 100%; max-width: 420px; padding: 36px; position: relative; z-index: 1; }
.back-nav { display: inline-flex; align-items: center; gap: 4px; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 24px; font-weight: 700; text-decoration: none; transition: color 0.15s; }
.back-nav:hover { color: var(--accent); }
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
.alert-error { padding: 10px 14px; background: #fce4ec; border: 1px solid #ef9a9a; border-radius: var(--radius-sm); font-size: 0.88rem; color: #c62828; display: flex; align-items: center; gap: 8px; }
.submit-btn { width: 100%; justify-content: center; padding: 13px; font-size: 1rem; }
.submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }

.sent-section { text-align: center; }
.sent-icon { font-size: 3.5rem; margin-bottom: 12px; }
.sent-title { font-size: 1.4rem; margin-bottom: 8px; }
.sent-desc { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 24px; }
.demo-notice { background: rgba(200,151,58,0.08); border: 1px solid rgba(200,151,58,0.3); border-radius: var(--radius-md); padding: 16px 18px; margin-bottom: 20px; text-align: left; }
.demo-label { font-size: 0.82rem; font-weight: 700; color: var(--accent); margin-bottom: 6px; }
.demo-desc { font-size: 0.84rem; color: var(--text-muted); margin-bottom: 14px; line-height: 1.5; }
.demo-btn { display: inline-flex; justify-content: center; width: 100%; }
.resend-hint { font-size: 0.85rem; color: var(--text-muted); }
.resend-btn { background: none; color: var(--accent); font-size: 0.85rem; font-weight: 700; cursor: pointer; text-decoration: underline; }

.auth-deco { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.deco-item { position: absolute; animation: pulse 4s ease infinite; }
</style>
