<script setup lang="ts">
import { watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import MobileBottomNav from '@/components/layout/MobileBottomNav.vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 登入狀態改變時（含跨分頁同步）自動導向正確頁面：
// - 已登入卻停在登入/註冊頁 → 導回首頁
// - 登出後停在需登入的頁面 → 導向登入頁
watch(
  [() => userStore.isLoggedIn, () => route.fullPath],
  ([loggedIn]) => {
    if (loggedIn && route.meta.guest) {
      router.replace((route.query.redirect as string) || '/')
    } else if (!loggedIn && route.meta.requiresAuth) {
      router.replace('/login')
    }
  },
  { immediate: true },
)
</script>

<template>
  <div id="app-wrapper">
    <AppHeader />
    <main class="main-content">
      <RouterView />
    </main>
    <MobileBottomNav />
  </div>
</template>

<style>
#app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.main-content {
  flex: 1;
}
</style>
