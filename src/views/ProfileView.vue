<template>
  <div class="container page-content">
    <div class="profile-header">
      <div class="profile-avatar-section">
        <div class="current-avatar">{{ userStore.avatarEmoji }}</div>
        <div>
          <h1 class="section-title">{{ userStore.displayName }}</h1>
          <p class="profile-email">{{ userStore.currentUser?.email }}</p>
          <p class="profile-joined">加入於 {{ joinedDate }}</p>
        </div>
      </div>
      <button class="btn btn-ghost logout-btn" @click="onLogout">登出</button>
    </div>

    <div class="profile-grid">
      <!-- Edit profile -->
      <div class="profile-section card">
        <h2 class="card-title">✏️ 個人資料</h2>

        <div class="form-group">
          <label class="form-label">頭像</label>
          <div class="avatar-grid">
            <button v-for="a in avatars" :key="a" type="button" class="avatar-btn"
              :class="{ selected: editAvatar === a }" @click="editAvatar = a">{{ a }}</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">暱稱</label>
          <input v-model="editName" type="text" class="form-input" placeholder="你的暱稱" />
        </div>

        <div class="form-group">
          <label class="form-label">每日學習目標</label>
          <div class="goal-chips">
            <button v-for="g in goals" :key="g.min" type="button" class="goal-chip"
              :class="{ selected: editGoal === g.min }" @click="editGoal = g.min">{{ g.label }}</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">學習語言</label>
          <div class="lang-chips">
            <button v-for="lang in languages" :key="lang.code" type="button" class="lang-chip"
              :class="{ selected: editLangs.includes(lang.code) }" @click="toggleLang(lang.code)">
              {{ lang.flag }} {{ lang.name }}
            </button>
          </div>
        </div>

        <div v-if="profileSaved" class="alert-success">✓ 個人資料已儲存</div>

        <button class="btn btn-primary save-btn" @click="saveProfile">儲存變更</button>
      </div>

      <!-- Stats -->
      <div class="profile-section card">
        <h2 class="card-title">📊 學習統計</h2>
        <div class="stats-list">
          <div v-for="lang in learningLangConfigs" :key="lang.code" class="lang-stat-block">
            <div class="lang-stat-header">
              <span class="lang-stat-flag">{{ lang.flag }}</span>
              <span class="lang-stat-name">{{ lang.name }}</span>
              <span class="lang-stat-pts">{{ progress(lang.code).totalPoints }} pts</span>
            </div>
            <div class="skill-rows">
              <div v-for="(lvl, skill) in progress(lang.code).skillLevels" :key="skill" class="skill-mini">
                <span class="skill-mini-name">{{ skillNames[skill] }}</span>
                <div class="progress-bar" style="flex:1">
                  <div class="progress-bar-fill" :style="{ width: lvl + '%' }" />
                </div>
                <span class="skill-mini-pct">{{ lvl }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Change password -->
      <div class="profile-section card">
        <h2 class="card-title">🔐 修改密碼</h2>
        <form class="auth-form" @submit.prevent="onChangePw">
          <div class="form-group">
            <label class="form-label">目前密碼</label>
            <div class="input-with-toggle">
              <input v-model="oldPw" :type="showPw ? 'text' : 'password'" class="form-input"
                :class="{ error: pwErrors.old }" placeholder="目前的密碼" />
              <button type="button" class="pw-toggle" @click="showPw = !showPw" tabindex="-1">
                {{ showPw ? '🙈' : '👁️' }}
              </button>
            </div>
            <span v-if="pwErrors.old" class="form-error">{{ pwErrors.old }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">新密碼</label>
            <input v-model="newPw" :type="showPw ? 'text' : 'password'" class="form-input"
              :class="{ error: pwErrors.new }" placeholder="至少 8 個字元" />
            <span v-if="pwErrors.new" class="form-error">{{ pwErrors.new }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">確認新密碼</label>
            <input v-model="confirmPw" :type="showPw ? 'text' : 'password'" class="form-input"
              :class="{ error: pwErrors.confirm }" placeholder="再輸入一次新密碼" />
            <span v-if="pwErrors.confirm" class="form-error">{{ pwErrors.confirm }}</span>
          </div>
          <div v-if="pwError" class="alert-error">⚠️ {{ pwError }}</div>
          <div v-if="pwSaved" class="alert-success">✓ 密碼已成功修改</div>
          <button type="submit" class="btn btn-primary save-btn">修改密碼</button>
        </form>
      </div>

      <!-- Achievements -->
      <div class="profile-section card">
        <h2 class="card-title">🏆 成就徽章</h2>
        <div class="badges-grid">
          <div v-for="badge in achievementBadges" :key="badge.id"
            class="badge-item" :class="{ earned: badge.earned }">
            <span class="badge-emoji">{{ badge.emoji }}</span>
            <span class="badge-name">{{ badge.name }}</span>
            <span class="badge-desc">{{ badge.desc }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useProgressStore } from '@/stores/progress'
import { LANGUAGES } from '@/data/languages'
import type { Language } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const progressStore = useProgressStore()

const languages = LANGUAGES
const avatars = ['☕', '🌸', '🎯', '📚', '🌙', '⭐', '🦊', '🐧', '🌿', '🎵', '🍵', '🌊']
const goals = [
  { min: 5, label: '5 分鐘' },
  { min: 15, label: '15 分鐘' },
  { min: 30, label: '30 分鐘' },
  { min: 60, label: '1 小時' },
]
const skillNames: Record<string, string> = {
  listening: '聽力', reading: '閱讀', writing: '寫作', speaking: '口說', vocabulary: '單字', grammar: '文法',
}

const editName = ref(userStore.currentUser?.name ?? '')
const editAvatar = ref(userStore.currentUser?.avatar ?? '☕')
const editGoal = ref(userStore.currentUser?.dailyGoalMinutes ?? 15)
const editLangs = ref<Language[]>([...(userStore.currentUser?.learningLanguages ?? ['en'])])
const profileSaved = ref(false)

const oldPw = ref('')
const newPw = ref('')
const confirmPw = ref('')
const showPw = ref(false)
const pwError = ref('')
const pwSaved = ref(false)
const pwErrors = reactive({ old: '', new: '', confirm: '' })

const joinedDate = computed(() => {
  const d = userStore.currentUser?.createdAt
  if (!d) return ''
  return new Date(d).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
})

const learningLangConfigs = computed(() =>
  languages.filter((l) => editLangs.value.includes(l.code)),
)

function progress(lang: Language) {
  return progressStore.getProgress(lang)
}

function toggleLang(code: Language) {
  const idx = editLangs.value.indexOf(code)
  if (idx === -1) editLangs.value.push(code)
  else if (editLangs.value.length > 1) editLangs.value.splice(idx, 1)
}

async function saveProfile() {
  await userStore.updateProfile({
    name: editName.value.trim() || userStore.displayName,
    avatar: editAvatar.value,
    dailyGoalMinutes: editGoal.value,
    learningLanguages: editLangs.value,
  })
  profileSaved.value = true
  setTimeout(() => { profileSaved.value = false }, 2500)
}

async function onChangePw() {
  Object.assign(pwErrors, { old: '', new: '', confirm: '' })
  pwError.value = ''
  pwSaved.value = false
  if (!oldPw.value) { pwErrors.old = '請輸入目前密碼'; return }
  if (newPw.value.length < 8) { pwErrors.new = '新密碼至少 8 個字元'; return }
  if (newPw.value !== confirmPw.value) { pwErrors.confirm = '兩次輸入不一致'; return }
  const result = await userStore.changePassword(oldPw.value, newPw.value)
  if (result.success) {
    pwSaved.value = true
    oldPw.value = ''
    newPw.value = ''
    confirmPw.value = ''
    setTimeout(() => { pwSaved.value = false }, 2500)
  } else {
    pwError.value = result.error ?? '修改失敗'
  }
}

async function onLogout() {
  await userStore.logout()
  router.push('/login')
}


const achievementBadges = computed(() => {
  const totalPts = progressStore.totalPointsAll
  const totalQuizzes = Object.values(progressStore.progressMap).reduce((s, p) => s + p.completedQuizzes, 0)
  return [
    { id: 1, emoji: '☕', name: '咖啡初學者', desc: '完成第一次登入', earned: true },
    { id: 2, emoji: '📖', name: '單字愛好者', desc: '學習 10 個單字', earned: progressStore.learnedWords.size >= 10 },
    { id: 3, emoji: '🔥', name: '連續三天', desc: '連續學習 3 天', earned: false },
    { id: 4, emoji: '🎯', name: '考試達人', desc: '完成 5 次考試練習', earned: totalQuizzes >= 5 },
    { id: 5, emoji: '⭐', name: '積分百分', desc: '累積 100 學習點數', earned: totalPts >= 100 },
    { id: 6, emoji: '🌍', name: '多語達人', desc: '學習 3 種以上語言', earned: editLangs.value.length >= 3 },
  ]
})
</script>

<style scoped>
.profile-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; }
.profile-avatar-section { display: flex; align-items: center; gap: 20px; }
.current-avatar { font-size: 3.5rem; background: var(--bg-secondary); border: 2px solid var(--border); border-radius: 50%; width: 72px; height: 72px; display: flex; align-items: center; justify-content: center; }
.profile-email { font-size: 0.88rem; color: var(--text-muted); }
.profile-joined { font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; }
.logout-btn { color: #c62828; border-color: #ef9a9a; }
.logout-btn:hover { background: #fce4ec; }

.profile-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 24px; }
.profile-section { padding: 24px; }
.card-title { font-size: 1.05rem; margin-bottom: 20px; font-family: 'Lato', sans-serif; font-weight: 700; }

.form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.form-label { font-size: 0.82rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.form-input { padding: 10px 13px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 0.92rem; background: var(--bg-secondary); color: var(--text-primary); outline: none; transition: border-color 0.15s; }
.form-input:focus { border-color: var(--accent); }
.form-input.error { border-color: #c62828; }
.form-error { font-size: 0.78rem; color: #c62828; }

.avatar-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.avatar-btn { width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--border); background: var(--bg-secondary); font-size: 1.2rem; cursor: pointer; transition: all 0.15s; }
.avatar-btn:hover { border-color: var(--accent); transform: scale(1.1); }
.avatar-btn.selected { border-color: var(--accent); background: rgba(200,151,58,0.1); }

.goal-chips, .lang-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.goal-chip, .lang-chip { padding: 6px 14px; border-radius: 20px; border: 1.5px solid var(--border); background: var(--bg-card); font-size: 0.82rem; cursor: pointer; transition: all 0.15s; color: var(--text-secondary); }
.goal-chip:hover, .lang-chip:hover { border-color: var(--accent); }
.goal-chip.selected, .lang-chip.selected { border-color: var(--accent); background: rgba(200,151,58,0.1); color: var(--accent); font-weight: 700; }

.alert-success { padding: 10px 14px; background: #e8f5e9; border: 1px solid #a5d6a7; border-radius: var(--radius-sm); font-size: 0.88rem; color: #2e7d32; margin-bottom: 8px; }
.alert-error { padding: 10px 14px; background: #fce4ec; border: 1px solid #ef9a9a; border-radius: var(--radius-sm); font-size: 0.88rem; color: #c62828; margin-bottom: 8px; }
.save-btn { width: 100%; justify-content: center; padding: 11px; }

.stats-list { display: flex; flex-direction: column; gap: 20px; }
.lang-stat-block { background: var(--bg-secondary); border-radius: var(--radius-sm); padding: 14px 16px; }
.lang-stat-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.lang-stat-flag { font-size: 1.2rem; }
.lang-stat-name { flex: 1; font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }
.lang-stat-pts { font-size: 0.82rem; font-weight: 700; color: var(--accent); }
.skill-rows { display: flex; flex-direction: column; gap: 6px; }
.skill-mini { display: flex; align-items: center; gap: 8px; }
.skill-mini-name { font-size: 0.75rem; color: var(--text-muted); width: 36px; flex-shrink: 0; }
.skill-mini-pct { font-size: 0.72rem; color: var(--text-muted); width: 28px; text-align: right; flex-shrink: 0; }

.input-with-toggle { position: relative; }
.input-with-toggle .form-input { padding-right: 44px; }
.pw-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; font-size: 1rem; cursor: pointer; }
.auth-form { display: flex; flex-direction: column; gap: 0; }

.badges-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
.badge-item { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 14px 10px; border-radius: var(--radius-sm); border: 1.5px solid var(--border); background: var(--bg-secondary); text-align: center; opacity: 0.45; filter: grayscale(1); transition: all 0.2s; }
.badge-item.earned { opacity: 1; filter: none; border-color: rgba(200,151,58,0.4); background: rgba(200,151,58,0.06); }
.badge-emoji { font-size: 1.8rem; }
.badge-name { font-size: 0.78rem; font-weight: 700; color: var(--text-primary); }
.badge-desc { font-size: 0.7rem; color: var(--text-muted); line-height: 1.3; }


@media (max-width: 600px) {
  .profile-grid { grid-template-columns: 1fr; }
  .profile-header { flex-direction: column; align-items: flex-start; }
}
</style>
