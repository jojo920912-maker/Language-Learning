import type { VocabularyWord } from '@/types'

export const koreanVocabulary: VocabularyWord[] = [
  {
    id: 'ko-001',
    word: '중요하다 (重要하다)',
    language: 'ko',
    phonetic: { ipa: '/tɕuŋjo.ɦa.da/', romaji: 'jungyohada', pronunciation: '중요하다' },
    partOfSpeech: '형용사 (adjective)',
    definition: 'To be important; to be significant.',
    definitionTranslation: '重要；重要的',
    examples: [
      {
        text: '건강은 매우 중요합니다.',
        translation: '健康非常重要。',
        highlight: '중요합니다',
      },
      {
        text: '이 프로젝트는 회사에 중요한 역할을 합니다.',
        translation: '這個專案對公司扮演著重要的角色。',
        highlight: '중요한',
      },
    ],
    level: 'beginner',
    tags: ['TOPIK_I', 'adjective', 'common'],
  },
  {
    id: 'ko-002',
    word: '경험 (經驗)',
    language: 'ko',
    phonetic: { ipa: '/kjʌŋhʌm/', romaji: 'gyeongheom', pronunciation: '경험' },
    partOfSpeech: '명사 (noun)',
    definition: 'Experience; practical knowledge.',
    definitionTranslation: '經驗；體驗',
    examples: [
      {
        text: '다양한 경험이 도움이 됩니다.',
        translation: '多樣的經驗很有幫助。',
        highlight: '경험',
      },
    ],
    level: 'beginner',
    tags: ['TOPIK_I', 'noun', 'common'],
    relatedWords: ['경험하다', '경험자'],
  },
  {
    id: 'ko-003',
    word: '노력하다 (努力하다)',
    language: 'ko',
    phonetic: { ipa: '/no.ɾjʌk.ha.da/', romaji: 'noryeokada', pronunciation: '노력하다' },
    partOfSpeech: '동사 (verb)',
    definition: 'To make an effort; to try hard; to strive.',
    definitionTranslation: '努力；盡力；奮鬥',
    examples: [
      {
        text: '목표를 달성하기 위해 매일 노력합니다.',
        translation: '為了達成目標，每天都在努力。',
        highlight: '노력합니다',
      },
      {
        text: '포기하지 말고 계속 노력하세요.',
        translation: '不要放棄，請繼續努力。',
        highlight: '노력하세요',
      },
    ],
    level: 'beginner',
    tags: ['TOPIK_I', 'TOPIK_II', 'verb'],
    relatedWords: ['노력', '노력가'],
  },
  {
    id: 'ko-004',
    word: '감사하다 (感謝하다)',
    language: 'ko',
    phonetic: { ipa: '/kam.sa.ɦa.da/', romaji: 'gamsahada', pronunciation: '감사하다' },
    partOfSpeech: '동사/형용사 (verb/adjective)',
    definition: 'To be grateful; to be thankful.',
    definitionTranslation: '感謝；感激',
    examples: [
      {
        text: '도와주셔서 감사합니다.',
        translation: '感謝您的幫助。',
        highlight: '감사합니다',
      },
      {
        text: '매일 감사한 마음으로 생활합니다.',
        translation: '每天帶著感謝的心生活。',
        highlight: '감사한',
      },
    ],
    level: 'beginner',
    tags: ['TOPIK_I', 'common', 'politeness'],
    memoryTip: '감사합니다 (gamsahamnida) is the most common "thank you" in Korean',
  },
  {
    id: 'ko-005',
    word: '발전하다 (發展하다)',
    language: 'ko',
    phonetic: { ipa: '/pal.tɕʌn.ɦa.da/', romaji: 'baljeonhada', pronunciation: '발전하다' },
    partOfSpeech: '동사 (verb)',
    definition: 'To develop; to advance; to make progress.',
    definitionTranslation: '發展；進步；進步',
    examples: [
      {
        text: '기술이 빠르게 발전하고 있습니다.',
        translation: '技術正在快速發展。',
        highlight: '발전하고',
      },
    ],
    level: 'intermediate',
    tags: ['TOPIK_II', 'verb', 'society'],
    relatedWords: ['발전', '발전적'],
  },
]
