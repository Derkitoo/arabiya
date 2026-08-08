import type { ReviewQuality, WordReview } from '../types'

const dayMs = 24 * 60 * 60 * 1000

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function addDaysISO(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function createInitialReview(): WordReview {
  return {
    repetitions: 0,
    intervalDays: 0,
    ease: 2.3,
    dueDate: todayISO(),
  }
}

export function isDue(review: WordReview | undefined) {
  if (!review) return true
  return review.dueDate <= todayISO()
}

export function daysUntilDue(review: WordReview | undefined) {
  if (!review) return 0
  const due = new Date(`${review.dueDate}T00:00:00`)
  const today = new Date(`${todayISO()}T00:00:00`)
  return Math.max(0, Math.round((due.getTime() - today.getTime()) / dayMs))
}

export function gradeWord(review: WordReview | undefined, quality: ReviewQuality): WordReview {
  const current = review ?? createInitialReview()

  if (quality === 'again') {
    return {
      repetitions: 0,
      intervalDays: 0,
      ease: Math.max(1.3, current.ease - 0.2),
      dueDate: todayISO(),
      lastReviewed: todayISO(),
    }
  }

  const ease = quality === 'easy' ? current.ease + 0.15 : Math.max(1.3, current.ease - 0.1)
  const nextRepetitions = current.repetitions + 1
  const baseInterval = nextRepetitions === 1 ? 1 : nextRepetitions === 2 ? 3 : current.intervalDays * ease
  const intervalDays = Math.max(1, Math.round(quality === 'easy' ? baseInterval + 1 : baseInterval))

  return {
    repetitions: nextRepetitions,
    intervalDays,
    ease,
    dueDate: addDaysISO(intervalDays),
    lastReviewed: todayISO(),
  }
}
