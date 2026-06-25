import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/vocabulary',
      name: 'vocabulary',
      component: () => import('@/views/VocabularyView.vue'),
    },
    {
      path: '/reading',
      name: 'reading',
      component: () => import('@/views/ReadingView.vue'),
    },
    {
      path: '/listening',
      name: 'listening',
      component: () => import('@/views/ListeningView.vue'),
    },
    {
      path: '/writing',
      name: 'writing',
      component: () => import('@/views/WritingView.vue'),
    },
    {
      path: '/speaking',
      name: 'speaking',
      component: () => import('@/views/SpeakingView.vue'),
    },
    {
      path: '/quiz',
      name: 'quiz',
      component: () => import('@/views/DailyQuizView.vue'),
    },
    {
      path: '/exam',
      name: 'exam',
      component: () => import('@/views/ExamPrepView.vue'),
    },
    {
      path: '/news',
      name: 'news',
      component: () => import('@/views/NewsView.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
