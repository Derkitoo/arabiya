import type { Level } from '../content/levels'
import { dayKey } from './date'
import type { Card } from './srs'

/** Persistance locale. Une seule clé, un seul schéma versionné, une seule porte
   d'entrée — c'est ce qui manquait à la version précédente. */

const KEY = 'arabiya:v1'
const SCHEMA = 2

export type Profile = {
  schema: number
  /** niveau déclaré à l'inscription ; null pour les profils antérieurs à cette étape */
  level: Level | null
  /** null tant que l'onboarding n'est pas fait */
  goalMinutes: number | null
  /** jours d'activité au format YYYY-MM-DD, du plus ancien au plus récent */
  activeDays: string[]
  /** nombre de sessions terminées */
  sessionsDone: number
  /** état de répétition espacée, indexé par id d'exercice */
  cards: Record<string, Card>
  /** thème d'affichage : système, clair ou sombre luxueux */
  theme?: 'system' | 'light' | 'dark'
}

/** Forme du schéma 1, conservée uniquement pour la migration. */
type ProfileV1 = {
  schema: 1
  goalMinutes: number | null
  activeDays: string[]
  sessionsDone: number
  learned: string[]
}

export const emptyProfile: Profile = {
  schema: SCHEMA,
  level: null,
  goalMinutes: null,
  activeDays: [],
  sessionsDone: 0,
  cards: {},
}

/** Le schéma 1 ne retenait qu'une liste d'items réussis. On les recrée comme des cartes
 *  vues une fois et dues aujourd'hui, plutôt que de jeter la progression de l'utilisateur. */
function migrateV1(old: ProfileV1, today: string): Profile {
  const cards: Record<string, Card> = {}
  for (const id of old.learned ?? []) {
    cards[id] = { reps: 1, ease: 2.5, interval: 1, due: today, lapses: 0 }
  }
  return {
    schema: SCHEMA,
    // Le schéma 1 ne connaissait pas les niveaux : ces profils ont déjà leurs cartes.
    level: null,
    goalMinutes: old.goalMinutes ?? null,
    activeDays: old.activeDays ?? [],
    sessionsDone: old.sessionsDone ?? 0,
    cards,
  }
}

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyProfile
    const parsed = JSON.parse(raw) as Partial<Profile> & Partial<ProfileV1>
    if (parsed.schema === 1) return migrateV1(parsed as ProfileV1, todayKey())
    if (parsed.schema !== SCHEMA) return emptyProfile
    return { ...emptyProfile, ...(parsed as Partial<Profile>), cards: parsed.cards ?? {} }
  } catch {
    return emptyProfile
  }
}

export function saveProfile(profile: Profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile))
  } catch {
    // Mode privé ou quota plein : on continue sans persistance plutôt que de planter.
  }
}

export const todayKey = dayKey

/** Nombre de jours consécutifs terminant aujourd'hui ou hier. */
export function streakOf(activeDays: string[]) {
  if (activeDays.length === 0) return 0
  const days = new Set(activeDays)
  const cursor = new Date()
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(dayKey(cursor))) return 0
  }
  let streak = 0
  while (days.has(dayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
