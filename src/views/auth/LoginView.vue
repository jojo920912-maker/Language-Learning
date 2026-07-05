<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-logo">
        <span>☕</span>
        <h1>Sip & Speak</h1>
        <p>歡迎回來，繼續你的學習旅程</p>
      </div>

      <form class="auth-form" @submit.prevent="onSubmit">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            v-model="email"
            type="email"
            class="form-input"
            :class="{ error: errors.email }"
            placeholder="your@email.com"
            autocomplete="email"
            required
          />
          <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">密碼</label>
          <div class="input-with-toggle">
            <input
              v-model="password"
              :type="showPw ? 'text' : 'password'"
              class="form-input"
              :class="{ error: errors.password }"
              placeholder="輸入密碼"
              autocomplete="current-password"
              required
            />
            <button type="button" class="pw-toggle" @click="showPw = !showPw" tabindex="-1">
              {{ showPw ? '🙈' : '👁️' }}
            </button>
          </div>
          <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input v-model="rememberMe" type="checkbox" />
            <span>記住我</span>
          </label>
          <RouterLink to="/forgot-password" class="forgot-link">忘記密碼？</RouterLink>
        </div>

        <div v-if="errorMsg" class="alert-error">
          <span>⚠️</span> {{ errorMsg }}
        </div>

        <button type="submit" class="btn btn-primary submit-btn" :disabled="loading">
          <span v-if="loading" class="spinner" />
          <span v-else>登入</span>
        </button>
      </form>

      <div class="auth-divider"><span>或</span></div>

      <p class="auth-switch">
        還沒有帳號？
        <RouterLink to="/register" class="switch-link">立即註冊</RouterLink>
      </p>
    </div>

    <div class="auth-deco">
      <span v-for="i in decos" :key="i.id" class="deco-item" :style="i.style">{{ i.emoji }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 已登入者直接離開登入頁（例如從書籤或舊分頁開啟）
onMounted(() => {
  if (userStore.isLoggedIn) {
    router.replace((route.query.redirect as string) || '/')
  }
})

const email = ref('')
const password = ref('')
const showPw = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const errors = reactive({ email: '', password: '' })

const decos = [
  { id: 1, emoji: '☕', style: 'top:10%;left:8%;font-size:2.5rem;opacity:0.15;' },
  { id: 2, emoji: '📖', style: 'top:30%;right:6%;font-size:2rem;opacity:0.12;' },
  { id: 3, emoji: '🌿', style: 'bottom:20%;left:5%;font-size:2rem;opacity:0.12;' },
  { id: 4, emoji: '✨', style: 'bottom:35%;right:8%;font-size:1.8rem;opacity:0.1;' },
  { id: 5, emoji: '🎯', style: 'top:60%;left:10%;font-size:1.6rem;opacity:0.1;' },
]

async function onSubmit() {
  errors.email = ''
  errors.password = ''
  errorMsg.value = ''

  if (!email.value) { errors.email = '請輸入 Email'; return }
  if (!password.value) { errors.password = '請輸入密碼'; return }

  loading.value = true
  const result = await userStore.login(email.value, password.value)
  loading.value = false

  if (result.success) {
    router.push('/')
  } else {
    errorMsg.value = result.error ?? '登入失敗'
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 40px 36px;
  position: relative;
  z-index: 1;
}

.auth-logo {
  text-align: center;
  margin-bottom: 32px;
}
.auth-logo span { font-size: 2.4rem; display: block; margin-bottom: 8px; }
.auth-logo h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 6px; }
.auth-logo p { font-size: 0.88rem; color: var(--text-muted); }

.auth-form { display: flex; flex-direction: column; gap: 18px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); }
.form-input {
  padding: 11px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
}
.form-input:focus { border-color: var(--accent); background: var(--bg-card); }
.form-input.error { border-color: #c62828; }
.form-error { font-size: 0.78rem; color: #c62828; }

.input-with-toggle { position: relative; }
.input-with-toggle .form-input { padding-right: 44px; }
.pw-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  font-size: 1rem;
  cursor: pointer;
  line-height: 1;
  padding: 2px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -4px;
}
.remember-me { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--text-muted); cursor: pointer; }
.remember-me input { accent-color: var(--accent); }
.forgot-link { font-size: 0.85rem; color: var(--accent); font-weight: 700; }

.alert-error {
  padding: 10px 14px;
  background: #fce4ec;
  border: 1px solid #ef9a9a;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  color: #c62828;
  display: flex;
  align-items: center;
  gap: 8px;
}

.submit-btn {
  width: 100%;
  justify-content: center;
  padding: 13px;
  font-size: 1rem;
  margin-top: 4px;
}
.submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0 16px;
  color: var(--text-muted);
  font-size: 0.82rem;
}
.auth-divider::before, .auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.auth-switch { text-align: center; font-size: 0.88rem; color: var(--text-muted); }
.switch-link { color: var(--accent); font-weight: 700; margin-left: 4px; }

.auth-deco { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.deco-item { position: absolute; animation: pulse 4s ease infinite; }
</style>
