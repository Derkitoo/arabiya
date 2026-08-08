export type Tab =
  | 'dashboard'
  | 'session'
  | 'placement'
  | 'admin'
  | 'guide'
  | 'path'
  | 'lesson'
  | 'exercises'
  | 'listening'
  | 'quiz'
  | 'alphabet'
  | 'reading'
  | 'devocalized'
  | 'phonemes'
  | 'dictation'
  | 'roots'
  | 'patterns'
  | 'vocabulary'
  | 'planner'

export type Level = {
  id: string
  title: string
  goal: string
  skills: string[]
  unlock: number
}

export type Letter = {
  id: string
  arabic: string
  name: string
  sound: string
  example: string
  forms: {
    isolated: string
    initial?: string
    medial?: string
    final?: string
  }
}

export type Word = {
  id: string
  arabic: string
  french: string
  theme: string
  level: 'Niveau 1' | 'Niveau 2'
}

export type Activity = {
  id: string
  title: string
  minutes: number
  kind: string
  detail: string
}

export type QuizQuestion = {
  id: string
  prompt: string
  answer: string
  options: string[]
}

export type Lesson = {
  id: string
  levelId: string
  order: number
  title: string
  durationMinutes: number
  objective: string
  explanation: string
  examples: {
    arabic?: string
    transliteration?: string
    french: string
  }[]
  practice: string[]
  validation: string
}

export type Exercise = {
  id: string
  lessonId: string
  skill: 'alphabet' | 'reading' | 'vocabulary' | 'sentence' | 'dialogue' | 'pattern'
  prompt: string
  answer: string
  options: string[]
  hint: string
}

export type Vowel = {
  id: string
  name: string
  mark: string
  sound: string
  position: string
  example: string
  transliteration: string
}

export type Syllable = {
  id: string
  arabic: string
  transliteration: string
  pattern: string
}

export type RootWord = {
  id: string
  arabic: string
  transliteration: string
  french: string
  patternId: string
  patternName: string
}

export type Root = {
  id: string
  arabic: string
  latin: string
  meaning: string
  note: string
  family: RootWord[]
}

export type Pattern = {
  id: string
  arabic: string
  transliteration: string
  name: string
  meaning: string
  formula: string
  exampleRoot: string
  exampleWordId: string
  question: string
  answer: string
  options: string[]
}

export type DevocalizedItem = {
  id: string
  fullyVocalized: string
  semiVocalized: string
  unvocalized: string
  transliteration: string
  french: string
  rootId?: string
  patternId?: string
  options: string[]
}

export type PhonemePair = {
  id: string
  title: string
  focus: string
  note: string
  first: {
    letter: string
    name: string
    cue: string
    example: string
    transliteration: string
    french: string
  }
  second: {
    letter: string
    name: string
    cue: string
    example: string
    transliteration: string
    french: string
  }
  question: string
  answer: string
  options: string[]
}

export type DictationItem = {
  id: string
  arabic: string
  transliteration: string
  french: string
  level: 'facile' | 'moyen'
  prompt: string
  answer: string
  acceptedAnswers: string[]
  options: string[]
}

export type PlacementQuestion = {
  id: string
  skill: 'alphabet' | 'listening' | 'reading' | 'vocabulary' | 'patterns'
  prompt: string
  arabic?: string
  answer: string
  options: string[]
  recommendationTab: Tab
  explanation: string
}

export type ListeningItem = {
  id: string
  title: string
  arabic: string
  transliteration: string
  french: string
  category: 'lettre' | 'mot' | 'phrase' | 'dialogue'
}

export type ReviewQuality = 'again' | 'hard' | 'easy'

export type WordReview = {
  repetitions: number
  intervalDays: number
  ease: number
  dueDate: string
  lastReviewed?: string
}

export type SessionHistoryEntry = {
  date: string
  completedSteps: number
  minutes: number
}

export type Progress = {
  completedActivities: string[]
  completedLessons: string[]
  completedExercises: string[]
  completedPatterns: string[]
  completedDevocalized: string[]
  completedPhonemes: string[]
  completedDictations: string[]
  completedSessionSteps: string[]
  completedPlacement: string[]
  missedPlacement: string[]
  missedDictations: string[]
  listenedItems: string[]
  knownLetters: string[]
  knownWords: string[]
  activeDays: string[]
  dailyGoalMinutes: number
  sessionHistory: SessionHistoryEntry[]
  quizScore: number
  wordReviews: Record<string, WordReview>
}
