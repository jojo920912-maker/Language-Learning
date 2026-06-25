# ☕ LinguaCafé — 語文學習網站

在咖啡香中探索世界語言。輕鬆愉快地學習英、日、韓、法、西、德文，準備多益、托福、JLPT 等各類考試。

![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite)
![Pinia](https://img.shields.io/badge/Pinia-2.x-F7D336?logo=pinia)

---

## 功能特色

### 支援語言
| 語言 | 旗幟 | 支援考試 |
|------|------|---------|
| English | 🇬🇧 | TOEIC、TOEFL、IELTS |
| 日本語 | 🇯🇵 | JLPT N1 ~ N5 |
| 한국어 | 🇰🇷 | TOPIK I、TOPIK II |
| Français | 🇫🇷 | DELF A1 ~ B2 |
| Español | 🇪🇸 | DELE A1 ~ B2 |
| Deutsch | 🇩🇪 | Goethe A1、B1 |
| 中文 | 🇨🇳 | HSK 1 ~ 4 |

### 學習功能
- **📖 單字學習** — KK 音標 / IPA / 羅馬字標注，點擊按鈕即可播放 TTS 發音，附範例句子、中文解說、記憶訣竅，支援書籤與已學習標記
- **📰 閱讀練習** — 搭配 BBC News、NHK Web Easy、KBS World 等官方新聞媒體，點擊全文朗讀，含閱讀理解測驗
- **🎧 聽力訓練** — 逐字稿播放，可調整 0.7x ~ 1.2x 速度，涵蓋商業對話、新聞播報等場景
- **✍️ 寫作練習** — 考試題型寫作（TOEFL、JLPT、TOPIK 等），字數即時統計，提供範文參考與作文朗讀
- **🎙️ 口說練習** — 跟讀例句，附音標與拼音，可調速，搭配 Shadow Listening 技巧
- **📝 每日測驗** — 選擇題 / 填空題，依語言、技能類型、題數自由組合，完成後顯示解析與得分
- **🎯 考試準備** — 針對 TOEIC、TOEFL、IELTS、JLPT、TOPIK、DELF、DELE、Goethe、HSK 提供專屬題型、考試攻略與備考建議
- **📡 時事新聞** — 各語言官方新聞媒體直達連結，含閱讀學習技巧

### 時事新聞來源
| 語言 | 媒體 |
|------|------|
| 英文 | BBC News、BBC Learning English |
| 日文 | NHK Web Easy |
| 韓文 | KBS World |
| 法文 | RFI Français facile |
| 西班牙文 | RTVE |
| 德文 | Deutsche Welle |
| 中文 | CRI Online |

---

## 技術架構

```
language-learning/
├── src/
│   ├── assets/          # 全域 CSS（咖啡廳主題設計）
│   ├── components/
│   │   ├── layout/      # AppHeader、MobileBottomNav
│   │   ├── quiz/        # QuizCard（題目元件）
│   │   └── vocabulary/  # WordCard（單字卡元件）
│   ├── composables/
│   │   └── useTextToSpeech.ts   # Web Speech API TTS
│   ├── data/
│   │   ├── articles.ts          # 閱讀文章資料
│   │   ├── languages.ts         # 語言設定與新聞來源
│   │   ├── quizzes.ts           # 測驗題目庫
│   │   └── vocabulary/          # 各語言單字庫
│   ├── router/          # Vue Router 路由設定
│   ├── stores/
│   │   ├── language.ts  # 語言選擇 Store
│   │   └── progress.ts  # 學習進度 Store
│   ├── types/           # TypeScript 類型定義
│   └── views/           # 各功能頁面
│       ├── HomeView.vue
│       ├── VocabularyView.vue
│       ├── ReadingView.vue
│       ├── ListeningView.vue
│       ├── WritingView.vue
│       ├── SpeakingView.vue
│       ├── DailyQuizView.vue
│       ├── ExamPrepView.vue
│       └── NewsView.vue
```

**Tech Stack：**
- **框架：** Vue 3 (Composition API) + TypeScript
- **建置工具：** Vite 8
- **狀態管理：** Pinia
- **路由：** Vue Router 4
- **工具函式：** VueUse
- **字體：** Google Fonts (Playfair Display, Lato, Noto Sans JP/KR)
- **TTS：** Web Speech API（瀏覽器內建，無需 API Key）

---

## 快速開始

### 環境需求
- Node.js 18+
- npm 9+

### 安裝與執行

```bash
# 安裝依賴
npm install

# 開發模式（支援 HMR 熱更新）
npm run dev

# 類型檢查 + 生產建置
npm run build

# 預覽生產版本
npm run preview
```

開啟瀏覽器至 `http://localhost:5173`

---

## RWD 支援

| 裝置 | 斷點 | 導航方式 |
|------|------|---------|
| 手機 | < 900px | 底部 Tab Bar |
| 平板 | 900px ~ 1200px | 頂部漢堡選單 |
| 電腦 | > 1200px | 頂部完整導覽列 |

---

## 開發說明

### 新增單字
在 `src/data/vocabulary/` 下對應語言檔案新增 `VocabularyWord` 物件：

```typescript
{
  id: 'en-xxx',
  word: 'example',
  language: 'en',
  phonetic: { ipa: '/ɪɡˈzæmpəl/', kk: '/ɪɡˈzæmpəl/' },
  partOfSpeech: 'noun',
  definition: 'A thing characteristic of its kind.',
  definitionTranslation: '範例；例子',
  examples: [{ text: 'This is an example.', translation: '這是一個例子。' }],
  level: 'beginner',
  tags: ['TOEIC', 'noun'],
}
```

### 新增測驗題目
在 `src/data/quizzes.ts` 的 `dailyQuizzes` 陣列新增 `QuizQuestion` 物件。

### 新增閱讀文章
在 `src/data/articles.ts` 的 `articles` 陣列新增 `Article` 物件（可附帶閱讀理解題）。

---

## IDE 建議設定

- **編輯器：** [VS Code](https://code.visualstudio.com/)
- **必裝擴充：** [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar)（請停用 Vetur）
- **瀏覽器擴充：** [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
