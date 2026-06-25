<template>
  <div class="container page-content">
    <h1 class="section-title">📡 時事新聞</h1>
    <p class="section-subtitle">透過各國新聞媒體學習真實語言，掌握時事脈動</p>

    <div class="news-sources-grid">
      <a
        v-for="source in newsSources"
        :key="source.language"
        :href="source.url"
        target="_blank"
        rel="noopener noreferrer"
        class="news-source-card card"
      >
        <div class="source-header">
          <span class="source-logo">{{ source.logo }}</span>
          <div>
            <h3 class="source-name">{{ source.name }}</h3>
            <span class="source-lang">{{ source.flag }} {{ source.langName }}</span>
          </div>
        </div>
        <p class="source-desc">{{ source.description }}</p>
        <div class="source-exams">
          <span v-for="exam in source.relatedExams" :key="exam" class="tag">{{ exam }}</span>
        </div>
        <span class="visit-link">前往閱讀 ↗</span>
      </a>
    </div>

    <div class="reading-tips card">
      <h2 class="tips-title">📖 新聞閱讀學習技巧</h2>
      <div class="tips-content">
        <div class="tip-block">
          <h3>🇬🇧 BBC News（英文）</h3>
          <ul>
            <li>BBC Learning English 提供專為學習者設計的內容</li>
            <li>閱讀時注意「五W一H」結構：Who, What, When, Where, Why, How</li>
            <li>BBC Simple English 版本適合初中級學習者</li>
          </ul>
        </div>
        <div class="tip-block">
          <h3>🇯🇵 NHK Web Easy（日文）</h3>
          <ul>
            <li>NHK Web Easy 使用較簡單的日語和漢字標注假名</li>
            <li>可練習新聞常見詞彙如「〜によると」「〜ことがわかりました」</li>
            <li>搭配 N3-N2 等級的漢字學習最有效</li>
          </ul>
        </div>
        <div class="tip-block">
          <h3>🇰🇷 KBS World（韓文）</h3>
          <ul>
            <li>KBS World 提供多國語言版本，可對照學習</li>
            <li>注意新聞韓語常使用「合쇼체」正式敬語</li>
            <li>搭配 TOPIK II 備考效果最佳</li>
          </ul>
        </div>
        <div class="tip-block">
          <h3>🌐 其他語言資源</h3>
          <ul>
            <li>法語：RFI 提供「慢速法語」(Le français facile) 節目</li>
            <li>西語：RTVE 和 El País 為主流媒體</li>
            <li>德語：Deutsche Welle 提供多等級德語學習內容</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const newsSources = [
  { language: 'en', flag: '🇬🇧', logo: '🔴', name: 'BBC News', langName: '英文', url: 'https://www.bbc.com/news', description: '英國廣播公司，全球最具公信力的英語新聞媒體之一，提供深度時事報導', relatedExams: ['TOEIC', 'TOEFL', 'IELTS'] },
  { language: 'en2', flag: '🇺🇸', logo: '🔵', name: 'BBC Learning English', langName: '學習英文', url: 'https://www.bbc.co.uk/learningenglish', description: 'BBC 專為英語學習者設計，提供新聞、文法、詞彙等多元學習資源', relatedExams: ['TOEIC', 'TOEFL', 'IELTS'] },
  { language: 'ja', flag: '🇯🇵', logo: '🔵', name: 'NHK Web Easy', langName: '日文', url: 'https://www3.nhk.or.jp/news/easy/', description: 'NHK 日本放送協會的簡易日語新聞，專為日語學習者設計，附假名標注', relatedExams: ['JLPT N1', 'JLPT N2', 'JLPT N3'] },
  { language: 'ko', flag: '🇰🇷', logo: '🟢', name: 'KBS World', langName: '韓文', url: 'https://world.kbs.co.kr', description: '韓國廣播公社國際頻道，韓國最具代表性的公共廣播媒體', relatedExams: ['TOPIK I', 'TOPIK II'] },
  { language: 'fr', flag: '🇫🇷', logo: '🔷', name: 'RFI Français facile', langName: '法文', url: 'https://www.rfi.fr/fr/podcasts/le-journal-en-francais-facile', description: '法國國際廣播電台提供的簡易法語新聞廣播，語速適合學習者', relatedExams: ['DELF A2', 'DELF B1', 'DELF B2'] },
  { language: 'es', flag: '🇪🇸', logo: '🟡', name: 'RTVE', langName: '西班牙文', url: 'https://www.rtve.es', description: '西班牙國家廣播電視公司，西語世界最具公信力的媒體', relatedExams: ['DELE B1', 'DELE B2'] },
  { language: 'de', flag: '🇩🇪', logo: '⚫', name: 'Deutsche Welle', langName: '德文', url: 'https://www.dw.com/de/deutsch-lernen/s-2055', description: '德意志之聲提供多等級的德語學習課程和時事新聞，適合各程度學習者', relatedExams: ['Goethe A1', 'Goethe B1'] },
  { language: 'zh', flag: '🇨🇳', logo: '🔴', name: 'CRI Online', langName: '中文', url: 'https://news.cri.cn', description: '中國國際廣播電台，提供中文時事新聞和語言學習資源', relatedExams: ['HSK 3', 'HSK 4'] },
]
</script>

<style scoped>
.news-sources-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-bottom: 32px; }
.news-source-card { padding: 20px; text-decoration: none; display: flex; flex-direction: column; gap: 10px; transition: all 0.2s; }
.news-source-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(74,44,23,0.13); }
.source-header { display: flex; align-items: center; gap: 12px; }
.source-logo { font-size: 1.5rem; }
.source-name { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
.source-lang { font-size: 0.78rem; color: var(--text-muted); }
.source-desc { font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; flex: 1; }
.source-exams { display: flex; gap: 6px; flex-wrap: wrap; }
.visit-link { font-size: 0.82rem; font-weight: 700; color: var(--accent); margin-top: auto; }

.reading-tips { padding: 24px; }
.tips-title { font-size: 1.2rem; margin-bottom: 20px; }
.tips-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
.tip-block h3 { font-size: 0.95rem; margin-bottom: 10px; font-family: 'Lato', sans-serif; }
.tip-block ul { padding-left: 16px; display: flex; flex-direction: column; gap: 6px; }
.tip-block li { font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; }

@media (max-width: 600px) { .news-sources-grid { grid-template-columns: 1fr; } }
</style>
