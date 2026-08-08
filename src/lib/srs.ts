import { addDays } from './date'

/** Répétition espacée, variante simplifiée de SM-2 à granularité d'un jour.
 *
 *  Chaque item (lettre ou mot) a une carte : un facteur de facilité, un intervalle en jours,
 *  et une date d'échéance. Une réussite allonge l'intervalle, un échec le remet à zéro et
 *  rend la carte un peu plus difficile durablement. */

export type Card = {
  /** réussites consécutives ; retombe à 0 à chaque échec */
  reps: number
  /** facteur de facilité, entre 1.3 et 2.8 */
  ease: number
  /** intervalle courant en jours */
  interval: number
  /** date d'échéance au format YYYY-MM-DD */
  due: string
  /** nombre total d'échecs, sert à prioriser les cartes qui résistent */
  lapses: number
}

const EASE_START = 2.5
const EASE_MIN = 1.3
const EASE_MAX = 2.8
/** Plafond d'un an : au-delà, l'intervalle calculé n'a plus de sens pédagogique
 *  (la simulation atteignait 3 ans et demi) et une lettre ne reviendrait jamais. */
const INTERVAL_MAX = 365

export function isDue(card: Card, today: string) {
  return card.due <= today
}

/** Applique une réponse à une carte et renvoie la carte mise à jour.
 *  Une carte encore jamais vue est créée à la volée. */
export function review(card: Card | undefined, correct: boolean, today: string): Card {
  const current: Card = card ?? {
    reps: 0,
    ease: EASE_START,
    interval: 0,
    due: today,
    lapses: 0,
  }

  if (!correct) {
    // Échec : la carte revient dès la prochaine session et devient durablement plus dure.
    return {
      reps: 0,
      ease: Math.max(EASE_MIN, current.ease - 0.2),
      interval: 0,
      due: today,
      lapses: current.lapses + 1,
    }
  }

  const reps = current.reps + 1
  // Les deux premiers paliers sont fixes : c'est là que l'ancrage se joue.
  const interval = Math.min(
    INTERVAL_MAX,
    reps === 1 ? 1 : reps === 2 ? 3 : Math.round(current.interval * current.ease),
  )

  return {
    reps,
    ease: Math.min(EASE_MAX, current.ease + 0.1),
    interval,
    due: addDays(today, interval),
    lapses: current.lapses,
  }
}

/** Une carte est considérée acquise après deux réussites consécutives : à ce stade
 *  l'intervalle dépasse la journée et la lettre a survécu à un délai. */
export function isMastered(card: Card) {
  return card.reps >= 2
}
