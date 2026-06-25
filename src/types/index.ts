export type Language = 'en' | 'ja' | 'ko' | 'fr' | 'es' | 'de' | 'zh'

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
  resetToken?: string
  resetTokenExpiry?: number
}

export interface AuthState {
  currentUser: User | null
  isLoggedIn: boolean
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
  | 'DELF_A1'
  | 'DELF_A2'
  | 'DELF_B1'
  | 'DELF_B2'
  | 'DELE_A1'
  | 'DELE_A2'
  | 'DELE_B1'
  | 'DELE_B2'
  | 'GOETHE_A1'
  | 'GOETHE_B1'
  | 'HSK1'
  | 'HSK2'
  | 'HSK3'
  | 'HSK4'

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
