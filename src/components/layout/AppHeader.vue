<template>
  <header class="app-header">
    <div class="container header-inner">
      <RouterLink to="/" class="logo">
        <span class="logo-icon">☕</span>
        <span class="logo-text">LinguaCafé</span>
      </RouterLink>

      <nav class="main-nav" :class="{ 'nav-open': mobileMenuOpen }">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="nav-link" @click="mobileMenuOpen = false">
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="header-actions">
        <button class="lang-switcher btn btn-ghost" @click="showLangMenu = !showLangMenu">
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

        <button class="btn btn-icon mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen">
          <span v-if="!mobileMenuOpen">☰</span>
          <span v-else>✕</span>
        </button>
      </div>
    </div>

    <div v-if="showLangMenu" class="lang-overlay" @click="showLangMenu = false" />
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import { LANGUAGES } from '@/data/languages'
import type { Language } from '@/types'

const langStore = useLanguageStore()
const currentLanguage = computed(() => langStore.currentLanguage)
const currentConfig = computed(() => langStore.currentConfig)

const showLangMenu = ref(false)
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

.header-inner {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 64px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;
}
.logo-icon { font-size: 1.5rem; }
.logo-text {
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-secondary);
  transition: all 0.2s;
  text-decoration: none;
  white-space: nowrap;
}
.nav-link:hover, .nav-link.router-link-active {
  background: var(--bg-secondary);
  color: var(--accent);
}
.nav-icon { font-size: 1rem; }

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  position: relative;
}

.lang-switcher {
  gap: 6px;
  padding: 6px 12px;
  font-size: 0.85rem;
}
.lang-name { font-weight: 700; }
.arrow { font-size: 0.7rem; color: var(--text-muted); }

.lang-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 48px;
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
.lang-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  color: var(--text-secondary);
  background: transparent;
  width: 100%;
  transition: all 0.15s;
}
.lang-option:hover { background: var(--bg-secondary); color: var(--accent); }
.lang-option.active { background: rgba(200, 151, 58, 0.12); color: var(--accent); font-weight: 700; }

.lang-overlay {
  position: fixed;
  inset: 0;
  z-index: 150;
}

.mobile-menu-btn { display: none; }

@media (max-width: 900px) {
  .main-nav {
    display: none;
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
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
  .lang-dropdown { right: 0; }
  .lang-name { display: none; }
}
</style>
