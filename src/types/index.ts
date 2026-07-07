export type Language = 'en' | 'ja' | 'ko' | 'zh'

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  avatar: string
  createdAt: string
  learningLanguages: Language[]
  targetExam?: string
  dailyGoalMinutes: number
}

export interface AuthState {
  currentUser: User | null
  isLoggedIn: boolean
}

/** 單字庫統一格式：src/data/{lang}/{exam}/words.json 每筆的結構 */
export interface WordEntry {
  word: string
  /** 日文=假名、中文=拼音、韓文=發音；英文為 null */
  reading: string | null
  /** 繁體中文釋義（needsTranslation 為 true 時是英文原文或空字串，待批次翻譯） */
  meaning: string
  /** 檢定級數，如 "N5"、"HSK1"、"TOEIC"、"TOPIK I" */
  level: string
  exampleSentence: string | null
  exampleTranslation: string | null
  needsTranslation?: boolean
}

export type ExamType =
  | 'TOEIC'
  | 'TOEFL'
  | 'IELTS'
  | 'JLPT_N1'
  | 'JLPT_N2'
  | 'JLPT_N3'
  | 'JLPT_N4'
  | 'JLPT_N5'
  | 'TOPIK_I'
  | 'TOPIK_II'
  | 'HSK1'
  | 'HSK2'
  | 'HSK3'
  | 'HSK4'
  | 'HSK5'
  | 'HSK6'

export type SkillType = 'listening' | 'reading' | 'writing' | 'speaking' | 'vocabulary' | 'grammar'
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'
export type QuestionType = 'multiple-choice' | 'fill-blank' | 'true-false' | 'matching' | 'short-answer'

export interface LanguageConfig {
  code: Language
  name: string
  nativeName: string
  flag: string
  ttsLang: string
  newsSource: NewsSource
  exams: ExamType[]
}

export interface NewsSource {
  name: string
  url: string
  language: Language
  logo: string
}

export interface Phonetic {
  ipa: string
  kk?: string
  romaji?: string
  pronunciation?: string
}

export interface ExampleSentence {
  text: string
  translation: string
  highlight?: string
}

export interface VocabularyWord {
  id: string
  word: string
  language: Language
  phonetic: Phonetic
  partOfSpeech: string
  definition: string
  definitionTranslation: string
  examples: ExampleSentence[]
  level: DifficultyLevel
  tags: string[]
  relatedWords?: string[]
  memoryTip?: string
}

export interface QuizQuestion {
  id: string
  type: QuestionType
  skill: SkillType
  language: Language
  question: string
  options?: string[]
  correctAnswer: string | string[]
  explanation: string
  difficulty: DifficultyLevel
  examType?: ExamType
  audioUrl?: string
  imageUrl?: string
  passage?: string
}

export interface QuizSession {
  id: string
  date: string
  language: Language
  questions: QuizQuestion[]
  answers: Record<string, string>
  score: number
  totalQuestions: number
  completedAt?: string
  examType?: ExamType
}

export interface Article {
  id: string
  title: string
  content: string
  summary: string
  source: string
  sourceUrl: string
  language: Language
  publishedAt: string
  imageUrl?: string
  difficulty: DifficultyLevel
  readingTime: number
  tags: string[]
  questions?: QuizQuestion[]
}

export interface ListeningExercise {
  id: string
  title: string
  audioUrl?: string
  transcript: string
  language: Language
  difficulty: DifficultyLevel
  questions: QuizQuestion[]
  source?: string
  duration?: number
}

export interface UserProgress {
  language: Language
  vocabulary: {
    learned: number
    reviewing: number
    total: number
  }
  dailyStreak: number
  totalPoints: number
  skillLevels: Record<SkillType, number>
  completedQuizzes: number
  lastActivity: string
}

export interface LearningPath {
  language: Language
  examTarget?: ExamType
  currentLevel: DifficultyLevel
  completedLessons: string[]
  nextLesson?: string
}

export interface WritingPrompt {
  id: string
  topic: string
  description: string
  language: Language
  difficulty: DifficultyLevel
  wordLimit?: number
  timeLimit?: number
  examType?: ExamType
  sampleAnswer?: string
}
