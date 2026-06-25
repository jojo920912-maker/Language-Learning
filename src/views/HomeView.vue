<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              <span class="hero-emoji">☕</span>
              在咖啡香中<br>探索世界語言
            </h1>
            <p class="hero-subtitle">
              輕鬆愉快地學習英、日、韓、法、西、德文，準備多益、托福、JLPT 等各類考試
            </p>
            <div class="hero-actions">
              <RouterLink to="/vocabulary" class="btn btn-primary">📖 開始學單字</RouterLink>
              <RouterLink to="/quiz" class="btn btn-ghost">📝 今日測驗</RouterLink>
            </div>
          </div>
          <div class="hero-decoration">
            <div class="deco-cup">☕</div>
            <div class="deco-flags">
              <span v-for="lang in languages" :key="lang.code" class="deco-flag">{{ lang.flag }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Banner -->
    <section class="stats-banner" v-if="progress">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-icon">🔥</span>
            <div>
              <p class="stat-value">{{ progress.dailyStreak }}</p>
              <p class="stat-label">連續天數</p>
            </div>
          </div>
          <div class="stat-item">
            <span class="stat-icon">📖</span>
            <div>
              <p class="stat-value">{{ progress.vocabulary.learned }}</p>
              <p class="stat-label">已學單字</p>
            </div>
          </div>
          <div class="stat-item">
            <span class="stat-icon">⭐</span>
            <div>
              <p class="stat-value">{{ progress.totalPoints }}</p>
              <p class="stat-label">累積點數</p>
            </div>
          </div>
          <div class="stat-item">
            <span class="stat-icon">📝</span>
            <div>
              <p class="stat-value">{{ progress.completedQuizzes }}</p>
              <p class="stat-label">完成測驗</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="container page-content">
      <!-- Language Selector -->
      <section class="lang-section">
        <h2 class="section-title">選擇學習語言</h2>
        <p class="section-subtitle">選擇你想學習的語言，開始今天的學習旅程</p>
        <div class="lang-grid">
          <button
            v-for="lang in languages"
            :key="lang.code"
            class="lang-card"
            :class="{ active: currentLanguage === lang.code }"
            @click="selectLanguage(lang.code)"
          >
            <span class="lang-flag">{{ lang.flag }}</span>
            <span class="lang-card-name">{{ lang.nativeName }}</span>
            <span class="lang-card-en">{{ lang.name }}</span>
            <div class="lang-exams">
              <span v-for="exam in lang.exams.slice(0, 2)" :key="exam" class="tag">{{ EXAM_LABELS[exam] }}</span>
              <span v-if="lang.exams.length > 2" class="tag">+{{ lang.exams.length - 2 }}</span>
            </div>
          </button>
        </div>
      </section>

      <!-- Feature Cards -->
      <section class="features-section">
        <h2 class="section-title">學習功能</h2>
        <p class="section-subtitle">多元化的學習方式，聽說讀寫全方位提升</p>
        <div class="features-grid">
          <RouterLink v-for="feature in features" :key="feature.to" :to="feature.to" class="feature-card card">
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
            <span class="feature-link">開始練習 →</span>
          </RouterLink>
        </div>
      </section>

      <!-- Exam Prep Banner -->
      <section class="exam-banner card">
        <div class="exam-banner-content">
          <div>
            <h2 class="exam-banner-title">🎯 考試準備專區</h2>
            <p class="exam-banner-desc">針對多益、托福、雅思、JLPT、TOPIK 等考試，提供專屬練習題目與策略</p>
          </div>
          <RouterLink to="/exam" class="btn btn-primary">前往備考 →</RouterLink>
        </div>
        <div class="exam-logos">
          <span v-for="exam in featuredExams" :key="exam" class="exam-chip">{{ EXAM_LABELS[exam] }}</span>
        </div>
      </section>

      <!-- Skill Progress -->
      <section class="skills-section" v-if="progress">
        <h2 class="section-title">技能進度 <span class="lang-indicator">{{ currentConfig.flag }} {{ currentConfig.name }}</span></h2>
        <div class="skills-grid">
          <div v-for="(level, skill) in progress.skillLevels" :key="skill" class="skill-row">
            <div class="skill-label-row">
              <span class="skill-icon">{{ skillIcons[skill] }}</span>
              <span class="skill-name">{{ skillNames[skill] }}</span>
              <span class="skill-pct">{{ level }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-bar-fill" :style="{ width: level + '%' }" />
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useLanguageStore } from '@/stores/language'
import { useProgressStore } from '@/stores/progress'
import { LANGUAGES, EXAM_LABELS } from '@/data/languages'
import type { Language, ExamType } from '@/types'

const langStore = useLanguageStore()
const progressStore = useProgressStore()

const currentLanguage = computed(() => langStore.currentLanguage)
const currentConfig = computed(() => langStore.currentConfig)
const progress = computed(() => progressStore.getProgress(currentLanguage.value))
const languages = LANGUAGES

const featuredExams: ExamType[] = ['TOEIC', 'TOEFL', 'JLPT_N2', 'TOPIK_II', 'DELF_B1', 'DELE_B1']

const features = [
  { to: '/vocabulary', icon: '📖', title: '單字學習', desc: '透過 KK 音標、發音播放、例句與記憶訣竅，輕鬆記住新單字' },
  { to: '/reading', icon: '📰', title: '閱讀練習', desc: '搭配 BBC、NHK 等新聞媒體的時事文章，提升閱讀理解能力' },
  { to: '/listening', icon: '🎧', title: '聽力訓練', desc: '多種聽力題型練習，從日常對話到學術演講，全面提升聽力' },
  { to: '/writing', icon: '✍️', title: '寫作練習', desc: '針對各類考試的寫作題型，提供範文與寫作技巧指導' },
  { to: '/speaking', icon: '🎙️', title: '口說練習', desc: '透過語音合成與跟讀練習，改善發音與口說流暢度' },
  { to: '/quiz', icon: '📝', title: '每日測驗', desc: '每天更新的測驗題目，持續挑戰自己，鞏固學習成效' },
]

const skillIcons: Record<string, string> = {
  listening: '🎧', reading: '📰', writing: '✍️', speaking: '🎙️', vocabulary: '📖', grammar: '🔤',
}
const skillNames: Record<string, string> = {
  listening: '聽力', reading: '閱讀', writing: '寫作', speaking: '口說', vocabulary: '單字', grammar: '文法',
}

function selectLanguage(code: Language) {
  langStore.setLanguage(code)
}
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, var(--color-foam) 0%, rgba(200, 151, 58, 0.08) 50%, var(--color-cream) 100%);
  border-bottom: 1px solid var(--border);
  padding: 60px 0 48px;
}
.hero-content { display: flex; align-items: center; gap: 48px; }
.hero-text { flex: 1; }
.hero-title { font-size: clamp(2rem, 5vw, 3rem); font-weight: 600; line-height: 1.2; margin-bottom: 16px; }
.hero-emoji { font-size: 2.5rem; display: block; margin-bottom: 8px; }
.hero-subtitle { font-size: 1.05rem; color: var(--text-muted); margin-bottom: 28px; line-height: 1.7; }
.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.hero-decoration { display: flex; flex-direction: column; align-items: center; gap: 20px; flex-shrink: 0; }
.deco-cup { font-size: 5rem; animation: pulse 3s ease infinite; }
.deco-flags { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; max-width: 160px; }
.deco-flag { font-size: 1.6rem; cursor: default; }

.stats-banner { background: var(--accent); padding: 16px 0; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
.stat-item { display: flex; align-items: center; gap: 12px; padding: 8px 20px; border-right: 1px solid rgba(255,255,255,0.2); justify-content: center; }
.stat-item:last-child { border-right: none; }
.stat-icon { font-size: 1.5rem; }
.stat-value { font-size: 1.4rem; font-weight: 700; color: #fff; line-height: 1; }
.stat-label { font-size: 0.72rem; color: rgba(255,255,255,0.8); margin-top: 2px; }

.lang-section { margin-bottom: 48px; }
.lang-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; }
.lang-card { background: var(--bg-card); border: 2px solid var(--border); border-radius: var(--radius-md); padding: 20px 16px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s; text-align: center; }
.lang-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: var(--shadow-card); }
.lang-card.active { border-color: var(--accent); background: rgba(200, 151, 58, 0.06); }
.lang-flag { font-size: 2.2rem; }
.lang-card-name { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); }
.lang-card-en { font-size: 0.78rem; color: var(--text-muted); }
.lang-exams { display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; margin-top: 4px; }

.features-section { margin-bottom: 40px; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.feature-card { padding: 24px; display: flex; flex-direction: column; gap: 8px; text-decoration: none; transition: all 0.2s; }
.feature-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(74, 44, 23, 0.13); }
.feature-icon { font-size: 2rem; }
.feature-title { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }
.feature-desc { font-size: 0.88rem; color: var(--text-muted); line-height: 1.6; flex: 1; }
.feature-link { font-size: 0.82rem; font-weight: 700; color: var(--accent); margin-top: 4px; }

.exam-banner { padding: 28px 28px 20px; margin-bottom: 40px; background: linear-gradient(135deg, rgba(200, 151, 58, 0.08), rgba(184, 169, 201, 0.08)); }
.exam-banner-content { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 16px; flex-wrap: wrap; }
.exam-banner-title { font-size: 1.4rem; margin-bottom: 6px; }
.exam-banner-desc { font-size: 0.9rem; color: var(--text-muted); max-width: 500px; }
.exam-logos { display: flex; gap: 8px; flex-wrap: wrap; }
.exam-chip { padding: 4px 12px; background: rgba(200, 151, 58, 0.12); border: 1px solid rgba(200, 151, 58, 0.3); border-radius: 20px; font-size: 0.78rem; font-weight: 700; color: var(--accent); }

.skills-section { margin-bottom: 40px; }
.lang-indicator { font-size: 1rem; font-weight: 400; color: var(--text-muted); margin-left: 10px; }
.skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; margin-top: 20px; }
.skill-row { background: var(--bg-card); border-radius: var(--radius-sm); padding: 14px 16px; border: 1px solid var(--border); }
.skill-label-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.skill-icon { font-size: 1rem; }
.skill-name { flex: 1; font-size: 0.88rem; font-weight: 700; color: var(--text-secondary); }
.skill-pct { font-size: 0.82rem; font-weight: 700; color: var(--accent); }

@media (max-width: 768px) {
  .hero { padding: 40px 0 32px; }
  .hero-content { flex-direction: column; gap: 24px; }
  .hero-decoration { display: none; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .stat-item { border-bottom: 1px solid rgba(255,255,255,0.2); }
  .stat-item:nth-child(odd) { border-right: 1px solid rgba(255,255,255,0.2); }
  .stat-item:last-child, .stat-item:nth-last-child(2) { border-bottom: none; }
}
</style>
