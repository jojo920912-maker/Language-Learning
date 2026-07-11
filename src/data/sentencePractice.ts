import type { Language } from '@/types'
import { loadDeck } from './decks'

export interface SentenceItem {
  text: string
  translation: string
  source: string
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

/** 日／韓／中的句子練習庫（繁中翻譯，依生活情境分類、由易到難） */
const CURATED: Partial<Record<Language, SentenceItem[]>> = {
  ja: [
    { text: 'おはようございます。今日はいい天気ですね。', translation: '早安。今天天氣真好呢。', source: '日常寒暄' },
    { text: 'すみません、駅はどこですか。', translation: '不好意思，車站在哪裡？', source: '問路' },
    { text: 'この料理はとてもおいしいです。', translation: '這道菜非常好吃。', source: '用餐' },
    { text: '週末は友達と映画を見に行きます。', translation: '週末要和朋友去看電影。', source: '日常' },
    { text: '日本語を勉強するのは楽しいです。', translation: '學習日語很有趣。', source: '學習' },
    { text: 'すみませんが、もう一度お願いします。', translation: '不好意思，請再說一次。', source: '溝通' },
    { text: '明日の会議は午後三時からです。', translation: '明天的會議從下午三點開始。', source: '職場' },
    { text: '電車が遅れているので、少し遅れます。', translation: '因為電車誤點，我會晚一點到。', source: '職場' },
    { text: '駅前の新しいレストランに行ってみたいです。', translation: '我想去車站前那家新開的餐廳看看。', source: '生活' },
    { text: '健康のために毎朝ジョギングをしています。', translation: '為了健康，我每天早上都會慢跑。', source: '健康' },
    { text: 'このプロジェクトを来月までに完成させる必要があります。', translation: '這個專案必須在下個月之前完成。', source: '商務' },
    { text: '環境問題は世界中で深刻になっています。', translation: '環境問題在全世界都日益嚴重。', source: '時事' },
  ],
  ko: [
    { text: '안녕하세요. 만나서 반갑습니다.', translation: '您好，很高興認識您。', source: '打招呼' },
    { text: '이거 얼마예요?', translation: '這個多少錢？', source: '購物' },
    { text: '한국 음식을 정말 좋아해요.', translation: '我真的很喜歡韓國料理。', source: '飲食' },
    { text: '주말에 뭐 할 거예요?', translation: '週末你要做什麼？', source: '日常' },
    { text: '한국어 공부가 재미있어요.', translation: '學韓語很有趣。', source: '學習' },
    { text: '죄송하지만 다시 한 번 말씀해 주세요.', translation: '不好意思，請再說一次。', source: '溝通' },
    { text: '내일 아침 아홉 시에 회의가 있어요.', translation: '明天早上九點有會議。', source: '職場' },
    { text: '지하철이 버스보다 더 빨라요.', translation: '地鐵比公車更快。', source: '交通' },
    { text: '요즘 날씨가 많이 추워졌어요.', translation: '最近天氣變得很冷。', source: '生活' },
    { text: '건강을 위해 매일 운동을 합니다.', translation: '為了健康，我每天都運動。', source: '健康' },
    { text: '이 프로젝트는 다음 달까지 끝내야 합니다.', translation: '這個專案必須在下個月之前完成。', source: '商務' },
    { text: '한류가 전 세계적으로 인기를 얻고 있습니다.', translation: '韓流正在全世界受到歡迎。', source: '時事' },
  ],
  zh: [
    { text: '你好，很高興認識你。', translation: '你好，很高興認識你。（Nǐ hǎo, hěn gāoxìng rènshi nǐ.）', source: '打招呼' },
    { text: '請問洗手間在哪裡？', translation: '請問洗手間在哪裡？（Qǐngwèn xǐshǒujiān zài nǎlǐ?）', source: '問路' },
    { text: '這道菜真好吃。', translation: '這道菜真好吃。（Zhè dào cài zhēn hǎochī.）', source: '用餐' },
    { text: '週末我打算去爬山。', translation: '週末我打算去爬山。（Zhōumò wǒ dǎsuàn qù páshān.）', source: '日常' },
    { text: '學中文越來越有意思。', translation: '學中文越來越有意思。（Xué Zhōngwén yuèláiyuè yǒu yìsi.）', source: '學習' },
    { text: '對不起，請你再說一遍。', translation: '對不起，請你再說一遍。（Duìbùqǐ, qǐng nǐ zài shuō yí biàn.）', source: '溝通' },
    { text: '明天下午三點開會。', translation: '明天下午三點開會。（Míngtiān xiàwǔ sān diǎn kāihuì.）', source: '職場' },
    { text: '高鐵比坐飛機還方便。', translation: '高鐵比坐飛機還方便。（Gāotiě bǐ zuò fēijī hái fāngbiàn.）', source: '交通' },
    { text: '最近天氣變化很大，要注意身體。', translation: '最近天氣變化很大，要注意身體。', source: '生活' },
    { text: '為了健康，我每天都會運動。', translation: '為了健康，我每天都會運動。', source: '健康' },
    { text: '這個專案下個月之前必須完成。', translation: '這個專案下個月之前必須完成。', source: '商務' },
    { text: '人工智慧正在改變我們的生活。', translation: '人工智慧正在改變我們的生活。', source: '時事' },
  ],
}

/**
 * 從單字庫的例句取出「句子＋翻譯」，供聽力跟讀／朗讀練習使用。
 * 英文取自 TOEIC 單字庫例句（帶繁中翻譯）；日／韓／中取自 CURATED 句子庫。
 */
export async function loadSentencePractice(
  lang: Language,
  deckId: string,
  count = 20,
): Promise<SentenceItem[]> {
  if (lang === 'en') {
    const words = await loadDeck(lang, deckId)
    const withExample = words.filter((w) => w.exampleSentence && w.exampleTranslation)
    return shuffle(withExample)
      .slice(0, count)
      .map((w) => ({
        text: w.exampleSentence as string,
        translation: w.exampleTranslation as string,
        source: w.word,
      }))
  }
  return shuffle(CURATED[lang] ?? []).slice(0, count)
}
