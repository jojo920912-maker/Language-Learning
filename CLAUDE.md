# Sip & Speak（language-learning）專案守則

Vue 3 + TypeScript + Vite + Pinia + Firebase（Auth + Firestore + Hosting）。
使用者要求：每完成一件事 → **更新 README.md** → commit + push（訊息寫暫存檔用 `git commit -F`）。README 的功能表／題庫數據／架構圖要跟實況一致。

## ⚠️ 雙部署目標（本專案最大陷阱，曾造成三次白畫面事故）

| 目標 | 網址 | base path | 部署方式 |
|---|---|---|---|
| Firebase Hosting（主） | https://language-study-58fd8.web.app | `/` | `npm run build` → `npx firebase-tools deploy --only hosting` |
| GitHub Pages | https://jojo920912-maker.github.io/Language-Learning/ | `/Language-Learning/` | push 到 main 自動跑 Actions（workflow 用 `npm run build:gh`） |

**規則：**
1. 本地 `npm run build` 產出的 dist 只能 deploy 到 Firebase；**絕不**手動把它放上 GitHub Pages。
2. 部署後必須驗證（deploy 成功訊息不算數）。**下列指令用 Bash 工具跑**（PowerShell 沒有 grep）：
   ```bash
   curl -s https://language-study-58fd8.web.app/ | grep -o 'src="[^"]*"'          # 應為 /assets/...
   curl -s https://jojo920912-maker.github.io/Language-Learning/ | grep -o 'src="[^"]*"'  # 應為 /Language-Learning/assets/...
   ```
3. Pages 的 Actions 偶爾在最後 Deploy 步驟隨機失敗 → 空 commit 重推一次即可；連續兩次失敗才需要深查。
4. 使用者回報「畫面白的／按了沒反應」→ 先確認他開的是哪個網址 + 請他 Ctrl+Shift+R，再動程式碼。改版後舊分頁的 chunk 404 已有自動 reload 防護（router.onError in `src/router/index.ts`）。

## 架構速查
- 資料：`src/data/{en,ja,ko,zh}/{exam}/words.json`（44k 單字，lazy load via `src/data/decks.ts`）；文章 `articles.ts`；寫作題 `writingPrompts.ts`；題庫 `quizzes.ts`
- 自動出題：`src/data/questionBank.ts`（題庫引擎，5 題型 × 分級 × 依程度批量）＋ `src/data/quizGenerator.ts`（單字題）。**AI/Gemini 功能已於 2026-07 依使用者要求整個移除，勿再加回**
- 帳號：Firebase Auth（`src/stores/user.ts`）；學習進度存 Firestore `users/{uid}/progress/data`（`src/stores/progress.ts`，1 秒 debounce）
- 支援語言只有 en/ja/ko/zh（`Language` type）；新增語言要同步改 types、languages.ts、decks.ts、progress.ts 的 ALL_LANGS
- 轉換腳本在 `scripts/convert-*.mjs`，原始資料 `raw-data/`（已 gitignore，遺失可照 scripts 開頭註解重抓）

## 驗證方式
- Build：`npm run build 2>&1 | Select-String -Pattern "error TS|error during|✓ built" | Select-Object -First 10`
- 本地跑：`.claude/launch.json` 的 `lingua-cafe`（注意 vite 要帶專案路徑位置參數）
- Firebase Console：https://console.firebase.google.com/project/language-study-58fd8
- 測試帳號：`claude.test.sipspeak@example.com`（Firebase Auth 裡，使用者知情；密碼問使用者，勿寫進 repo）

## 已知未完成（backlog）
- 階段 6：ja/ko/zh 單字的 `needsTranslation: true` 批次補繁中釋義與例句（先補 JLPT N5、TOPIK I）
- 首頁技能進度條在新帳號全為 0，屬正常（做了測驗才會動）
