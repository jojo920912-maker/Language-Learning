import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Auth routes (no login required)
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { guest: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/auth/ForgotPasswordView.vue'),
      meta: { guest: true },
    },

    // Protected routes
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/vocabulary',
      name: 'vocabulary',
      component: () => import('@/views/VocabularyView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/reading',
      name: 'reading',
      component: () => import('@/views/ReadingView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/listening',
      name: 'listening',
      component: () => import('@/views/ListeningView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/writing',
      name: 'writing',
      component: () => import('@/views/WritingView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/speaking',
      name: 'speaking',
      component: () => import('@/views/SpeakingView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/quiz',
      name: 'quiz',
      component: () => import('@/views/DailyQuizView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/exam',
      name: 'exam',
      component: () => import('@/views/ExamPrepView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/news',
      name: 'news',
      component: () => import('@/views/NewsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guest && userStore.isLoggedIn) {
    return { name: 'home' }
  }
})

export default router
