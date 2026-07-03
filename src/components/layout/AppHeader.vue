<template>
  <header class="app-header">
    <div class="container header-inner">
      <RouterLink to="/" class="logo">
        <span class="logo-icon">☕</span>
        <span class="logo-text">Sip & Speak</span>
      </RouterLink>

      <nav class="main-nav" :class="{ 'nav-open': mobileMenuOpen }">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="nav-link" @click="mobileMenuOpen = false">
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="header-actions">
        <!-- Language switcher -->
        <button class="lang-switcher btn btn-ghost" @click="showLangMenu = !showLangMenu; showUserMenu = false">
          <span>{{ currentConfig.flag }}</span>
          <span class="lang-name">{{ currentConfig.name }}</span>
          <span class="arrow">▾</span>
        </button>

        <div v-if="showLangMenu" class="lang-dropdown" @click.stop>
          <button
            v-for="lang in languages"
            :key="lang.code"
            class="lang-option"
            :class="{ active: lang.code === currentLanguage }"
            @click="selectLang(lang.code)"
          >
            <span>{{ lang.flag }}</span>
            <span>{{ lang.nativeName }}</span>
          </button>
        </div>

        <!-- User menu (logged in) -->
        <div v-if="userStore.isLoggedIn" class="user-menu-wrap">
          <button class="user-avatar-btn" @click="showUserMenu = !showUserMenu; showLangMenu = false">
            <span class="user-avatar">{{ userStore.avatarEmoji }}</span>
            <span class="user-name">{{ userStore.displayName }}</span>
            <span class="arrow">▾</span>
          </button>
          <div v-if="showUserMenu" class="user-dropdown">
            <div class="user-dropdown-header">
              <span class="ud-avatar">{{ userStore.avatarEmoji }}</span>
              <div>
                <p class="ud-name">{{ userStore.displayName }}</p>
                <p class="ud-email">{{ userStore.currentUser?.email }}</p>
              </div>
            </div>
            <div class="ud-divider" />
            <RouterLink to="/profile" class="ud-item" @click="showUserMenu = false">
              <span>👤</span> 個人資料
            </RouterLink>
            <RouterLink to="/quiz" class="ud-item" @click="showUserMenu = false">
              <span>📝</span> 今日測驗
            </RouterLink>
            <div class="ud-divider" />
            <button class="ud-item ud-logout" @click="onLogout">
              <span>🚪</span> 登出
            </button>
          </div>
        </div>

        <!-- Not logged in -->
        <RouterLink v-else to="/login" class="btn btn-primary login-btn">登入</RouterLink>

        <button class="btn btn-icon mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen">
          <span v-if="!mobileMenuOpen">☰</span>
          <span v-else>✕</span>
        </button>
      </div>
    </div>

    <!-- Overlay to close dropdowns -->
    <div v-if="showLangMenu || showUserMenu" class="header-overlay"
      @click="showLangMenu = false; showUserMenu = false" />
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import { useUserStore } from '@/stores/user'
import { LANGUAGES } from '@/data/languages'
import type { Language } from '@/types'

const langStore = useLanguageStore()
const userStore = useUserStore()
const router = useRouter()

const currentLanguage = computed(() => langStore.currentLanguage)
const currentConfig = computed(() => langStore.currentConfig)

const showLangMenu = ref(false)
const showUserMenu = ref(false)
const mobileMenuOpen = ref(false)
const languages = LANGUAGES

const navItems = [
  { to: '/vocabulary', icon: '📖', label: '單字' },
  { to: '/reading', icon: '📰', label: '閱讀' },
  { to: '/listening', icon: '🎧', label: '聽力' },
  { to: '/writing', icon: '✍️', label: '寫作' },
  { to: '/quiz', icon: '📝', label: '每日測驗' },
  { to: '/exam', icon: '🎯', label: '考試準備' },
]

function selectLang(code: Language) {
  langStore.setLanguage(code)
  showLangMenu.value = false
}

function onLogout() {
  userStore.logout()
  showUserMenu.value = false
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(253, 246, 236, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 2px 12px rgba(74, 44, 23, 0.06);
}
.header-inner { display: flex; align-items: center; gap: 24px; height: 64px; }

.logo { display: flex; align-items: center; gap: 8px; text-decoration: none; flex-shrink: 0; }
.logo-icon { font-size: 1.5rem; }
.logo-text { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 600; color: var(--text-primary); }

.main-nav { display: flex; align-items: center; gap: 4px; flex: 1; }
.nav-link { display: flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: var(--radius-sm); font-size: 0.88rem; font-weight: 700; color: var(--text-secondary); transition: all 0.2s; text-decoration: none; white-space: nowrap; }
.nav-link:hover, .nav-link.router-link-active { background: var(--bg-secondary); color: var(--accent); }
.nav-icon { font-size: 1rem; }

.header-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; position: relative; }

.lang-switcher { gap: 6px; padding: 6px 12px; font-size: 0.85rem; }
.lang-name { font-weight: 700; }
.arrow { font-size: 0.7rem; color: var(--text-muted); }

.lang-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 90px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  padding: 8px;
  min-width: 180px;
  z-index: 200;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}
.lang-option { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--text-secondary); background: transparent; width: 100%; transition: all 0.15s; cursor: pointer; }
.lang-option:hover { background: var(--bg-secondary); color: var(--accent); }
.lang-option.active { background: rgba(200, 151, 58, 0.12); color: var(--accent); font-weight: 700; }

/* User menu */
.user-menu-wrap { position: relative; }
.user-avatar-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 5px 12px 5px 6px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.user-avatar-btn:hover { border-color: var(--accent); background: var(--bg-secondary); }
.user-avatar { font-size: 1.3rem; }
.user-name { font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  min-width: 200px;
  z-index: 200;
  overflow: hidden;
}
.user-dropdown-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; }
.ud-avatar { font-size: 1.8rem; }
.ud-name { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }
.ud-email { font-size: 0.75rem; color: var(--text-muted); }
.ud-divider { height: 1px; background: var(--border); }
.ud-item { display: flex; align-items: center; gap: 10px; padding: 11px 16px; font-size: 0.88rem; color: var(--text-secondary); text-decoration: none; transition: background 0.15s; cursor: pointer; background: none; width: 100%; font-family: inherit; }
.ud-item:hover { background: var(--bg-secondary); color: var(--accent); }
.ud-logout { color: #c62828; }
.ud-logout:hover { background: #fce4ec; color: #c62828; }

.login-btn { font-size: 0.85rem; padding: 7px 16px; }
.mobile-menu-btn { display: none; }

.header-overlay { position: fixed; inset: 0; z-index: 150; }

@media (max-width: 900px) {
  .main-nav {
    display: none;
    position: fixed;
    top: 64px; left: 0; right: 0; bottom: 0;
    background: rgba(253, 246, 236, 0.97);
    backdrop-filter: blur(12px);
    flex-direction: column;
    align-items: flex-start;
    padding: 20px 24px;
    gap: 8px;
    z-index: 99;
    overflow-y: auto;
  }
  .main-nav.nav-open { display: flex; }
  .nav-link { font-size: 1.1rem; padding: 10px 14px; width: 100%; }
  .mobile-menu-btn { display: flex; }
  .lang-name { display: none; }
  .user-name { display: none; }
  .lang-dropdown { right: 0; }
}
</style>
