# ☕ Sip & Speak — 語文學習網站

在咖啡香中探索世界語言。支援英文、日文、韓文、中文四種語言的完整學習：44,000+ 單字庫、18 萬+ 自動生成題庫、依程度出題、AI 輔助，涵蓋 TOEIC／JLPT／TOPIK／HSK 等檢定。

![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase)

## 🌐 線上網址

| 環境 | 網址 |
|---|---|
| **Firebase Hosting（主）** | https://language-study-58fd8.web.app |
| GitHub Pages | https://jojo920912-maker.github.io/Language-Learning/ |

---

## 功能總覽

### 支援語言與檢定
| 語言 | 檢定 | 單字庫 | 題庫規模 |
|------|------|-------|---------|
| 🇬🇧 English | TOEIC、TOEFL、IELTS | 11,154 字（含繁中釋義＋例句） | 55,770 題 |
| 🇯🇵 日本語 | JLPT N5～N1 | 8,407 字（漢字＋假名） | 25,221 題 |
| 🇰🇷 한국어 | TOPIK I / II | 6,801 字 | 16,746 題 |
| 🇨🇳 中文 | HSK 1～6 | 27,724 字（繁體＋拼音） | 83,172 題 |

### 📖 單字學習
- 級數選單（JLPT N5~N1、HSK 1~7-9、TOPIK I/II、TOEIC），懶載入不卡頓
- **分類篩選**：英文 15 個主題分類（辦公日常、行銷與銷售、金融與會計…）；中／韓文依詞性（名詞、動詞、形容詞…）；日文依詞尾推斷詞性
- 音標／假名／拼音標注、🔉 TTS 發音、書籤與已學習標記、搜尋

### 📝 題庫引擎（依程度出題，總量 180,909 題）
- 五種題型：詞義選擇、反向選詞、例句克漏字、句子閱讀理解、聽力選答
- **依使用者能力自動調整**：初級一批 250 題／中級 500／高級 1000，答題成績回寫能力值，難度隨進步升級
- 入口：每日測驗「🏃 題庫馬拉松」、閱讀頁「閱讀理解題庫」、聽力頁「聽力題庫」、考試準備（各檢定對應級數出題），皆可提前結算

### ✨ AI 出題（Gemini，選用）
- 個人資料頁填入免費的 Google Gemini API 金鑰後啟用（金鑰只存瀏覽器）
- 閱讀／聽力／寫作／測驗皆可「AI 依程度生成」全新內容

### 聽說讀寫
- **📰 閱讀**：分級文章＋理解題＋題庫練習＋AI 生成
- **🎧 聽力**：情境對話練習題、句子跟讀（可調速 0.7x~1.2x）、聽力題庫
- **✍️ 寫作**：172 題分級寫作題（28 精選＋144 生成），符合程度的優先顯示，含範文與字數統計
- **🎙️ 口說**：跟讀例句、語速調整、音標對照

### 會員系統（Firebase）
- Email/Password 註冊登入、寄信重設密碼（自訂咖啡廳風格重設頁 `/auth-action`）
- 個人資料（暱稱/頭像/每日目標/學習語言）存 Firestore `users/{uid}`
- 學習進度雲端同步 `users/{uid}/progress/data`（1 秒 debounce），跨裝置延續
- 路由保護與登入狀態自動還原

---

## 技術架構

```
src/
├── components/
│   ├── layout/        # AppHeader、MobileBottomNav
│   ├── quiz/          # QuizCard、BankPractice（題庫練習元件）
│   └── vocabulary/    # WordCard
├── composables/       # useTextToSpeech（Web Speech API）、useAI（Gemini）
├── data/
│   ├── {en,ja,ko,zh}/{exam}/words.json   # 44k 單字（lazy chunk）
│   ├── decks.ts       # 級數設定與懶載入
│   ├── questionBank.ts# 題庫引擎（5 題型 × 分級 × 依程度批量）
│   ├── quizGenerator.ts / quizzes.ts / articles.ts / writingPrompts.ts
│   └── sentencePractice.ts
├── firebase.ts        # Firebase 初始化（Auth + Firestore）
├── stores/            # language / progress（Firestore 同步）/ user（Firebase Auth）
└── views/             # 首頁、單字、閱讀、聽力、寫作、口說、每日測驗、考試準備、個人資料、auth/
scripts/convert-*.mjs  # 原始資料 → words.json 轉換腳本
```

**Tech Stack：** Vue 3（Composition API）+ TypeScript + Vite 8 + Pinia + Vue Router 4 + Firebase（Auth/Firestore/Hosting）+ Web Speech API + Google Gemini（選用）

**單字資料來源（開源）：** JLPT_Vocabulary、complete-hsk-vocabulary、combined_korean_vocabulary_list、toeic-vocab-tw（Hugging Face）

---

## 快速開始

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 型別檢查＋建置（Firebase 用，base=/）
npm run build:gh   # GitHub Pages 用（base=/Language-Learning/）
```

### 部署
- **Firebase**：`npm run build` → `npx firebase-tools deploy --only hosting`
- **GitHub Pages**：push 到 main 自動部署（Actions 內用 build:gh）
- 兩個目標 base path 不同，勿混用產物；部署後請驗證頁面資產路徑

### Firebase 設定
1. [Firebase Console](https://console.firebase.google.com/) 建專案，設定值替換 `src/firebase.ts`
2. Authentication 啟用 **Email/Password**；Templates 的動作網址設為 `https://<你的網域>/auth-action`
3. Firestore 規則：僅允許本人讀寫 `users/{uid}/**`

---

## RWD 支援
手機（<900px，底部 Tab Bar）／平板（漢堡選單）／桌機（完整導覽列）。

## 開發備忘
- 新增單字：改 `raw-data/` 後跑對應 `scripts/convert-*.mjs`
- 日/韓/中單字尚有 `needsTranslation: true` 待批次補繁中釋義（backlog）
- 詳細開發守則見專案根目錄 `CLAUDE.md`
