import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Language } from '@/types'

const STORAGE_KEY = 'lc_users'
const SESSION_KEY = 'lc_session'

function hashPassword(pw: string): string {
  // Simple deterministic hash for demo purposes (not cryptographically secure)
  let h = 0
  for (let i = 0; i < pw.length; i++) {
    h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0
  }
  return h.toString(36) + pw.length.toString(36)
}

function getUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)

  const isLoggedIn = computed(() => currentUser.value !== null)
  const displayName = computed(() => currentUser.value?.name ?? '')
  const avatarEmoji = computed(() => currentUser.value?.avatar ?? '👤')

  // Restore session on app init
  function init() {
    try {
      const session = localStorage.getItem(SESSION_KEY)
      if (session) {
        const { userId } = JSON.parse(session)
        const users = getUsers()
        const user = users.find((u) => u.id === userId)
        if (user) currentUser.value = user
      }
    } catch {
      /* ignore */
    }
  }

  function register(
    name: string,
    email: string,
    password: string,
    languages: Language[] = ['en'],
  ): { success: boolean; error?: string } {
    const users = getUsers()
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: '此 Email 已被註冊過' }
    }
    const user: User = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      name,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      avatar: '☕',
      createdAt: new Date().toISOString(),
      learningLanguages: languages,
      dailyGoalMinutes: 15,
    }
    users.push(user)
    saveUsers(users)
    currentUser.value = user
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }))
    return { success: true }
  }

  function login(email: string, password: string): { success: boolean; error?: string } {
    const users = getUsers()
    const user = users.find((u) => u.email === email.toLowerCase())
    if (!user) return { success: false, error: '找不到此 Email 的帳號' }
    if (user.passwordHash !== hashPassword(password)) {
      return { success: false, error: '密碼不正確' }
    }
    currentUser.value = user
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }))
    return { success: true }
  }

  function logout() {
    currentUser.value = null
    localStorage.removeItem(SESSION_KEY)
  }

  function sendResetEmail(email: string): { success: boolean; error?: string; token?: string } {
    const users = getUsers()
    const idx = users.findIndex((u) => u.email === email.toLowerCase())
    if (idx === -1 || !users[idx]) return { success: false, error: '找不到此 Email 的帳號' }
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36)
    users[idx]!.resetToken = token
    users[idx]!.resetTokenExpiry = Date.now() + 30 * 60 * 1000 // 30 min
    saveUsers(users)
    // In a real app, send email. Here we return the token so the UI can show it.
    return { success: true, token }
  }

  function resetPassword(token: string, newPassword: string): { success: boolean; error?: string } {
    const users = getUsers()
    const idx = users.findIndex(
      (u) => u.resetToken === token && u.resetTokenExpiry && u.resetTokenExpiry > Date.now(),
    )
    if (idx === -1 || !users[idx]) return { success: false, error: '重設連結無效或已過期' }
    users[idx]!.passwordHash = hashPassword(newPassword)
    users[idx]!.resetToken = undefined
    users[idx]!.resetTokenExpiry = undefined
    saveUsers(users)
    return { success: true }
  }

  function updateProfile(changes: Partial<Pick<User, 'name' | 'avatar' | 'learningLanguages' | 'dailyGoalMinutes' | 'targetExam'>>) {
    if (!currentUser.value) return
    const users = getUsers()
    const idx = users.findIndex((u) => u.id === currentUser.value!.id)
    if (idx === -1 || !users[idx]) return
    Object.assign(users[idx]!, changes)
    Object.assign(currentUser.value, changes)
    saveUsers(users)
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: currentUser.value.id }))
  }

  function changePassword(oldPw: string, newPw: string): { success: boolean; error?: string } {
    if (!currentUser.value) return { success: false, error: '未登入' }
    if (currentUser.value.passwordHash !== hashPassword(oldPw)) {
      return { success: false, error: '目前密碼不正確' }
    }
    const users = getUsers()
    const idx = users.findIndex((u) => u.id === currentUser.value!.id)
    if (idx === -1 || !users[idx]) return { success: false, error: '找不到使用者' }
    users[idx]!.passwordHash = hashPassword(newPw)
    currentUser.value.passwordHash = hashPassword(newPw)
    saveUsers(users)
    return { success: true }
  }

  return {
    currentUser,
    isLoggedIn,
    displayName,
    avatarEmoji,
    init,
    register,
    login,
    logout,
    sendResetEmail,
    resetPassword,
    updateProfile,
    changePassword,
  }
})
