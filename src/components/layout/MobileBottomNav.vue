<template>
  <nav class="mobile-bottom-nav">
    <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="bottom-nav-item">
      <span class="bottom-nav-icon">{{ item.icon }}</span>
      <span class="bottom-nav-label">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

const navItems = [
  { to: '/', icon: '🏠', label: '首頁' },
  { to: '/vocabulary', icon: '📖', label: '單字' },
  { to: '/quiz', icon: '📝', label: '測驗' },
  { to: '/exam', icon: '🎯', label: '考試' },
  { to: '/reading', icon: '📰', label: '閱讀' },
]
</script>

<style scoped>
.mobile-bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(253, 246, 236, 0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid var(--border);
  z-index: 90;
  padding: 4px 0 max(8px, env(safe-area-inset-bottom));
}
.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
  padding: 6px 4px;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.15s;
}
.bottom-nav-item.router-link-active {
  color: var(--accent);
}
.bottom-nav-icon { font-size: 1.3rem; }
.bottom-nav-label { font-size: 0.65rem; font-weight: 700; }

@media (max-width: 900px) {
  .mobile-bottom-nav {
    display: flex;
    justify-content: space-around;
  }
}
</style>
