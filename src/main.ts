import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 等待 Firebase Auth 還原登入狀態後再掛載，
// 避免重新整理時 router guard 誤判為未登入
const userStore = useUserStore()
userStore.init().then(() => {
  app.mount('#app')
})
