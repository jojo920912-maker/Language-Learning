<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import MobileBottomNav from '@/components/layout/MobileBottomNav.vue'
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
