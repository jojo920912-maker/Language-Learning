import type { LanguageConfig } from '@/types'

export const LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    ttsLang: 'en-US',
    newsSource: { name: 'BBC News', url: 'https://www.bbc.com/news', language: 'en', logo: '🔴' },
    exams: ['TOEIC', 'TOEFL', 'IELTS'],
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    ttsLang: 'ja-JP',
    newsSource: { name: 'NHK Web Easy', url: 'https://www3.nhk.or.jp/news/easy/', language: 'ja', logo: '🔵' },
    exams: ['JLPT_N1', 'JLPT_N2', 'JLPT_N3', 'JLPT_N4', 'JLPT_N5'],
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    ttsLang: 'ko-KR',
    newsSource: { name: 'KBS World', url: 'https://world.kbs.co.kr', language: 'ko', logo: '🟢' },
    exams: ['TOPIK_I', 'TOPIK_II'],
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    ttsLang: 'zh-CN',
    newsSource: { name: 'CRI Online', url: 'http://www.cri.cn', language: 'zh', logo: '🔴' },
    exams: ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'],
  },
]

export const EXAM_LABELS: Record<string, string> = {
  TOEIC: 'TOEIC',
  TOEFL: 'TOEFL',
  IELTS: 'IELTS',
  JLPT_N1: 'JLPT N1',
  JLPT_N2: 'JLPT N2',
  JLPT_N3: 'JLPT N3',
  JLPT_N4: 'JLPT N4',
  JLPT_N5: 'JLPT N5',
  TOPIK_I: 'TOPIK I',
  TOPIK_II: 'TOPIK II',
  HSK1: 'HSK 1',
  HSK2: 'HSK 2',
  HSK3: 'HSK 3',
  HSK4: 'HSK 4',
  HSK5: 'HSK 5',
  HSK6: 'HSK 6',
}
