import { describe, expect, it } from 'vitest'
import { isDue, isMastered, review, type Card } from './srs'

/** Rejoue une carte réussie n fois d'affilée, en avançant à chaque échéance. */
function streak(times: number, from = '2026-08-08') {
  let card: Card | undefined
  let day = from
  for (let i = 0; i < times; i += 1) {
    card = review(card, true, day)
    day = card.due
  }
  return card!
}

describe('review', () => {
  it('place la première révision au lendemain, pas le jour même', () => {
    const card = review(undefined, true, '2026-08-08')
    expect(card.reps).toBe(1)
    expect(card.interval).toBe(1)
    expect(card.due).toBe('2026-08-09')
  })

  it('fixe les deux premiers paliers à 1 puis 3 jours', () => {
    expect(streak(1).interval).toBe(1)
    expect(streak(2).interval).toBe(3)
  })

  it('allonge ensuite l’intervalle par le facteur de facilité', () => {
    const third = streak(3)
    expect(third.interval).toBeGreaterThan(3)
    expect(streak(4).interval).toBeGreaterThan(third.interval)
  })

  it('plafonne l’intervalle à un an', () => {
    // Sans plafond, la simulation atteignait plus de trois ans.
    expect(streak(12).interval).toBeLessThanOrEqual(365)
  })

  it('ramène une carte ratée dès la séance suivante', () => {
    const failed = review(streak(3), false, '2026-09-01')
    expect(failed.reps).toBe(0)
    expect(failed.interval).toBe(0)
    expect(failed.due).toBe('2026-09-01')
    expect(isDue(failed, '2026-09-01')).toBe(true)
  })

  it('rend une carte ratée durablement plus difficile', () => {
    const before = streak(3)
    const after = review(before, false, '2026-09-01')
    expect(after.ease).toBeCloseTo(before.ease - 0.2)
    expect(after.lapses).toBe(before.lapses + 1)
  })

  it('ne descend jamais la facilité sous le plancher', () => {
    let card: Card | undefined
    for (let i = 0; i < 20; i += 1) card = review(card, false, '2026-08-08')
    expect(card!.ease).toBeGreaterThanOrEqual(1.3)
  })

  it('ne considère maîtrisé qu’après deux réussites consécutives', () => {
    expect(isMastered(streak(1))).toBe(false)
    expect(isMastered(streak(2))).toBe(true)
    // un échec fait retomber sous le seuil
    expect(isMastered(review(streak(3), false, '2026-09-01'))).toBe(false)
  })
})

describe('isDue', () => {
  it('considère due une carte dont l’échéance est passée ou atteinte', () => {
    const card = review(undefined, true, '2026-08-08')
    expect(isDue(card, '2026-08-08')).toBe(false)
    expect(isDue(card, '2026-08-09')).toBe(true)
    expect(isDue(card, '2026-08-20')).toBe(true)
  })
})
