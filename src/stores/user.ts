import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as fbUpdateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import type { User, Language } from '@/types'

interface UserProfile {
  name: string
  avatar: string
  learningLanguages: Language[]
  dailyGoalMinutes: number
  targetExam?: string
  createdAt: string
}

function authErrorMessage(code: string): string {
  const map: Record<string, string> = {
    'auth/email-already-in-use': '此 Email 已被註冊過',
    'auth/invalid-email': 'Email 格式不正確',
    'auth/weak-password': '密碼強度不足（至少 6 個字元）',
    'auth/user-not-found': '找不到此 Email 的帳號',
    'auth/wrong-password': '密碼不正確',
    'auth/invalid-credential': 'Email 或密碼不正確',
    'auth/too-many-requests': '嘗試次數過多，請稍後再試',
    'auth/network-request-failed': '網路連線失敗，請檢查網路',
    'auth/requires-recent-login': '此操作需要重新登入後再試',
  }
  return map[code] ?? `發生錯誤（${code}）`
}

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)

  const isLoggedIn = computed(() => currentUser.value !== null)
  const displayName = computed(() => currentUser.value?.name ?? '')
  const avatarEmoji = computed(() => currentUser.value?.avatar ?? '👤')

  function profileDocRef(uid: string) {
    return doc(db, 'users', uid)
  }

  async function loadProfile(fbUser: FirebaseUser): Promise<void> {
    let profile: UserProfile = {
      name: fbUser.displayName ?? fbUser.email?.split('@')[0] ?? '學習者',
      avatar: '☕',
      learningLanguages: ['en'],
      dailyGoalMinutes: 15,
      createdAt: fbUser.metadata.creationTime ?? new Date().toISOString(),
    }
    try {
      const snap = await getDoc(profileDocRef(fbUser.uid))
      if (snap.exists()) {
        profile = { ...profile, ...(snap.data() as Partial<UserProfile>) }
      }
    } catch (e) {
      console.error('載入使用者資料失敗：', e)
    }
    currentUser.value = {
      id: fbUser.uid,
      email: fbUser.email ?? '',
      passwordHash: '',
      ...profile,
    }
    // 登入後載入雲端學習進度
    const { useProgressStore } = await import('./progress')
    await useProgressStore().loadFromCloud(fbUser.uid)
  }

  /** 等待 Firebase 還原登入狀態後 resolve，讓 router guard 拿到正確狀態 */
  function init(): Promise<void> {
    return new Promise((resolve) => {
      let resolved = false
      onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          await loadProfile(fbUser)
        } else {
          currentUser.value = null
        }
        if (!resolved) {
          resolved = true
          resolve()
        }
      })
    })
  }

  async function register(
    name: string,
    email: string,
    password: string,
    languages: Language[] = ['en'],
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await fbUpdateProfile(cred.user, { displayName: name })
      const profile: UserProfile = {
        name,
        avatar: '☕',
        learningLanguages: languages,
        dailyGoalMinutes: 15,
        createdAt: new Date().toISOString(),
      }
      await setDoc(profileDocRef(cred.user.uid), profile)
      await loadProfile(cred.user)
      return { success: true }
    } catch (e: any) {
      return { success: false, error: authErrorMessage(e?.code ?? '') }
    }
  }

  async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      await loadProfile(cred.user)
      return { success: true }
    } catch (e: any) {
      return { success: false, error: authErrorMessage(e?.code ?? '') }
    }
  }

  async function logout() {
    await signOut(auth)
    currentUser.value = null
    // 清空記憶體中的學習進度，避免下一位登入者看到殘留資料
    const { useProgressStore } = await import('./progress')
    useProgressStore().reset()
  }

  /** 透過 Firebase 寄送密碼重設信，使用者點信中連結完成重設 */
  async function sendResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (e: any) {
      return { success: false, error: authErrorMessage(e?.code ?? '') }
    }
  }

  async function updateProfile(
    changes: Partial<Pick<User, 'name' | 'avatar' | 'learningLanguages' | 'dailyGoalMinutes' | 'targetExam'>>,
  ) {
    if (!currentUser.value) return
    try {
      await setDoc(profileDocRef(currentUser.value.id), changes, { merge: true })
      if (changes.name && auth.currentUser) {
        await fbUpdateProfile(auth.currentUser, { displayName: changes.name })
      }
      Object.assign(currentUser.value, changes)
    } catch (e) {
      console.error('儲存個人資料失敗：', e)
    }
  }

  async function changePassword(oldPw: string, newPw: string): Promise<{ success: boolean; error?: string }> {
    const fbUser = auth.currentUser
    if (!fbUser || !fbUser.email) return { success: false, error: '未登入' }
    try {
      const credential = EmailAuthProvider.credential(fbUser.email, oldPw)
      await reauthenticateWithCredential(fbUser, credential)
      await updatePassword(fbUser, newPw)
      return { success: true }
    } catch (e: any) {
      const code = e?.code ?? ''
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        return { success: false, error: '目前密碼不正確' }
      }
      return { success: false, error: authErrorMessage(code) }
    }
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
    updateProfile,
    changePassword,
  }
})
