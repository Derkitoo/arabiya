import { useEffect, useMemo, useState } from 'react'
import { todayActivities } from './data/activities'
import { lessons as baseLessons } from './data/curriculum'
import { devocalizedItems } from './data/devocalized'
import { dictationItems } from './data/dictation'
import { exercises as baseExercises } from './data/exercises'
import { letters } from './data/letters'
import { levels } from './data/levels'
import { listeningItems } from './data/listening'
import { patterns } from './data/patterns'
import { phonemePairs } from './data/phonemes'
import { placementQuestions } from './data/placement'
import { quizQuestions } from './data/quiz'
import { syllables, vowels } from './data/reading'
import { roots } from './data/roots'
import { weeklyPlan } from './data/weeklyPlan'
import { words } from './data/words'
import type { DevocalizedItem, DictationItem, Exercise, Lesson, ListeningItem, Pattern, PhonemePair, PlacementQuestion, Progress, QuizQuestion, ReviewQuality, RootWord, Tab } from './types'
import { createInitialReview, daysUntilDue, gradeWord, isDue } from './utils/spacedRepetition'
import { speakArabic } from './utils/speech'
import './App.css'

const defaultProgress: Progress = {
  completedActivities: [],
  completedSessionSteps: [],
  completedLessons: [],
  completedExercises: [],
  completedPatterns: [],
  completedDevocalized: [],
  completedPhonemes: [],
  completedDictations: [],
  completedPlacement: [],
  missedPlacement: [],
  missedDictations: [],
  listenedItems: [],
  knownLetters: [],
  knownWords: [],
  activeDays: [],
  dailyGoalMinutes: 25,
  sessionHistory: [],
  quizScore: 0,
  wordReviews: {},
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Tableau' },
  { id: 'session', label: 'Session' },
  { id: 'placement', label: 'Niveau' },
  { id: 'admin', label: 'Admin' },
  { id: 'guide', label: 'Guide' },
  { id: 'path', label: 'Parcours' },
  { id: 'lesson', label: 'Leçon' },
  { id: 'exercises', label: 'Exercices' },
  { id: 'listening', label: 'Écoute' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'alphabet', label: 'Alphabet' },
  { id: 'reading', label: 'Lecture' },
  { id: 'devocalized', label: 'Sans voyelles' },
  { id: 'phonemes', label: 'Sons' },
  { id: 'dictation', label: 'Dictée' },
  { id: 'roots', label: 'Racines' },
  { id: 'patterns', label: 'Schèmes' },
  { id: 'vocabulary', label: 'Mots' },
  { id: 'planner', label: 'Planning' },
]

const tabGroups: { title: string; items: { id: Tab; label: string }[] }[] = [
  { title: 'Accueil', items: tabs.filter((tab) => ['dashboard', 'session', 'placement'].includes(tab.id)) },
  { title: 'Apprendre', items: tabs.filter((tab) => ['guide', 'path', 'lesson', 'exercises', 'quiz'].includes(tab.id)) },
  {
    title: 'Modules',
    items: tabs.filter((tab) => ['alphabet', 'reading', 'devocalized', 'phonemes', 'dictation', 'listening'].includes(tab.id)),
  },
  { title: 'Approfondir', items: tabs.filter((tab) => ['roots', 'patterns', 'vocabulary', 'planner', 'admin'].includes(tab.id)) },
]

const dailySessionSteps: {
  id: string
  title: string
  minutes: number
  target: Tab
  detail: string
  validation: string
}[] = [
  {
    id: 'session-alphabet',
    title: 'Échauffement alphabet',
    minutes: 4,
    target: 'alphabet',
    detail: 'Revois 3 lettres et lis leurs formes.',
    validation: 'Marque au moins une lettre comme connue.',
  },
  {
    id: 'session-listening',
    title: 'Écoute active',
    minutes: 5,
    target: 'listening',
    detail: 'Écoute, répète, puis réécoute sans te presser.',
    validation: 'Écoute au moins une carte.',
  },
  {
    id: 'session-dictation',
    title: 'Dictée courte',
    minutes: 6,
    target: 'dictation',
    detail: 'Écoute un mot caché et réponds avant de révéler.',
    validation: 'Réussis une carte ou ajoute une erreur à revoir.',
  },
  {
    id: 'session-devocalized',
    title: 'Lecture sans voyelles',
    minutes: 6,
    target: 'devocalized',
    detail: 'Passe de vocalise a sans voyelles sur une carte.',
    validation: 'Reconnais au moins un mot.',
  },
  {
    id: 'session-review',
    title: 'Revision finale',
    minutes: 4,
    target: 'vocabulary',
    detail: 'Revois les mots dus et classe-les selon ta facilite.',
    validation: 'Note les mots faciles et ceux a revoir.',
  },
]

type AdminContent = {
  lessons: Lesson[]
  exercises: Exercise[]
}

type StoredEnvelope<T> = {
  schemaVersion: number
  savedAt: string
  data: T
}

type AppBackup = {
  app: 'arabic-learning-mvp'
  schemaVersion: number
  exportedAt: string
  progress: Progress
  adminContent: AdminContent
}

const emptyAdminContent: AdminContent = {
  lessons: [],
  exercises: [],
}

const STORAGE_SCHEMA_VERSION = 2
const PROGRESS_STORAGE_KEY = 'arabic-learning-progress'
const ADMIN_STORAGE_KEY = 'arabic-learning-admin-content'

function unwrapStoredData<T>(raw: unknown): Partial<T> {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    return ((raw as StoredEnvelope<T>).data ?? {}) as Partial<T>
  }

  return (raw ?? {}) as Partial<T>
}

function createStoredEnvelope<T>(data: T): StoredEnvelope<T> {
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    data,
  }
}

function loadProgress(): Progress {
  const saved = localStorage.getItem(PROGRESS_STORAGE_KEY)
  if (!saved) return defaultProgress

  try {
    const parsed = unwrapStoredData<Progress>(JSON.parse(saved))

    return {
      ...defaultProgress,
      ...parsed,
      completedActivities: Array.isArray(parsed.completedActivities) ? parsed.completedActivities : [],
      completedSessionSteps: Array.isArray(parsed.completedSessionSteps) ? parsed.completedSessionSteps : [],
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      completedExercises: Array.isArray(parsed.completedExercises) ? parsed.completedExercises : [],
      completedPatterns: Array.isArray(parsed.completedPatterns) ? parsed.completedPatterns : [],
      completedDevocalized: Array.isArray(parsed.completedDevocalized) ? parsed.completedDevocalized : [],
      completedPhonemes: Array.isArray(parsed.completedPhonemes) ? parsed.completedPhonemes : [],
      completedDictations: Array.isArray(parsed.completedDictations) ? parsed.completedDictations : [],
      completedPlacement: Array.isArray(parsed.completedPlacement) ? parsed.completedPlacement : [],
      missedPlacement: Array.isArray(parsed.missedPlacement) ? parsed.missedPlacement : [],
      missedDictations: Array.isArray(parsed.missedDictations) ? parsed.missedDictations : [],
      listenedItems: Array.isArray(parsed.listenedItems) ? parsed.listenedItems : [],
      knownLetters: Array.isArray(parsed.knownLetters) ? parsed.knownLetters : [],
      knownWords: Array.isArray(parsed.knownWords) ? parsed.knownWords : [],
      activeDays: Array.isArray(parsed.activeDays) ? parsed.activeDays : [],
      dailyGoalMinutes: typeof parsed.dailyGoalMinutes === 'number' ? parsed.dailyGoalMinutes : 25,
      sessionHistory: Array.isArray(parsed.sessionHistory) ? parsed.sessionHistory : [],
      quizScore: typeof parsed.quizScore === 'number' ? parsed.quizScore : 0,
      wordReviews: parsed.wordReviews && typeof parsed.wordReviews === 'object' ? parsed.wordReviews : {},
    }
  } catch {
    return defaultProgress
  }
}

function loadAdminContent(): AdminContent {
  const saved = localStorage.getItem(ADMIN_STORAGE_KEY)
  if (!saved) return emptyAdminContent

  try {
    const parsed = unwrapStoredData<AdminContent>(JSON.parse(saved))

    return {
      lessons: Array.isArray(parsed.lessons) ? parsed.lessons : [],
      exercises: Array.isArray(parsed.exercises) ? parsed.exercises : [],
    }
  } catch {
    return emptyAdminContent
  }
}

function normalizeAnswer(answer: string) {
  return answer
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/\s+/g, ' ')
}

function dayKey(date = new Date()) {
  return date.toDateString()
}

function calculateStreak(activeDays: string[]) {
  const daySet = new Set(activeDays)
  const cursor = new Date()
  let streak = 0

  while (daySet.has(dayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

function buildRecentDays(activeDays: string[], count = 7) {
  const daySet = new Set(activeDays)

  return Array.from({ length: count }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (count - 1 - index))
    const key = dayKey(date)

    return {
      key,
      label: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      active: daySet.has(key),
    }
  })
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [adminContent, setAdminContent] = useState<AdminContent>(loadAdminContent)
  const [revealedWordId, setRevealedWordId] = useState(words[0].id)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({})
  const [patternAnswers, setPatternAnswers] = useState<Record<string, string>>({})
  const [devocalizedAnswers, setDevocalizedAnswers] = useState<Record<string, string>>({})
  const [phonemeAnswers, setPhonemeAnswers] = useState<Record<string, string>>({})
  const [dictationAnswers, setDictationAnswers] = useState<Record<string, string>>({})
  const [dictationTypedAnswers, setDictationTypedAnswers] = useState<Record<string, string>>({})
  const [placementAnswers, setPlacementAnswers] = useState<Record<string, string>>({})
  const [sessionStarted, setSessionStarted] = useState(false)
  const [sessionStepIndex, setSessionStepIndex] = useState(0)
  const [selectedLessonId, setSelectedLessonId] = useState(baseLessons[0].id)

  const allLessons = useMemo(
    () => [...baseLessons, ...adminContent.lessons].sort((first, second) => first.order - second.order),
    [adminContent.lessons],
  )
  const allExercises = useMemo(
    () => [...baseExercises, ...adminContent.exercises],
    [adminContent.exercises],
  )

  const dueWords = useMemo(
    () => words.filter((word) => isDue(progress.wordReviews[word.id])),
    [progress.wordReviews],
  )

  const completedMinutes = useMemo(
    () =>
      todayActivities
        .filter((activity) => progress.completedActivities.includes(activity.id))
        .reduce((total, activity) => total + activity.minutes, 0),
    [progress.completedActivities],
  )
  const listenedCoreCount = listeningItems.filter((item) => progress.listenedItems.includes(item.id)).length
  const rootWordCount = roots.reduce((total, root) => total + root.family.length, 0)
  const knownRootWordCount = roots.reduce(
    (total, root) => total + root.family.filter((word) => progress.knownWords.includes(word.id)).length,
    0,
  )

  const mastery = Math.round(
    ((progress.completedActivities.length +
      progress.completedSessionSteps.length +
      progress.completedLessons.length +
      progress.completedExercises.length +
      progress.completedPatterns.length +
      progress.completedDevocalized.length +
      progress.completedPhonemes.length +
      progress.completedDictations.length +
      progress.completedPlacement.length +
      listenedCoreCount +
      knownRootWordCount +
      progress.knownLetters.length +
      progress.knownWords.length) /
      (todayActivities.length +
        dailySessionSteps.length +
        allLessons.length +
        allExercises.length +
        patterns.length +
        devocalizedItems.length +
        phonemePairs.length +
        dictationItems.length +
        placementQuestions.length +
        listeningItems.length +
        rootWordCount +
        letters.length +
        words.length)) *
      100,
  )

  const completion = Math.round((progress.completedActivities.length / todayActivities.length) * 100)
  const currentLevel = Math.min(levels.length, Math.max(1, Math.floor(mastery / 12.5) + 1))
  const selectedLesson = allLessons.find((lesson) => lesson.id === selectedLessonId) ?? allLessons[0]
  const exerciseCompletion = Math.round((progress.completedExercises.length / allExercises.length) * 100)
  const listeningCompletion = Math.round((listenedCoreCount / listeningItems.length) * 100)
  const nextActivity = todayActivities.find((activity) => !progress.completedActivities.includes(activity.id))
  const sessionMinutes = dailySessionSteps.reduce((total, step) => total + step.minutes, 0)
  const sessionCompletion = Math.round((progress.completedSessionSteps.length / dailySessionSteps.length) * 100)
  const placementCompletion = Math.round((progress.completedPlacement.length / placementQuestions.length) * 100)
  const currentStreak = calculateStreak(progress.activeDays)
  const recentDays = buildRecentDays(progress.activeDays)
  const dailyGoalProgress = Math.min(100, Math.round((completedMinutes / progress.dailyGoalMinutes) * 100))
  const earnedBadges = [
    progress.activeDays.length >= 1 ? 'Premier jour' : '',
    currentStreak >= 3 ? 'Serie 3 jours' : '',
    sessionCompletion === 100 ? 'Session complete' : '',
    progress.completedDictations.length >= 3 ? 'Oreille active' : '',
    progress.completedDevocalized.length >= 3 ? 'Lecteur sans voyelles' : '',
  ].filter(Boolean)

  useEffect(() => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(createStoredEnvelope(progress)))
  }, [progress])

  useEffect(() => {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(createStoredEnvelope(adminContent)))
  }, [adminContent])

  function toggleActivity(activityId: string) {
    setProgress((current) => ({
      ...current,
      completedActivities: current.completedActivities.includes(activityId)
        ? current.completedActivities.filter((id) => id !== activityId)
        : [...current.completedActivities, activityId],
      activeDays: current.activeDays.includes(new Date().toDateString())
        ? current.activeDays
        : [...current.activeDays, new Date().toDateString()],
    }))
  }

  function toggleLetter(letterId: string) {
    setProgress((current) => ({
      ...current,
      knownLetters: current.knownLetters.includes(letterId)
        ? current.knownLetters.filter((id) => id !== letterId)
        : [...current.knownLetters, letterId],
    }))
  }

  function toggleWord(wordId: string) {
    setProgress((current) => {
      const isKnown = current.knownWords.includes(wordId)
      const nextReviews = { ...current.wordReviews }

      if (!isKnown && !nextReviews[wordId]) {
        nextReviews[wordId] = createInitialReview()
      }

      return {
        ...current,
        knownWords: isKnown ? current.knownWords.filter((id) => id !== wordId) : [...current.knownWords, wordId],
        wordReviews: nextReviews,
      }
    })
  }

  function reviewWord(wordId: string, quality: ReviewQuality) {
    setProgress((current) => ({
      ...current,
      knownWords: current.knownWords.includes(wordId) ? current.knownWords : [...current.knownWords, wordId],
      wordReviews: {
        ...current.wordReviews,
        [wordId]: gradeWord(current.wordReviews[wordId], quality),
      },
    }))
  }

  function addRootWordToReview(word: RootWord) {
    setProgress((current) => ({
      ...current,
      knownWords: current.knownWords.includes(word.id) ? current.knownWords : [...current.knownWords, word.id],
      wordReviews: {
        ...current.wordReviews,
        [word.id]: current.wordReviews[word.id] ?? createInitialReview(),
      },
      activeDays: current.activeDays.includes(new Date().toDateString())
        ? current.activeDays
        : [...current.activeDays, new Date().toDateString()],
    }))
  }

  function completePattern(patternId: string) {
    setProgress((current) => ({
      ...current,
      completedPatterns: current.completedPatterns.includes(patternId)
        ? current.completedPatterns
        : [...current.completedPatterns, patternId],
      activeDays: current.activeDays.includes(new Date().toDateString())
        ? current.activeDays
        : [...current.activeDays, new Date().toDateString()],
    }))
  }

  function answerPattern(pattern: Pattern, answer: string) {
    setPatternAnswers((current) => ({ ...current, [pattern.id]: answer }))
    if (answer === pattern.answer) {
      completePattern(pattern.id)
    }
  }

  function answerDevocalized(item: DevocalizedItem, answer: string) {
    setDevocalizedAnswers((current) => ({ ...current, [item.id]: answer }))
    if (answer !== item.french) return

    setProgress((current) => ({
      ...current,
      completedDevocalized: current.completedDevocalized.includes(item.id)
        ? current.completedDevocalized
        : [...current.completedDevocalized, item.id],
      activeDays: current.activeDays.includes(new Date().toDateString())
        ? current.activeDays
        : [...current.activeDays, new Date().toDateString()],
    }))
  }

  function answerPhoneme(pair: PhonemePair, answer: string) {
    setPhonemeAnswers((current) => ({ ...current, [pair.id]: answer }))
    if (answer !== pair.answer) return

    setProgress((current) => ({
      ...current,
      completedPhonemes: current.completedPhonemes.includes(pair.id)
        ? current.completedPhonemes
        : [...current.completedPhonemes, pair.id],
      activeDays: current.activeDays.includes(new Date().toDateString())
        ? current.activeDays
        : [...current.activeDays, new Date().toDateString()],
    }))
  }

  function answerDictation(item: DictationItem, answer: string) {
    setDictationAnswers((current) => ({ ...current, [item.id]: answer }))

    const normalized = normalizeAnswer(answer)
    const accepted = item.acceptedAnswers.some((acceptedAnswer) => normalizeAnswer(acceptedAnswer) === normalized)

    setProgress((current) => ({
      ...current,
      completedDictations: accepted
        ? current.completedDictations.includes(item.id)
          ? current.completedDictations
          : [...current.completedDictations, item.id]
        : current.completedDictations,
      missedDictations: accepted
        ? current.missedDictations.filter((id) => id !== item.id)
        : current.missedDictations.includes(item.id)
          ? current.missedDictations
          : [...current.missedDictations, item.id],
      activeDays: current.activeDays.includes(new Date().toDateString())
        ? current.activeDays
        : [...current.activeDays, new Date().toDateString()],
    }))
  }

  function answerPlacement(question: PlacementQuestion, answer: string) {
    setPlacementAnswers((current) => ({ ...current, [question.id]: answer }))

    const correct = answer === question.answer
    setProgress((current) => ({
      ...current,
      completedPlacement: correct
        ? current.completedPlacement.includes(question.id)
          ? current.completedPlacement
          : [...current.completedPlacement, question.id]
        : current.completedPlacement,
      missedPlacement: correct
        ? current.missedPlacement.filter((id) => id !== question.id)
        : current.missedPlacement.includes(question.id)
          ? current.missedPlacement
          : [...current.missedPlacement, question.id],
      activeDays: current.activeDays.includes(dayKey())
        ? current.activeDays
        : [...current.activeDays, dayKey()],
    }))
  }

  function startSession() {
    const firstIncompleteIndex = dailySessionSteps.findIndex((step) => !progress.completedSessionSteps.includes(step.id))
    setSessionStarted(true)
    setSessionStepIndex(firstIncompleteIndex === -1 ? dailySessionSteps.length : firstIncompleteIndex)
    setActiveTab('session')
  }

  function completeSessionStep(stepId: string) {
    const currentIndex = dailySessionSteps.findIndex((step) => step.id === stepId)
    const willFinish = currentIndex === dailySessionSteps.length - 1

    setProgress((current) => ({
      ...current,
      completedSessionSteps: current.completedSessionSteps.includes(stepId)
        ? current.completedSessionSteps
        : [...current.completedSessionSteps, stepId],
      sessionHistory: willFinish && !current.sessionHistory.some((entry) => entry.date === dayKey())
        ? [
            {
              date: dayKey(),
              completedSteps: dailySessionSteps.length,
              minutes: sessionMinutes,
            },
            ...current.sessionHistory,
          ].slice(0, 14)
        : current.sessionHistory,
      activeDays: current.activeDays.includes(new Date().toDateString())
        ? current.activeDays
        : [...current.activeDays, new Date().toDateString()],
    }))

    setSessionStarted(true)
    setSessionStepIndex(Math.min(dailySessionSteps.length, currentIndex + 1))
  }

  function updateDailyGoal(minutes: number) {
    setProgress((current) => ({
      ...current,
      dailyGoalMinutes: Math.min(90, Math.max(5, minutes)),
    }))
  }

  function resetSession() {
    setSessionStarted(false)
    setSessionStepIndex(0)
    setProgress((current) => ({ ...current, completedSessionSteps: [] }))
  }

  function resetPlacement() {
    setPlacementAnswers({})
    setProgress((current) => ({ ...current, completedPlacement: [], missedPlacement: [] }))
  }

  function addAdminLesson(lesson: Lesson) {
    setAdminContent((current) => ({
      ...current,
      lessons: [...current.lessons.filter((item) => item.id !== lesson.id), lesson],
    }))
    setSelectedLessonId(lesson.id)
  }

  function addAdminExercise(exercise: Exercise) {
    setAdminContent((current) => ({
      ...current,
      exercises: [...current.exercises.filter((item) => item.id !== exercise.id), exercise],
    }))
  }

  function importAdminContent(rawJson: string) {
    const parsed = JSON.parse(rawJson) as Partial<AdminContent>
    setAdminContent({
      lessons: Array.isArray(parsed.lessons) ? parsed.lessons : [],
      exercises: Array.isArray(parsed.exercises) ? parsed.exercises : [],
    })
  }

  function resetAdminContent() {
    const confirmed = window.confirm('Supprimer les lecons et exercices ajoutes localement ?')
    if (!confirmed) return
    setAdminContent(emptyAdminContent)
  }

  function selectLesson(lessonId: string) {
    setSelectedLessonId(lessonId)
    setActiveTab('guide')
  }

  function toggleLesson(lessonId: string) {
    setProgress((current) => ({
      ...current,
      completedLessons: current.completedLessons.includes(lessonId)
        ? current.completedLessons.filter((id) => id !== lessonId)
        : [...current.completedLessons, lessonId],
      activeDays: current.activeDays.includes(new Date().toDateString())
        ? current.activeDays
        : [...current.activeDays, new Date().toDateString()],
    }))
  }

  function answerQuestion(question: QuizQuestion, answer: string) {
    const wasCorrect = answers[question.id] === question.answer
    const isCorrect = answer === question.answer

    setAnswers((current) => ({ ...current, [question.id]: answer }))
    setProgress((current) => ({
      ...current,
      quizScore: current.quizScore + (isCorrect && !wasCorrect ? 1 : 0) - (!isCorrect && wasCorrect ? 1 : 0),
    }))
  }

  function answerExercise(exercise: Exercise, answer: string) {
    setExerciseAnswers((current) => ({ ...current, [exercise.id]: answer }))

    if (answer !== exercise.answer) return

    setProgress((current) => ({
      ...current,
      completedExercises: current.completedExercises.includes(exercise.id)
        ? current.completedExercises
        : [...current.completedExercises, exercise.id],
      activeDays: current.activeDays.includes(new Date().toDateString())
        ? current.activeDays
        : [...current.activeDays, new Date().toDateString()],
    }))
  }

  function listenTo(item: Pick<ListeningItem, 'id' | 'arabic'>) {
    speakArabic(item.arabic)
    setProgress((current) => ({
      ...current,
      listenedItems: current.listenedItems.includes(item.id)
        ? current.listenedItems
        : [...current.listenedItems, item.id],
      activeDays: current.activeDays.includes(new Date().toDateString())
        ? current.activeDays
        : [...current.activeDays, new Date().toDateString()],
    }))
  }

  function resetDay() {
    setProgress((current) => ({ ...current, completedActivities: [] }))
  }

  function resetQuiz() {
    setAnswers({})
    setProgress((current) => ({ ...current, quizScore: 0 }))
  }

  function resetExercises() {
    setExerciseAnswers({})
    setProgress((current) => ({ ...current, completedExercises: [] }))
  }

  function resetProgress() {
    const confirmed = window.prompt('Tape RESET pour reinitialiser toute la progression locale.')
    if (confirmed !== 'RESET') return

    localStorage.removeItem(PROGRESS_STORAGE_KEY)
    setAnswers({})
    setExerciseAnswers({})
    setPatternAnswers({})
    setDevocalizedAnswers({})
    setPhonemeAnswers({})
    setDictationAnswers({})
    setDictationTypedAnswers({})
    setPlacementAnswers({})
    setSessionStarted(false)
    setSessionStepIndex(0)
    setRevealedWordId(words[0].id)
    setSelectedLessonId(baseLessons[0].id)
    setProgress(defaultProgress)
  }

  function exportGlobalBackup() {
    const backup: AppBackup = {
      app: 'arabic-learning-mvp',
      schemaVersion: STORAGE_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      progress,
      adminContent,
    }

    return JSON.stringify(backup, null, 2)
  }

  function importGlobalBackup(rawJson: string) {
    const parsed = JSON.parse(rawJson) as Partial<AppBackup>
    if (parsed.app !== 'arabic-learning-mvp' || !parsed.progress || !parsed.adminContent) {
      throw new Error('Invalid backup')
    }

    setProgress({ ...defaultProgress, ...parsed.progress })
    setAdminContent({
      lessons: Array.isArray(parsed.adminContent.lessons) ? parsed.adminContent.lessons : [],
      exercises: Array.isArray(parsed.adminContent.exercises) ? parsed.adminContent.exercises : [],
    })
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Navigation principale">
        <div className="brand-mark">
          <span className="brand-glyph" lang="ar" dir="rtl">{'\u0636'}</span>
          <div>
            <strong>Arabiya</strong>
            <small>Routine quotidienne</small>
          </div>
        </div>

        <nav className="tabs" aria-label="Sections">
          {tabGroups.map((group) => (
            <div className={group.items.some((tab) => tab.id === activeTab) ? 'tab-group active' : 'tab-group'} key={group.title}>
              <button className="tab-category" type="button">
                {group.title}
                <span aria-hidden="true">⌄</span>
              </button>
              <div className="tab-dropdown">
                {group.items.map((tab) => (
                  <button
                    className={activeTab === tab.id ? 'tab active' : 'tab'}
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    type="button"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">MVP apprentissage arabe</p>
            <h1>Un programme simple, régulier, mesurable.</h1>
          </div>
          <div className="topbar-actions">
            <div className="streak">
              <span>{progress.activeDays.length}</span>
              jours actifs
            </div>
            <button className="reset-button" type="button" onClick={resetProgress}>Reset</button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <section className="dashboard-grid">
            <article className="panel hero-panel">
              <div>
                <p className="eyebrow">Session du jour</p>
                <h2>{completedMinutes} min terminées sur 25</h2>
                <p>
                  Routine courte : alphabet, vocabulaire, écriture, révision. Les mots à revoir
                  remontent automatiquement selon la mémoire.
                </p>
              </div>
              <div className="progress-ring" style={{ '--progress': `${completion}%` } as React.CSSProperties}>
                <span>{completion}%</span>
              </div>
            </article>

            <article className="panel today-panel">
              <div className="panel-title">
                <h2>Aujourd'hui</h2>
                <button type="button" onClick={() => setActiveTab(nextActivity ? 'lesson' : 'guide')}>
                  Continuer
                </button>
              </div>
              <div className="today-focus">
                <div>
                  <span>Activite suivante</span>
                  <strong>{nextActivity ? nextActivity.title : 'Session terminée'}</strong>
                  <p>{nextActivity ? nextActivity.detail : 'Passe au guide ou à la révision des mots.'}</p>
                </div>
                <div>
                  <span>Session guidee</span>
                  <strong>{sessionCompletion}% complétée</strong>
                  <p>{sessionMinutes} minutes pour enchaîner écoute, dictée, lecture et révision.</p>
                </div>
              </div>
            </article>

            <article className="panel session-teaser">
              <div>
                <p className="eyebrow">Routine intelligente</p>
                <h2>Une session complète sans chercher quoi faire</h2>
                <p>Le parcours te guide module par module et garde le resume du jour visible.</p>
              </div>
              <button type="button" onClick={startSession}>
                {sessionCompletion === 100 ? 'Revoir la session' : 'Demarrer ma session'}
              </button>
            </article>

            <article className="panel placement-teaser">
              <div>
                <p className="eyebrow">Placement</p>
                <h2>Tester ton niveau avant d’avancer</h2>
                <p>Un test court repere les points faibles et propose le bon module de reprise.</p>
              </div>
              <button type="button" onClick={() => setActiveTab('placement')}>
                {placementCompletion === 100 ? 'Voir resultat' : 'Faire le test'}
              </button>
            </article>

            <article className="panel goals-panel">
              <div className="panel-title">
                <h2>Objectif quotidien</h2>
                <span>{completedMinutes}/{progress.dailyGoalMinutes} min</span>
              </div>
              <div className="goal-bar" aria-label={`Objectif atteint a ${dailyGoalProgress}%`}>
                <span style={{ width: `${dailyGoalProgress}%` }} />
              </div>
              <label className="goal-control">
                Minutes par jour
                <input
                  max="90"
                  min="5"
                  step="5"
                  type="number"
                  value={progress.dailyGoalMinutes}
                  onChange={(event) => updateDailyGoal(Number(event.target.value))}
                />
              </label>
              <div className="streak-calendar">
                {recentDays.map((day) => (
                  <div className={day.active ? 'active' : ''} key={day.key}>
                    <span>{day.label}</span>
                    <strong>{day.active ? '✓' : '-'}</strong>
                  </div>
                ))}
              </div>
              <div className="badge-list">
                {earnedBadges.length > 0
                  ? earnedBadges.map((badge) => <span key={badge}>{badge}</span>)
                  : <span>Premier badge apres une action aujourd'hui</span>}
              </div>
            </article>

            <article className="panel stats-panel">
              <Stat label="Niveau actuel" value={`${currentLevel}/${levels.length}`} />
              <Stat label="Maitrise globale" value={`${mastery}%`} />
              <Stat label="Session du jour" value={`${sessionCompletion}%`} />
              <Stat label="Test de niveau" value={`${placementCompletion}%`} />
              <Stat label="Serie actuelle" value={`${currentStreak}j`} />
              <Stat label="Mots a revoir" value={`${dueWords.length}`} />
            </article>

            <article className="panel">
              <div className="panel-title">
                <h2>File de révision</h2>
                <button type="button" onClick={() => setActiveTab('vocabulary')}>Ouvrir</button>
              </div>
              <ul className="action-list">
                {dueWords.slice(0, 4).map((word) => (
                  <li key={word.id}>
                    <span>{word.theme}</span>
                    <span lang="ar" dir="rtl">{word.arabic}</span>
                  </li>
                ))}
                {dueWords.length === 0 && <li>Aucun mot en retard. Tu peux ajouter du nouveau vocabulaire.</li>}
              </ul>
            </article>
          </section>
        )}

        {activeTab === 'session' && (
          <SessionView
            completedSteps={progress.completedSessionSteps}
            currentIndex={sessionStepIndex}
            dailyGoalMinutes={progress.dailyGoalMinutes}
            dailyGoalProgress={dailyGoalProgress}
            dueWordsCount={dueWords.length}
            earnedBadges={earnedBadges}
            missedDictationCount={progress.missedDictations.length}
            onCompleteStep={completeSessionStep}
            onGoTo={(tab) => setActiveTab(tab)}
            onReset={resetSession}
            onStart={startSession}
            onUpdateGoal={updateDailyGoal}
            recentDays={recentDays}
            sessionStarted={sessionStarted}
            sessionHistory={progress.sessionHistory}
            totalMinutes={sessionMinutes}
          />
        )}

        {activeTab === 'placement' && (
          <PlacementView
            answers={placementAnswers}
            completedQuestions={progress.completedPlacement}
            missedQuestions={progress.missedPlacement}
            onAnswer={answerPlacement}
            onGoTo={(tab) => setActiveTab(tab)}
            onReset={resetPlacement}
          />
        )}

        {activeTab === 'admin' && (
          <AdminContentView
            adminContent={adminContent}
            baseExerciseCount={baseExercises.length}
            baseLessonCount={baseLessons.length}
            globalBackup={exportGlobalBackup()}
            lessons={allLessons}
            onAddExercise={addAdminExercise}
            onAddLesson={addAdminLesson}
            onGoTo={(tab) => setActiveTab(tab)}
            onImportBackup={importGlobalBackup}
            onImport={importAdminContent}
            onReset={resetAdminContent}
          />
        )}

        {activeTab === 'guide' && (
          <GuideView
            completedLessons={progress.completedLessons}
            currentLevel={currentLevel}
            lessons={allLessons}
            onListen={listenTo}
            onSelectLesson={selectLesson}
            onToggleLesson={toggleLesson}
            selectedLesson={selectedLesson}
          />
        )}

        {activeTab === 'path' && (
          <section className="content-stack">
            <div className="section-heading">
              <p className="eyebrow">Parcours</p>
              <h2>Des niveaux courts pour savoir quoi apprendre ensuite</h2>
            </div>
            <div className="level-list">
              {levels.map((level, index) => {
                const locked = mastery < level.unlock
                const active = currentLevel === index + 1
                return (
                  <article className={active ? 'level-card active' : 'level-card'} key={level.id}>
                    <div>
                      <span>{locked ? 'Verrouille' : active ? 'En cours' : 'Disponible'}</span>
                      <h3>{level.title}</h3>
                      <p>{level.goal}</p>
                    </div>
                    <ul>
                      {level.skills.map((skill) => <li key={skill}>{skill}</li>)}
                    </ul>
                    <button type="button" onClick={() => selectLesson(allLessons.find((lesson) => lesson.levelId === level.id)?.id ?? allLessons[0].id)}>
                      Voir les lecons
                    </button>
                  </article>
                )
              })}
            </div>
          </section>
        )}

        {activeTab === 'lesson' && (
          <section className="content-stack">
            <div className="section-heading">
              <p className="eyebrow">Leçon du jour</p>
              <h2>25 minutes pour avancer sans surcharge</h2>
            </div>
            <div className="activity-list">
              {todayActivities.map((activity) => {
                const done = progress.completedActivities.includes(activity.id)
                return (
                  <article className={done ? 'activity done' : 'activity'} key={activity.id}>
                    <div className="activity-meta">
                      <span>{activity.kind}</span>
                      <strong>{activity.minutes} min</strong>
                    </div>
                    <h3>{activity.title}</h3>
                    <p>{activity.detail}</p>
                    <button type="button" onClick={() => toggleActivity(activity.id)}>
                      {done ? 'Terminee' : 'Marquer fait'}
                    </button>
                  </article>
                )
              })}
            </div>
            <button className="ghost-button" type="button" onClick={resetDay}>Réinitialiser la session</button>
          </section>
        )}

        {activeTab === 'exercises' && (
          <ExercisesView
            answers={exerciseAnswers}
            completedExercises={progress.completedExercises}
            exerciseCompletion={exerciseCompletion}
            exercises={allExercises}
            lessons={allLessons}
            onAnswer={answerExercise}
            onReset={resetExercises}
          />
        )}

        {activeTab === 'listening' && (
          <ListeningView
            listenedItems={progress.listenedItems}
            listeningCompletion={listeningCompletion}
            onListen={listenTo}
          />
        )}

        {activeTab === 'quiz' && (
          <section className="content-stack">
            <div className="section-heading">
              <p className="eyebrow">Quiz</p>
              <h2>Tester la memoire active en moins de 2 minutes</h2>
            </div>
            <div className="quiz-grid">
              {quizQuestions.map((question) => (
                <article className="quiz-card" key={question.id}>
                  <h3>{question.prompt}</h3>
                  <div className="quiz-options">
                    {question.options.map((option) => {
                      const selected = answers[question.id] === option
                      const correct = selected && option === question.answer
                      const wrong = selected && option !== question.answer
                      return (
                        <button
                          className={correct ? 'correct' : wrong ? 'wrong' : ''}
                          key={option}
                          type="button"
                          onClick={() => answerQuestion(question, option)}
                        >
                          {option}
                        </button>
                      )
                    })}
                  </div>
                </article>
              ))}
            </div>
            <button className="ghost-button" type="button" onClick={resetQuiz}>Recommencer le quiz</button>
          </section>
        )}

        {activeTab === 'alphabet' && (
          <section className="content-stack">
            <div className="section-heading">
              <p className="eyebrow">Alphabet</p>
              <h2>Reconnaitre les lettres avant de memoriser les noms</h2>
            </div>
            <div className="letter-grid">
              {letters.map((letter) => {
                const known = progress.knownLetters.includes(letter.id)
                return (
                  <article className={known ? 'letter-card known' : 'letter-card'} key={letter.id}>
                    <span className="arabic-letter" lang="ar" dir="rtl">{letter.arabic}</span>
                    <h3>{letter.name}</h3>
                    <p>Son : {letter.sound}</p>
                    <p className="arabic-example" lang="ar" dir="rtl">{letter.example}</p>
                    <div className="letter-forms" lang="ar" dir="rtl">
                      <span>{letter.forms.isolated}</span>
                      {letter.forms.initial && <span>{letter.forms.initial}</span>}
                      {letter.forms.medial && <span>{letter.forms.medial}</span>}
                      {letter.forms.final && <span>{letter.forms.final}</span>}
                    </div>
                    <button type="button" onClick={() => toggleLetter(letter.id)}>
                      {known ? 'Maitrisee' : 'A revoir'}
                    </button>
                  </article>
                )
              })}
            </div>
          </section>
        )}

        {activeTab === 'reading' && (
          <ReadingView onListen={listenTo} />
        )}

        {activeTab === 'devocalized' && (
          <DevocalizedView
            answers={devocalizedAnswers}
            completedItems={progress.completedDevocalized}
            onAnswer={answerDevocalized}
            onListen={(item) => listenTo({ id: `devocalized-${item.id}`, arabic: item.fullyVocalized })}
          />
        )}

        {activeTab === 'phonemes' && (
          <PhonemesView
            answers={phonemeAnswers}
            completedPairs={progress.completedPhonemes}
            onAnswer={answerPhoneme}
            onListen={(id, arabic) => listenTo({ id: `phoneme-${id}`, arabic })}
          />
        )}

        {activeTab === 'dictation' && (
          <DictationView
            answers={dictationAnswers}
            completedItems={progress.completedDictations}
            missedItems={progress.missedDictations}
            typedAnswers={dictationTypedAnswers}
            onAnswer={answerDictation}
            onListen={(item) => listenTo({ id: `dictation-${item.id}`, arabic: item.arabic })}
            onType={(itemId, value) => setDictationTypedAnswers((current) => ({ ...current, [itemId]: value }))}
          />
        )}

        {activeTab === 'roots' && (
          <RootsView
            knownWords={progress.knownWords}
            onAddWord={addRootWordToReview}
            onListen={(word) => listenTo({ id: `root-${word.id}`, arabic: word.arabic })}
          />
        )}

        {activeTab === 'patterns' && (
          <PatternsView
            answers={patternAnswers}
            completedPatterns={progress.completedPatterns}
            onAnswer={answerPattern}
            onComplete={completePattern}
            onListen={(word) => listenTo({ id: `pattern-${word.id}`, arabic: word.arabic })}
          />
        )}

        {activeTab === 'vocabulary' && (
          <section className="content-stack">
            <div className="section-heading">
              <p className="eyebrow">Vocabulaire</p>
              <h2>Cartes rapides avec revision espacee</h2>
            </div>
            <div className="word-grid">
              {words.map((word) => {
                const known = progress.knownWords.includes(word.id)
                const revealed = revealedWordId === word.id
                const review = progress.wordReviews[word.id]
                const due = isDue(review)
                const dueIn = daysUntilDue(review)

                return (
                  <article className={known ? 'word-card known' : 'word-card'} key={word.id}>
                    <div className="word-topline">
                      <span>{word.theme}</span>
                      <small>{due ? 'A revoir' : `Dans ${dueIn} j`}</small>
                    </div>
                    <strong lang="ar" dir="rtl">{word.arabic}</strong>
                    <p>{revealed ? word.french : 'Clique pour reveler'}</p>
                    <div className="review-meta">
                      <span>{word.level}</span>
                      <span>{review ? `${review.repetitions} revisions` : 'Nouveau mot'}</span>
                    </div>
                    <div className="card-actions">
                      <button type="button" onClick={() => setRevealedWordId(word.id)}>Voir</button>
                      <button type="button" onClick={() => listenTo({ id: `word-${word.id}`, arabic: word.arabic })}>Écouter</button>
                      <button type="button" onClick={() => toggleWord(word.id)}>
                        {known ? 'Connu' : 'A apprendre'}
                      </button>
                    </div>
                    <div className="review-actions">
                      <button type="button" onClick={() => reviewWord(word.id, 'again')}>A revoir</button>
                      <button type="button" onClick={() => reviewWord(word.id, 'hard')}>Difficile</button>
                      <button type="button" onClick={() => reviewWord(word.id, 'easy')}>Facile</button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}

        {activeTab === 'planner' && (
          <section className="content-stack">
            <div className="section-heading">
              <p className="eyebrow">Planning</p>
              <h2>Une semaine lisible pour garder le rythme</h2>
            </div>
            <div className="planner-list">
              {weeklyPlan.map((item) => (
                <article className="planner-row" key={item.day}>
                  <strong>{item.day}</strong>
                  <span>{item.focus}</span>
                  <em>{item.duration}</em>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  )
}

function SessionView({
  completedSteps,
  currentIndex,
  dailyGoalMinutes,
  dailyGoalProgress,
  dueWordsCount,
  earnedBadges,
  missedDictationCount,
  onCompleteStep,
  onGoTo,
  onReset,
  onStart,
  onUpdateGoal,
  recentDays,
  sessionStarted,
  sessionHistory,
  totalMinutes,
}: {
  completedSteps: string[]
  currentIndex: number
  dailyGoalMinutes: number
  dailyGoalProgress: number
  dueWordsCount: number
  earnedBadges: string[]
  missedDictationCount: number
  onCompleteStep: (stepId: string) => void
  onGoTo: (tab: Tab) => void
  onReset: () => void
  onStart: () => void
  onUpdateGoal: (minutes: number) => void
  recentDays: { key: string; label: string; active: boolean }[]
  sessionStarted: boolean
  sessionHistory: { date: string; completedSteps: number; minutes: number }[]
  totalMinutes: number
}) {
  const completedCount = completedSteps.length
  const finished = completedCount === dailySessionSteps.length
  const activeStep = dailySessionSteps[Math.min(currentIndex, dailySessionSteps.length - 1)]
  const progress = Math.round((completedCount / dailySessionSteps.length) * 100)

  return (
    <section className="session-layout">
      <article className="session-hero">
        <div>
          <p className="eyebrow">Session guidee</p>
          <h2>{finished ? 'Session terminée' : 'Ta routine de 25 minutes'}</h2>
          <p>
            Enchaine les blocs essentiels dans le bon ordre : alphabet, ecoute, dictee,
            lecture sans voyelles, puis révision.
          </p>
        </div>
        <div className="session-meter">
          <strong>{progress}%</strong>
          <span>{completedCount}/{dailySessionSteps.length} blocs</span>
        </div>
      </article>

      <div className="session-actions">
        <button type="button" onClick={onStart}>{sessionStarted ? 'Reprendre' : 'Demarrer'}</button>
        <button type="button" onClick={onReset}>Réinitialiser session</button>
        <span>{totalMinutes} min estimees</span>
      </div>

      <article className="session-goals">
        <div className="panel-title">
          <h2>Objectif et regularite</h2>
          <span>{dailyGoalProgress}%</span>
        </div>
        <div className="goal-bar" aria-label={`Objectif atteint a ${dailyGoalProgress}%`}>
          <span style={{ width: `${dailyGoalProgress}%` }} />
        </div>
        <label className="goal-control">
          Objectif quotidien
          <input
            max="90"
            min="5"
            step="5"
            type="number"
            value={dailyGoalMinutes}
            onChange={(event) => onUpdateGoal(Number(event.target.value))}
          />
        </label>
        <div className="streak-calendar">
          {recentDays.map((day) => (
            <div className={day.active ? 'active' : ''} key={day.key}>
              <span>{day.label}</span>
              <strong>{day.active ? '✓' : '-'}</strong>
            </div>
          ))}
        </div>
        <div className="badge-list">
          {earnedBadges.length > 0
            ? earnedBadges.map((badge) => <span key={badge}>{badge}</span>)
            : <span>Encore un petit bloc pour debloquer un badge.</span>}
        </div>
      </article>

      {!finished && activeStep && (
        <article className="session-current">
          <div>
            <span>Etape {Math.min(currentIndex + 1, dailySessionSteps.length)}</span>
            <h3>{activeStep.title}</h3>
            <p>{activeStep.detail}</p>
            <small>{activeStep.validation}</small>
          </div>
          <div className="session-current-actions">
            <button type="button" onClick={() => onGoTo(activeStep.target)}>Ouvrir le module</button>
            <button type="button" onClick={() => onCompleteStep(activeStep.id)}>Marquer fait</button>
          </div>
        </article>
      )}

      {finished && (
        <article className="session-summary">
          <div className="section-heading">
            <p className="eyebrow">Resume</p>
            <h2>Bon rythme, tu as couvert toute la chaine active</h2>
          </div>
          <div className="session-summary-grid">
            <Stat label="Blocs termines" value={`${completedCount}/${dailySessionSteps.length}`} />
            <Stat label="Mots a revoir" value={`${dueWordsCount}`} />
            <Stat label="Dictées à corriger" value={`${missedDictationCount}`} />
          </div>
        </article>
      )}

      <article className="session-history">
        <div className="panel-title">
          <h2>Historique</h2>
          <span>{sessionHistory.length} session(s)</span>
        </div>
        <div className="session-history-list">
          {sessionHistory.slice(0, 5).map((entry) => (
            <div key={entry.date}>
              <strong>{entry.date}</strong>
              <span>{entry.completedSteps} blocs - {entry.minutes} min</span>
            </div>
          ))}
          {sessionHistory.length === 0 && <p>Aucune session complete enregistree pour le moment.</p>}
        </div>
      </article>

      <div className="session-step-list">
        {dailySessionSteps.map((step, index) => {
          const done = completedSteps.includes(step.id)
          const active = !finished && index === currentIndex

          return (
            <article className={done ? 'session-step done' : active ? 'session-step active' : 'session-step'} key={step.id}>
              <div className="session-step-index">{index + 1}</div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
                <span>{step.minutes} min - {step.validation}</span>
              </div>
              <button type="button" onClick={() => onGoTo(step.target)}>Ouvrir</button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function PlacementView({
  answers,
  completedQuestions,
  missedQuestions,
  onAnswer,
  onGoTo,
  onReset,
}: {
  answers: Record<string, string>
  completedQuestions: string[]
  missedQuestions: string[]
  onAnswer: (question: PlacementQuestion, answer: string) => void
  onGoTo: (tab: Tab) => void
  onReset: () => void
}) {
  const answeredCount = Object.keys(answers).length
  const score = completedQuestions.length
  const finished = answeredCount === placementQuestions.length
  const level =
    score <= 2
      ? 'Niveau 1 - bases'
      : score <= 4
        ? 'Niveau 2/3 - lecture guidee'
        : score <= 6
          ? 'Niveau 4/5 - consolidation'
          : 'Niveau 6+ - autonomie progressive'
  const missed = placementQuestions.filter((question) => missedQuestions.includes(question.id))
  const recommendations = missed.length > 0
    ? missed
    : placementQuestions.filter((question) => !completedQuestions.includes(question.id)).slice(0, 2)
  const primaryRecommendation = recommendations[0]?.recommendationTab ?? 'session'

  return (
    <section className="placement-layout">
      <article className="placement-hero">
        <div>
          <p className="eyebrow">Test de niveau</p>
          <h2>{finished ? level : '8 questions pour adapter le parcours'}</h2>
          <p>
            Reponds sans aide. Le resultat sert a choisir le prochain module a travailler,
            pas a bloquer ta progression.
          </p>
        </div>
        <div className="placement-score">
          <strong>{score}/{placementQuestions.length}</strong>
          <span>{finished ? 'score final' : `${answeredCount} reponses`}</span>
        </div>
      </article>

      {finished && (
        <article className="placement-result">
          <div>
            <p className="eyebrow">Recommandation</p>
            <h2>{missed.length === 0 ? 'Tu peux avancer vers la session guidee' : 'Priorite aux points faibles'}</h2>
            <p>
              {missed.length === 0
                ? 'Aucune erreur sur ce test court. Continue avec la session quotidienne et augmente progressivement la difficulte.'
                : 'Travaille d’abord les modules lies aux erreurs, puis relance le test.'}
            </p>
          </div>
          <button type="button" onClick={() => onGoTo(primaryRecommendation)}>
            Ouvrir la recommandation
          </button>
        </article>
      )}

      <div className="placement-actions">
        <button type="button" onClick={onReset}>Recommencer le test</button>
        <button type="button" onClick={() => onGoTo('session')}>Aller a la session</button>
      </div>

      {recommendations.length > 0 && (
        <article className="placement-recommendations">
          <div className="panel-title">
            <h2>Modules conseilles</h2>
            <span>{recommendations.length}</span>
          </div>
          <div className="placement-recommendation-list">
            {recommendations.map((question) => (
              <button key={question.id} type="button" onClick={() => onGoTo(question.recommendationTab)}>
                <strong>{question.skill}</strong>
                <span>{question.explanation}</span>
              </button>
            ))}
          </div>
        </article>
      )}

      <div className="placement-grid">
        {placementQuestions.map((question) => {
          const selected = answers[question.id]
          const correct = selected === question.answer
          const wrong = Boolean(selected) && !correct

          return (
            <article className={correct ? 'placement-card correct' : wrong ? 'placement-card wrong' : 'placement-card'} key={question.id}>
              <div className="word-topline">
                <span>{question.skill}</span>
                <small>{selected ? (correct ? 'Correct' : 'A revoir') : 'Question'}</small>
              </div>
              <h3>{question.prompt}</h3>
              {question.arabic && <strong lang="ar" dir="rtl">{question.arabic}</strong>}
              <div className="placement-options">
                {question.options.map((option) => {
                  const selectedOption = selected === option
                  const correctOption = selectedOption && option === question.answer
                  const wrongOption = selectedOption && option !== question.answer

                  return (
                    <button
                      className={correctOption ? 'correct' : wrongOption ? 'wrong' : ''}
                      key={option}
                      type="button"
                      onClick={() => onAnswer(question, option)}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
              {selected && <p>{correct ? 'Solide.' : question.explanation}</p>}
            </article>
          )
        })}
      </div>
    </section>
  )
}

function AdminContentView({
  adminContent,
  baseExerciseCount,
  baseLessonCount,
  globalBackup,
  lessons,
  onAddExercise,
  onAddLesson,
  onGoTo,
  onImportBackup,
  onImport,
  onReset,
}: {
  adminContent: AdminContent
  baseExerciseCount: number
  baseLessonCount: number
  globalBackup: string
  lessons: Lesson[]
  onAddExercise: (exercise: Exercise) => void
  onAddLesson: (lesson: Lesson) => void
  onGoTo: (tab: Tab) => void
  onImportBackup: (rawJson: string) => void
  onImport: (rawJson: string) => void
  onReset: () => void
}) {
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonLevelId, setLessonLevelId] = useState(levels[0].id)
  const [lessonObjective, setLessonObjective] = useState('')
  const [lessonExplanation, setLessonExplanation] = useState('')
  const [lessonExampleArabic, setLessonExampleArabic] = useState('')
  const [lessonExampleFrench, setLessonExampleFrench] = useState('')
  const [exerciseLessonId, setExerciseLessonId] = useState(lessons[0]?.id ?? '')
  const [exercisePrompt, setExercisePrompt] = useState('')
  const [exerciseAnswer, setExerciseAnswer] = useState('')
  const [exerciseOptions, setExerciseOptions] = useState('')
  const [exerciseHint, setExerciseHint] = useState('')
  const [importJson, setImportJson] = useState('')
  const [backupJson, setBackupJson] = useState('')
  const [status, setStatus] = useState('')
  const exportJson = JSON.stringify(adminContent, null, 2)

  function createSlug(value: string) {
    return normalizeAnswer(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'contenu'
  }

  function submitLesson() {
    if (!lessonTitle.trim() || !lessonObjective.trim()) {
      setStatus('Ajoute au moins un titre et un objectif.')
      return
    }

    const levelLessons = lessons.filter((lesson) => lesson.levelId === lessonLevelId)
    const nextOrder = Math.max(0, ...levelLessons.map((lesson) => lesson.order)) + 1
    const lesson: Lesson = {
      id: `admin-lesson-${Date.now()}-${createSlug(lessonTitle)}`,
      levelId: lessonLevelId,
      order: nextOrder,
      title: lessonTitle.trim(),
      durationMinutes: 25,
      objective: lessonObjective.trim(),
      explanation: lessonExplanation.trim() || 'Leçon ajoutée depuis l’espace admin local.',
      examples: lessonExampleArabic.trim()
        ? [{ arabic: lessonExampleArabic.trim(), transliteration: '', french: lessonExampleFrench.trim() || 'Exemple ajoute localement.' }]
        : [],
      practice: ['Lire la leçon.', 'Écouter les exemples.', 'Valider avec un exercice.'],
      validation: 'Expliquer la notion avec ses propres mots.',
    }

    onAddLesson(lesson)
    setExerciseLessonId(lesson.id)
    setLessonTitle('')
    setLessonObjective('')
    setLessonExplanation('')
    setLessonExampleArabic('')
    setLessonExampleFrench('')
    setStatus('Leçon ajoutée localement.')
  }

  function submitExercise() {
    const options = exerciseOptions.split(',').map((option) => option.trim()).filter(Boolean)
    if (!exercisePrompt.trim() || !exerciseAnswer.trim() || options.length < 2) {
      setStatus('Ajoute une question, une reponse et au moins deux options separees par des virgules.')
      return
    }

    const exercise: Exercise = {
      id: `admin-exercise-${Date.now()}-${createSlug(exercisePrompt)}`,
      lessonId: exerciseLessonId || lessons[0].id,
      skill: 'vocabulary',
      prompt: exercisePrompt.trim(),
      answer: exerciseAnswer.trim(),
      options: options.includes(exerciseAnswer.trim()) ? options : [exerciseAnswer.trim(), ...options],
      hint: exerciseHint.trim() || 'Relis la lecon associee.',
    }

    onAddExercise(exercise)
    setExercisePrompt('')
    setExerciseAnswer('')
    setExerciseOptions('')
    setExerciseHint('')
    setStatus('Exercice ajoute localement.')
  }

  function submitImport() {
    try {
      onImport(importJson)
      setStatus('Import JSON applique.')
    } catch {
      setStatus('JSON invalide. Verifie la syntaxe avant import.')
    }
  }

  function submitBackupImport() {
    try {
      onImportBackup(backupJson)
      setStatus('Backup global restaure.')
    } catch {
      setStatus('Backup invalide. Verifie que le JSON vient bien de cette app.')
    }
  }

  return (
    <section className="admin-layout">
      <article className="admin-hero">
        <div>
          <p className="eyebrow">Admin contenu</p>
          <h2>Piloter le programme sans toucher au code</h2>
          <p>Les ajouts et la progression sont sauvegardes localement avec un schema versionne v{STORAGE_SCHEMA_VERSION}.</p>
        </div>
        <div className="admin-score">
          <strong>{adminContent.lessons.length}/{adminContent.exercises.length}</strong>
          <span>locaux</span>
        </div>
      </article>

      <div className="admin-actions">
        <button type="button" onClick={() => onGoTo('guide')}>Voir le guide</button>
        <button type="button" onClick={() => onGoTo('exercises')}>Voir exercices</button>
        <button type="button" onClick={onReset}>Reset local</button>
        {status && <span>{status}</span>}
      </div>

      <div className="admin-grid">
        <article className="admin-panel">
          <div className="panel-title">
            <h2>Ajouter une lecon</h2>
            <span>{baseLessonCount + adminContent.lessons.length} total</span>
          </div>
          <label>
            Niveau
            <select value={lessonLevelId} onChange={(event) => setLessonLevelId(event.target.value)}>
              {levels.map((level) => <option key={level.id} value={level.id}>{level.title}</option>)}
            </select>
          </label>
          <label>
            Titre
            <input value={lessonTitle} onChange={(event) => setLessonTitle(event.target.value)} />
          </label>
          <label>
            Objectif
            <input value={lessonObjective} onChange={(event) => setLessonObjective(event.target.value)} />
          </label>
          <label>
            Explication
            <textarea value={lessonExplanation} onChange={(event) => setLessonExplanation(event.target.value)} />
          </label>
          <label>
            Exemple arabe
            <input value={lessonExampleArabic} onChange={(event) => setLessonExampleArabic(event.target.value)} />
          </label>
          <label>
            Sens exemple
            <input value={lessonExampleFrench} onChange={(event) => setLessonExampleFrench(event.target.value)} />
          </label>
          <button type="button" onClick={submitLesson}>Ajouter la lecon</button>
        </article>

        <article className="admin-panel">
          <div className="panel-title">
            <h2>Ajouter un exercice</h2>
            <span>{baseExerciseCount + adminContent.exercises.length} total</span>
          </div>
          <label>
            Leçon
            <select value={exerciseLessonId} onChange={(event) => setExerciseLessonId(event.target.value)}>
              {lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}
            </select>
          </label>
          <label>
            Question
            <input value={exercisePrompt} onChange={(event) => setExercisePrompt(event.target.value)} />
          </label>
          <label>
            Reponse
            <input value={exerciseAnswer} onChange={(event) => setExerciseAnswer(event.target.value)} />
          </label>
          <label>
            Options
            <input placeholder="Option 1, Option 2, Option 3" value={exerciseOptions} onChange={(event) => setExerciseOptions(event.target.value)} />
          </label>
          <label>
            Indice
            <input value={exerciseHint} onChange={(event) => setExerciseHint(event.target.value)} />
          </label>
          <button type="button" onClick={submitExercise}>Ajouter l exercice</button>
        </article>
      </div>

      <article className="admin-panel">
        <div className="panel-title">
          <h2>Exporter / importer</h2>
          <span>JSON local</span>
        </div>
        <div className="admin-json-grid">
          <label>
            Export
            <textarea readOnly value={exportJson} />
          </label>
          <label>
            Import
            <textarea value={importJson} onChange={(event) => setImportJson(event.target.value)} />
          </label>
        </div>
        <button type="button" onClick={submitImport}>Importer JSON</button>
      </article>

      <article className="admin-panel">
        <div className="panel-title">
          <h2>Backup global</h2>
          <span>schema v{STORAGE_SCHEMA_VERSION}</span>
        </div>
        <div className="admin-json-grid">
          <label>
            Export complet
            <textarea readOnly value={globalBackup} />
          </label>
          <label>
            Restaurer
            <textarea value={backupJson} onChange={(event) => setBackupJson(event.target.value)} />
          </label>
        </div>
        <button type="button" onClick={submitBackupImport}>Restaurer backup</button>
      </article>

      <article className="admin-panel">
        <div className="panel-title">
          <h2>Contenu local</h2>
          <span>{adminContent.lessons.length + adminContent.exercises.length} element(s)</span>
        </div>
        <div className="admin-content-list">
          {adminContent.lessons.map((lesson) => (
            <button key={lesson.id} type="button" onClick={() => onGoTo('guide')}>
              <strong>Leçon</strong>
              <span>{lesson.title}</span>
            </button>
          ))}
          {adminContent.exercises.map((exercise) => (
            <button key={exercise.id} type="button" onClick={() => onGoTo('exercises')}>
              <strong>Exercice</strong>
              <span>{exercise.prompt}</span>
            </button>
          ))}
          {adminContent.lessons.length + adminContent.exercises.length === 0 && <p>Aucun contenu local pour le moment.</p>}
        </div>
      </article>
    </section>
  )
}

function GuideView({
  completedLessons,
  currentLevel,
  lessons,
  onListen,
  onSelectLesson,
  onToggleLesson,
  selectedLesson,
}: {
  completedLessons: string[]
  currentLevel: number
  lessons: Lesson[]
  onListen: (item: Pick<ListeningItem, 'id' | 'arabic'>) => void
  onSelectLesson: (lessonId: string) => void
  onToggleLesson: (lessonId: string) => void
  selectedLesson: Lesson
}) {
  const selectedDone = completedLessons.includes(selectedLesson.id)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const normalizedSearch = normalizeAnswer(search)
  const visibleLessonCount = lessons.filter((lesson) => {
    const matchesLevel = levelFilter === 'all' || lesson.levelId === levelFilter
    const matchesSearch = !normalizedSearch || normalizeAnswer(`${lesson.title} ${lesson.objective}`).includes(normalizedSearch)
    return matchesLevel && matchesSearch
  }).length

  return (
    <section className="guide-layout">
      <div className="guide-sidebar">
        <div className="section-heading">
          <p className="eyebrow">Guide complet</p>
          <h2>Curriculum par lecons</h2>
        </div>

        <div className="filter-bar">
          <input
            aria-label="Rechercher une lecon"
            placeholder="Rechercher..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select aria-label="Filtrer par niveau" value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)}>
            <option value="all">Tous niveaux</option>
            {levels.map((level) => <option key={level.id} value={level.id}>{level.title}</option>)}
          </select>
        </div>

        {levels.map((level, index) => {
          if (levelFilter !== 'all' && levelFilter !== level.id) return null
          const locked = currentLevel < index + 1
          const levelLessons = lessons.filter((lesson) => {
            const matchesLevel = lesson.levelId === level.id
            const matchesSearch = !normalizedSearch || normalizeAnswer(`${lesson.title} ${lesson.objective}`).includes(normalizedSearch)
            return matchesLevel && matchesSearch
          })
          if (levelLessons.length === 0) return null
          const doneCount = levelLessons.filter((lesson) => completedLessons.includes(lesson.id)).length

          return (
            <article className={locked ? 'guide-level locked' : 'guide-level'} key={level.id}>
              <div className="guide-level-header">
                <div>
                  <span>{locked ? 'A debloquer' : 'Disponible'}</span>
                  <h3>{level.title}</h3>
                </div>
                <strong>{doneCount}/{levelLessons.length}</strong>
              </div>
              <div className="lesson-menu">
                {levelLessons.map((lesson) => (
                  <button
                    className={selectedLesson.id === lesson.id ? 'lesson-menu-item active' : 'lesson-menu-item'}
                    key={lesson.id}
                    onClick={() => onSelectLesson(lesson.id)}
                    type="button"
                  >
                    <span>{lesson.order}</span>
                    {lesson.title}
                  </button>
                ))}
              </div>
            </article>
          )
        })}
        {visibleLessonCount === 0 && (
          <article className="empty-state">
            <h3>Aucune leçon trouvée</h3>
            <p>Essaie un autre mot-clé ou affiche tous les niveaux.</p>
          </article>
        )}
      </div>

      <article className={selectedDone ? 'lesson-detail complete' : 'lesson-detail'}>
        <div className="lesson-detail-header">
          <div>
            <p className="eyebrow">Leçon {selectedLesson.order}</p>
            <h2>{selectedLesson.title}</h2>
            <span>{selectedLesson.durationMinutes} min</span>
          </div>
          <button type="button" onClick={() => onToggleLesson(selectedLesson.id)}>
            {selectedDone ? 'Leçon terminée' : 'Marquer terminée'}
          </button>
        </div>

        <section className="lesson-block">
          <h3>Objectif</h3>
          <p>{selectedLesson.objective}</p>
        </section>

        <section className="lesson-block">
          <h3>Explication</h3>
          <p>{selectedLesson.explanation}</p>
        </section>

        <section className="lesson-block">
          <h3>Exemples</h3>
          <div className="example-list">
            {selectedLesson.examples.map((example, index) => (
              <div className="example-row" key={`${example.arabic}-${example.french}`}>
                {example.arabic && <strong lang="ar" dir="rtl">{example.arabic}</strong>}
                <span>{example.transliteration}</span>
                <p>{example.french}</p>
                {example.arabic && (
                  <button
                    className="listen-button"
                    type="button"
                    onClick={() => onListen({ id: `${selectedLesson.id}-example-${index}`, arabic: example.arabic ?? '' })}
                  >
                    Écouter
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="lesson-block">
          <h3>Pratique</h3>
          <ol>
            {selectedLesson.practice.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </section>

        <section className="lesson-block validation-block">
          <h3>Validation</h3>
          <p>{selectedLesson.validation}</p>
        </section>
      </article>
    </section>
  )
}

function ExercisesView({
  answers,
  completedExercises,
  exerciseCompletion,
  exercises,
  lessons,
  onAnswer,
  onReset,
}: {
  answers: Record<string, string>
  completedExercises: string[]
  exerciseCompletion: number
  exercises: Exercise[]
  lessons: Lesson[]
  onAnswer: (exercise: Exercise, answer: string) => void
  onReset: () => void
}) {
  const [search, setSearch] = useState('')
  const [lessonFilter, setLessonFilter] = useState('all')
  const normalizedSearch = normalizeAnswer(search)
  const visibleExerciseCount = exercises.filter((exercise) => {
    const matchesLesson = lessonFilter === 'all' || exercise.lessonId === lessonFilter
    const matchesSearch = !normalizedSearch || normalizeAnswer(`${exercise.prompt} ${exercise.answer} ${exercise.hint}`).includes(normalizedSearch)
    return matchesLesson && matchesSearch
  }).length

  return (
    <section className="content-stack">
      <div className="section-heading split-heading">
        <div>
          <p className="eyebrow">Exercices guides</p>
          <h2>Valider les notions lecon par lecon</h2>
        </div>
        <div className="compact-score">
          <strong>{exerciseCompletion}%</strong>
          réussite
        </div>
      </div>

      <div className="filter-bar wide">
        <input
          aria-label="Rechercher un exercice"
          placeholder="Rechercher un exercice..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select aria-label="Filtrer par lecon" value={lessonFilter} onChange={(event) => setLessonFilter(event.target.value)}>
          <option value="all">Toutes les lecons</option>
          {lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}
        </select>
      </div>

      <div className="exercise-sections">
        {lessons.map((lesson) => {
          if (lessonFilter !== 'all' && lessonFilter !== lesson.id) return null
          const lessonExercises = exercises.filter((exercise) => {
            const matchesLesson = exercise.lessonId === lesson.id
            const matchesSearch = !normalizedSearch || normalizeAnswer(`${exercise.prompt} ${exercise.answer} ${exercise.hint}`).includes(normalizedSearch)
            return matchesLesson && matchesSearch
          })
          if (lessonExercises.length === 0) return null

          return (
            <article className="exercise-section" key={lesson.id}>
              <div className="exercise-section-header">
                <div>
                  <span>Leçon {lesson.order}</span>
                  <h3>{lesson.title}</h3>
                </div>
                <strong>{lessonExercises.filter((exercise) => completedExercises.includes(exercise.id)).length}/{lessonExercises.length}</strong>
              </div>

              <div className="exercise-grid">
                {lessonExercises.map((exercise) => {
                  const selected = answers[exercise.id]
                  const isComplete = completedExercises.includes(exercise.id)

                  return (
                    <div className={isComplete ? 'exercise-card complete' : 'exercise-card'} key={exercise.id}>
                      <div className="exercise-card-top">
                        <span>{exercise.skill}</span>
                        {isComplete && <strong>Valide</strong>}
                      </div>
                      <h3>{exercise.prompt}</h3>
                      <div className="exercise-options">
                        {exercise.options.map((option) => {
                          const isSelected = selected === option
                          const isCorrect = isSelected && option === exercise.answer
                          const isWrong = isSelected && option !== exercise.answer

                          return (
                            <button
                              className={isCorrect ? 'correct' : isWrong ? 'wrong' : ''}
                              key={option}
                              type="button"
                              onClick={() => onAnswer(exercise, option)}
                            >
                              {option}
                            </button>
                          )
                        })}
                      </div>
                      {selected && selected !== exercise.answer && <p className="hint">Indice : {exercise.hint}</p>}
                    </div>
                  )
                })}
              </div>
            </article>
          )
        })}
        {visibleExerciseCount === 0 && (
          <article className="empty-state">
            <h3>Aucun exercice trouvé</h3>
            <p>Change le filtre de leçon ou simplifie ta recherche.</p>
          </article>
        )}
      </div>

      <button className="ghost-button" type="button" onClick={onReset}>Réinitialiser les exercices</button>
    </section>
  )
}

function ListeningView({
  listenedItems,
  listeningCompletion,
  onListen,
}: {
  listenedItems: string[]
  listeningCompletion: number
  onListen: (item: Pick<ListeningItem, 'id' | 'arabic'>) => void
}) {
  return (
    <section className="content-stack">
      <div className="section-heading split-heading">
        <div>
          <p className="eyebrow">Écoute et prononciation</p>
          <h2>Entendre, repeter, puis reconnaitre</h2>
        </div>
        <div className="compact-score">
          <strong>{listeningCompletion}%</strong>
          ecoute
        </div>
      </div>

      <article className="listening-note">
        <h3>Routine conseillee</h3>
        <p>Écoute une première fois, répète lentement, puis écoute encore une fois en regardant l’arabe.</p>
      </article>

      <div className="listening-grid">
        {listeningItems.map((item) => {
          const done = listenedItems.includes(item.id)

          return (
            <article className={done ? 'listening-card done' : 'listening-card'} key={item.id}>
              <div className="word-topline">
                <span>{item.category}</span>
                <small>{done ? 'Écouté' : 'Nouveau'}</small>
              </div>
              <strong lang="ar" dir="rtl">{item.arabic}</strong>
              <span>{item.transliteration}</span>
              <p>{item.french}</p>
              <button type="button" onClick={() => onListen(item)}>Écouter</button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function ReadingView({ onListen }: { onListen: (item: Pick<ListeningItem, 'id' | 'arabic'>) => void }) {
  return (
    <section className="content-stack">
      <div className="section-heading">
        <p className="eyebrow">Lecture progressive</p>
        <h2>Voyelles, signes et syllabes</h2>
      </div>

      <div className="reading-grid">
        {vowels.map((vowel) => (
          <article className="reading-card" key={vowel.id}>
            <div className="word-topline">
              <span>{vowel.name}</span>
              <small>{vowel.sound}</small>
            </div>
            <strong lang="ar" dir="rtl">{vowel.example}</strong>
            <p>{vowel.position}</p>
            <span>{vowel.transliteration}</span>
            <button type="button" onClick={() => onListen({ id: `vowel-${vowel.id}`, arabic: vowel.example })}>
              Écouter
            </button>
          </article>
        ))}
      </div>

      <article className="reading-practice">
        <div className="panel-title">
          <h2>Syllabes a lire</h2>
          <span>{syllables.length} cartes</span>
        </div>
        <div className="syllable-grid">
          {syllables.map((syllable) => (
            <button
              className="syllable-card"
              key={syllable.id}
              type="button"
              onClick={() => onListen({ id: `syllable-${syllable.id}`, arabic: syllable.arabic })}
            >
              <strong lang="ar" dir="rtl">{syllable.arabic}</strong>
              <span>{syllable.transliteration}</span>
              <small>{syllable.pattern}</small>
            </button>
          ))}
        </div>
      </article>
    </section>
  )
}

function DevocalizedView({
  answers,
  completedItems,
  onAnswer,
  onListen,
}: {
  answers: Record<string, string>
  completedItems: string[]
  onAnswer: (item: DevocalizedItem, answer: string) => void
  onListen: (item: DevocalizedItem) => void
}) {
  const [viewMode, setViewMode] = useState<'full' | 'semi' | 'none'>('full')

  function getArabic(item: DevocalizedItem) {
    if (viewMode === 'full') return item.fullyVocalized
    if (viewMode === 'semi') return item.semiVocalized
    return item.unvocalized
  }

  return (
    <section className="content-stack">
      <div className="section-heading split-heading">
        <div>
          <p className="eyebrow">Lecture sans voyelles</p>
          <h2>Retirer les harakat progressivement</h2>
        </div>
        <div className="mode-switcher">
          <button className={viewMode === 'full' ? 'active' : ''} type="button" onClick={() => setViewMode('full')}>
            Vocalise
          </button>
          <button className={viewMode === 'semi' ? 'active' : ''} type="button" onClick={() => setViewMode('semi')}>
            Semi
          </button>
          <button className={viewMode === 'none' ? 'active' : ''} type="button" onClick={() => setViewMode('none')}>
            Sans
          </button>
        </div>
      </div>

      <article className="devocalized-note">
        <h3>Methode</h3>
        <p>Lis avec toutes les voyelles, puis enleve une partie des aides, puis lis comme dans un texte reel.</p>
      </article>

      <div className="devocalized-grid">
        {devocalizedItems.map((item) => {
          const selected = answers[item.id]
          const done = completedItems.includes(item.id)

          return (
            <article className={done ? 'devocalized-card done' : 'devocalized-card'} key={item.id}>
              <div className="word-topline">
                <span>{item.transliteration}</span>
                <small>{done ? 'Reconnu' : 'A lire'}</small>
              </div>
              <strong lang="ar" dir="rtl">{getArabic(item)}</strong>
              <p>{viewMode === 'none' ? 'Lis sans harakat, puis choisis le sens.' : item.french}</p>
              <button className="listen-button" type="button" onClick={() => onListen(item)}>Écouter</button>

              <div className="devocalized-options">
                {item.options.map((option) => {
                  const isSelected = selected === option
                  const isCorrect = isSelected && option === item.french
                  const isWrong = isSelected && option !== item.french

                  return (
                    <button
                      className={isCorrect ? 'correct' : isWrong ? 'wrong' : ''}
                      key={option}
                      type="button"
                      onClick={() => onAnswer(item, option)}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function PhonemesView({
  answers,
  completedPairs,
  onAnswer,
  onListen,
}: {
  answers: Record<string, string>
  completedPairs: string[]
  onAnswer: (pair: PhonemePair, answer: string) => void
  onListen: (id: string, arabic: string) => void
}) {
  return (
    <section className="content-stack">
      <div className="section-heading split-heading">
        <div>
          <p className="eyebrow">Phonemes contrastifs</p>
          <h2>Distinguer les sons qui changent le sens</h2>
        </div>
        <div className="compact-score">
          <strong>{completedPairs.length}/{phonemePairs.length}</strong>
          acquis
        </div>
      </div>

      <article className="phoneme-note">
        <h3>Routine</h3>
        <p>Écoute les deux exemples, répète lentement, puis réponds à la question sans regarder l’indice.</p>
      </article>

      <div className="phoneme-grid">
        {phonemePairs.map((pair) => {
          const selected = answers[pair.id]
          const done = completedPairs.includes(pair.id)

          return (
            <article className={done ? 'phoneme-card done' : 'phoneme-card'} key={pair.id}>
              <div className="phoneme-head">
                <div>
                  <strong>{pair.title}</strong>
                  <span>{pair.focus}</span>
                </div>
                <em>{done ? 'Acquis' : 'A travailler'}</em>
              </div>

              <p>{pair.note}</p>

              <div className="phoneme-pair">
                {[pair.first, pair.second].map((sound) => (
                  <div className="phoneme-sound" key={`${pair.id}-${sound.letter}`}>
                    <strong lang="ar" dir="rtl">{sound.letter}</strong>
                    <span>{sound.name}</span>
                    <p>{sound.cue}</p>
                    <button type="button" onClick={() => onListen(`${pair.id}-${sound.letter}`, sound.example)}>
                      <span lang="ar" dir="rtl">{sound.example}</span>
                      {sound.transliteration} - {sound.french}
                    </button>
                  </div>
                ))}
              </div>

              <div className="phoneme-quiz">
                <h3>{pair.question}</h3>
                <div className="phoneme-options">
                  {pair.options.map((option) => {
                    const isSelected = selected === option
                    const isCorrect = isSelected && option === pair.answer
                    const isWrong = isSelected && option !== pair.answer

                    return (
                      <button
                        className={isCorrect ? 'correct' : isWrong ? 'wrong' : ''}
                        key={option}
                        type="button"
                        onClick={() => onAnswer(pair, option)}
                      >
                        <span lang="ar" dir="rtl">{option}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function DictationView({
  answers,
  completedItems,
  missedItems,
  typedAnswers,
  onAnswer,
  onListen,
  onType,
}: {
  answers: Record<string, string>
  completedItems: string[]
  missedItems: string[]
  typedAnswers: Record<string, string>
  onAnswer: (item: DictationItem, answer: string) => void
  onListen: (item: DictationItem) => void
  onType: (itemId: string, value: string) => void
}) {
  const missedCards = dictationItems.filter((item) => missedItems.includes(item.id))

  return (
    <section className="content-stack">
      <div className="section-heading split-heading">
        <div>
          <p className="eyebrow">Dictée active</p>
          <h2>Écouter sans regarder, puis reconnaître</h2>
        </div>
        <div className="compact-score">
          <strong>{completedItems.length}/{dictationItems.length}</strong>
          réussies
        </div>
      </div>

      <article className="dictation-note">
        <h3>Mode d'entrainement</h3>
        <p>Appuie sur Écouter, réponds sans lire l’arabe, puis révèle le mot seulement après ta réponse.</p>
      </article>

      {missedCards.length > 0 && (
        <article className="dictation-review">
          <div className="panel-title">
            <h2>Erreurs a revoir</h2>
            <span>{missedCards.length} carte(s)</span>
          </div>
          <div className="dictation-review-list">
            {missedCards.map((item) => (
              <button key={item.id} type="button" onClick={() => onListen(item)}>
                <span lang="ar" dir="rtl">{item.arabic}</span>
                {item.transliteration} - {item.french}
              </button>
            ))}
          </div>
        </article>
      )}

      <div className="dictation-grid">
        {dictationItems.map((item) => {
          const selected = answers[item.id]
          const typed = typedAnswers[item.id] ?? ''
          const done = completedItems.includes(item.id)
          const missed = missedItems.includes(item.id)
          const showArabic = Boolean(selected)
          const typedMode = item.level === 'moyen'
          const currentAnswerIsCorrect = selected
            ? item.acceptedAnswers.some((acceptedAnswer) => normalizeAnswer(acceptedAnswer) === normalizeAnswer(selected))
            : false

          return (
            <article className={done ? 'dictation-card done' : missed ? 'dictation-card missed' : 'dictation-card'} key={item.id}>
              <div className="word-topline">
                <span>{item.level}</span>
                <small>{done ? 'Reussi' : missed ? 'A revoir' : 'A ecouter'}</small>
              </div>

              <div className="dictation-hidden" aria-label={showArabic ? item.arabic : 'Mot cache'}>
                {showArabic ? (
                  <>
                    <strong lang="ar" dir="rtl">{item.arabic}</strong>
                    <span>{item.transliteration}</span>
                  </>
                ) : (
                  <>
                    <strong>?</strong>
                    <span>Mot cache</span>
                  </>
                )}
              </div>

              <p>{item.prompt}</p>
              <button className="listen-button" type="button" onClick={() => onListen(item)}>Écouter</button>

              {typedMode ? (
                <div className="dictation-input-row">
                  <input
                    aria-label={`Reponse pour ${item.id}`}
                    placeholder="Tape le sens..."
                    type="text"
                    value={typed}
                    onChange={(event) => onType(item.id, event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') onAnswer(item, typed)
                    }}
                  />
                  <button type="button" onClick={() => onAnswer(item, typed)}>Valider</button>
                </div>
              ) : (
                <div className="dictation-options">
                  {item.options.map((option) => {
                    const isSelected = selected === option
                    const isCorrect = isSelected && normalizeAnswer(option) === normalizeAnswer(item.answer)
                    const isWrong = isSelected && !isCorrect

                    return (
                      <button
                        className={isCorrect ? 'correct' : isWrong ? 'wrong' : ''}
                        key={option}
                        type="button"
                        onClick={() => onAnswer(item, option)}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              )}

              {selected && (
                <p className={currentAnswerIsCorrect ? 'dictation-feedback correct' : 'dictation-feedback wrong'}>
                  {currentAnswerIsCorrect ? `Correct : ${item.french}` : `A revoir : ${item.french}`}
                </p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

function RootsView({
  knownWords,
  onAddWord,
  onListen,
}: {
  knownWords: string[]
  onAddWord: (word: RootWord) => void
  onListen: (word: RootWord) => void
}) {
  return (
    <section className="content-stack">
      <div className="section-heading">
        <p className="eyebrow">Racines trilitteres</p>
        <h2>Une racine, une famille de mots</h2>
      </div>

      <article className="roots-intro">
        <h3>Principe</h3>
        <p>
          Chaque racine porte un noyau de sens. En changeant le schema du mot, on obtient une action,
          une personne, un lieu, un objet ou un resultat.
        </p>
      </article>

      <div className="roots-grid">
        {roots.map((root) => {
          const knownCount = root.family.filter((word) => knownWords.includes(word.id)).length

          return (
            <article className="root-card" key={root.id}>
              <div className="root-card-header">
                <div>
                  <strong lang="ar" dir="rtl">{root.arabic}</strong>
                  <span>{root.latin}</span>
                </div>
                <em>{knownCount}/{root.family.length}</em>
              </div>
              <h3>{root.meaning}</h3>
              <p>{root.note}</p>

              <div className="root-family">
                {root.family.map((word) => {
                  const known = knownWords.includes(word.id)

                  return (
                    <div className={known ? 'root-word known' : 'root-word'} key={word.id}>
                      <div>
                        <strong lang="ar" dir="rtl">{word.arabic}</strong>
                        <span>{word.transliteration}</span>
                      </div>
                      <p>{word.french}</p>
                      <small>{word.patternName}</small>
                      <div className="root-word-actions">
                        <button type="button" onClick={() => onListen(word)}>Écouter</button>
                        <button type="button" onClick={() => onAddWord(word)}>
                          {known ? 'Ajoute' : 'Reviser'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function PatternsView({
  answers,
  completedPatterns,
  onAnswer,
  onComplete,
  onListen,
}: {
  answers: Record<string, string>
  completedPatterns: string[]
  onAnswer: (pattern: Pattern, answer: string) => void
  onComplete: (patternId: string) => void
  onListen: (word: RootWord) => void
}) {
  const rootWords = roots.flatMap((root) => root.family.map((word) => ({ ...word, root: root.arabic })))

  return (
    <section className="content-stack">
      <div className="section-heading">
        <p className="eyebrow">Schèmes / Wazn</p>
        <h2>La forme donne le role du mot</h2>
      </div>

      <article className="patterns-intro">
        <h3>Principe</h3>
        <p>
          Une racine porte le sens profond. Le schème donne la fonction : action, personne, lieu,
          institution, resultat ou processus.
        </p>
      </article>

      <div className="patterns-grid">
        {patterns.map((pattern) => {
          const example = rootWords.find((word) => word.id === pattern.exampleWordId)
          const selected = answers[pattern.id]
          const done = completedPatterns.includes(pattern.id)

          return (
            <article className={done ? 'pattern-card done' : 'pattern-card'} key={pattern.id}>
              <div className="pattern-head">
                <div>
                  <strong lang="ar" dir="rtl">{pattern.arabic}</strong>
                  <span>{pattern.transliteration}</span>
                </div>
                <em>{done ? 'Etudie' : 'A etudier'}</em>
              </div>
              <h3>{pattern.name}</h3>
              <p>{pattern.meaning}</p>

              {example && (
                <div className="pattern-formula">
                  <span lang="ar" dir="rtl">{pattern.exampleRoot}</span>
                  <small>+</small>
                  <span lang="ar" dir="rtl">{pattern.arabic}</span>
                  <small>=</small>
                  <strong lang="ar" dir="rtl">{example.arabic}</strong>
                  <p>{example.transliteration} · {example.french}</p>
                  <button type="button" onClick={() => onListen(example)}>Écouter</button>
                </div>
              )}

              <div className="pattern-quiz">
                <h3>{pattern.question}</h3>
                <div className="pattern-options">
                  {pattern.options.map((option) => {
                    const isSelected = selected === option
                    const isCorrect = isSelected && option === pattern.answer
                    const isWrong = isSelected && option !== pattern.answer

                    return (
                      <button
                        className={isCorrect ? 'correct' : isWrong ? 'wrong' : ''}
                        key={option}
                        type="button"
                        onClick={() => onAnswer(pattern, option)}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button className="pattern-complete" type="button" onClick={() => onComplete(pattern.id)}>
                {done ? 'Valide' : 'Marquer etudie'}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

export default App
