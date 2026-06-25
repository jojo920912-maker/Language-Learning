import type { VocabularyWord } from '@/types'

export const japaneseVocabulary: VocabularyWord[] = [
  {
    id: 'ja-001',
    word: '重要（じゅうよう）',
    language: 'ja',
    phonetic: { ipa: '/dʑɯːjoː/', romaji: 'jūyō', pronunciation: 'じゅうよう' },
    partOfSpeech: 'な形容詞 (na-adjective)',
    definition: 'Important; significant; crucial.',
    definitionTranslation: '重要；重大；關鍵',
    examples: [
      {
        text: 'これは重要な会議です。',
        translation: '這是一個重要的會議。',
        highlight: '重要',
      },
      {
        text: '健康は人生で最も重要なことの一つです。',
        translation: '健康是人生中最重要的事情之一。',
        highlight: '重要',
      },
    ],
    level: 'beginner',
    tags: ['JLPT_N4', 'JLPT_N5', 'adjective', 'common'],
    memoryTip: '重(heavy/important) + 要(need/require) = very much needed = important',
  },
  {
    id: 'ja-002',
    word: '経験（けいけん）',
    language: 'ja',
    phonetic: { ipa: '/keːkeɴ/', romaji: 'keiken', pronunciation: 'けいけん' },
    partOfSpeech: '名詞 (noun)',
    definition: 'Experience; practical knowledge gained through doing.',
    definitionTranslation: '經驗；體驗',
    examples: [
      {
        text: '海外での経験がビジネスに役立っています。',
        translation: '海外的工作經驗對商務很有幫助。',
        highlight: '経験',
      },
    ],
    level: 'intermediate',
    tags: ['JLPT_N3', 'JLPT_N4', 'noun', 'work'],
    relatedWords: ['経験者（けいけんしゃ）', '経験豊富（けいけんほうふ）'],
  },
  {
    id: 'ja-003',
    word: '諦める（あきらめる）',
    language: 'ja',
    phonetic: { ipa: '/akiɾameɾɯ/', romaji: 'akirameru', pronunciation: 'あきらめる' },
    partOfSpeech: '動詞 (verb, Group 2)',
    definition: 'To give up; to resign oneself to; to abandon.',
    definitionTranslation: '放棄；死心；認命',
    examples: [
      {
        text: '夢を諦めないでください。',
        translation: '請不要放棄你的夢想。',
        highlight: '諦めない',
      },
      {
        text: '彼は試験に失敗しても諦めなかった。',
        translation: '即使考試失敗了，他也沒有放棄。',
        highlight: '諦めなかった',
      },
    ],
    level: 'intermediate',
    tags: ['JLPT_N3', 'verb', 'emotion'],
  },
  {
    id: 'ja-004',
    word: '迷惑（めいわく）',
    language: 'ja',
    phonetic: { ipa: '/meːwakɯ/', romaji: 'meiwaku', pronunciation: 'めいわく' },
    partOfSpeech: '名詞・な形容詞 (noun/na-adjective)',
    definition: 'Trouble; bother; nuisance; inconvenience.',
    definitionTranslation: '麻煩；困擾；打擾',
    examples: [
      {
        text: 'ご迷惑をおかけして申し訳ありません。',
        translation: '非常抱歉給您添麻煩了。',
        highlight: '迷惑',
      },
      {
        text: '電車の中で大声で話すのは迷惑です。',
        translation: '在電車上大聲說話是很讓人困擾的行為。',
        highlight: '迷惑',
      },
    ],
    level: 'beginner',
    tags: ['JLPT_N4', 'JLPT_N5', 'noun', 'daily-life', 'manners'],
    memoryTip: '日本文化中非常重要的詞，指給別人帶來麻煩的行為',
  },
  {
    id: 'ja-005',
    word: '効率（こうりつ）',
    language: 'ja',
    phonetic: { ipa: '/koːɾitsɯ/', romaji: 'kōritsu', pronunciation: 'こうりつ' },
    partOfSpeech: '名詞 (noun)',
    definition: 'Efficiency; effectiveness.',
    definitionTranslation: '效率；效能',
    examples: [
      {
        text: '仕事の効率を上げるために、タスク管理ツールを使っています。',
        translation: '為了提高工作效率，我使用任務管理工具。',
        highlight: '効率',
      },
    ],
    level: 'intermediate',
    tags: ['JLPT_N2', 'JLPT_N3', 'noun', 'work', 'business'],
    relatedWords: ['効率的（こうりつてき）', '効率化（こうりつか）'],
  },
]
