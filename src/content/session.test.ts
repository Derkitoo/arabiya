import { describe, expect, it } from 'vitest'
import { buildSession, describeSession, dueToday } from './session'
import { orderedLetters } from './letters'
import { words } from './words'
import { isScored, type Item } from './types'
import type { Card } from '../lib/srs'

const TODAY = '2026-08-08'

function card(reps: number, due = TODAY): Card {
  return { reps, ease: 2.5, interval: reps, due, lapses: 0 }
}

/** Paquet où les n premières lettres du programme sont à l'état demandé. */
function withLetters(count: number, reps: number, due = TODAY) {
  const cards: Record<string, Card> = {}
  for (const letter of orderedLetters.slice(0, count)) cards[letter.id] = card(reps, due)
  return cards
}

const kinds = (items: Item[]) => items.map((item) => item.kind)

describe('on montre avant de demander', () => {
  it('ne pose aucune question sur une lettre jamais présentée', () => {
    const session = buildSession(10, {}, TODAY)
    const presented = new Set<string>()
    for (const item of session) {
      if (item.kind === 'teach') presented.add(item.id.replace(/-teach$/, ''))
      else if (item.kind === 'recognize' || item.kind === 'listen') {
        expect(presented.has(item.id)).toBe(true)
      }
    }
  })

  it('ne pose aucune question sur un mot jamais présenté', () => {
    const cards = withLetters(28, 3, '2027-01-01')
    const session = buildSession(14, cards, TODAY)
    const presented = new Set<string>()
    for (const item of session) {
      if (item.kind === 'word-intro') presented.add(item.id.replace(/-intro$/, ''))
      if (item.kind === 'translate' && !cards[item.id]) expect(presented.has(item.id)).toBe(true)
    }
  })

  it('fait suivre chaque présentation de lettre par sa question', () => {
    const session = buildSession(10, {}, TODAY)
    expect(kinds(session).slice(0, 4)).toEqual(['teach', 'recognize', 'teach', 'recognize'])
  })
})

describe('échelle de difficulté', () => {
  it('durcit l’exercice sur une lettre à mesure qu’elle est sue', () => {
    const jeune = buildSession(6, withLetters(6, 1), TODAY)
    const mure = buildSession(6, withLetters(6, 3), TODAY)
    expect(kinds(jeune)).toContain('recognize')
    expect(kinds(mure)).toContain('listen')
    expect(kinds(mure)).not.toContain('recognize')
  })

  it('commence un mot par la reconnaissance du sens, pas par l’écriture', () => {
    // Lettres acquises et non échues, sans quoi les révisions rempliraient la séance.
    const session = buildSession(14, withLetters(28, 3, '2027-01-01'), TODAY)
    const premierMot = session.find((item) => item.kind === 'translate' || item.kind === 'write')
    expect(premierMot?.kind).toBe('translate')
  })

  it('passe à l’écoute puis à l’écriture au fil des réussites', () => {
    const base = withLetters(28, 3, '2027-01-01')
    const cible = words[0]
    const ladder = (reps: number) =>
      buildSession(14, { ...base, [cible.id]: card(reps) }, TODAY).find(
        (item) => item.id === cible.id,
      )?.kind
    expect(ladder(1)).toBe('translate')
    expect(ladder(3)).toBe('listen')
    expect(ladder(5)).toBe('write')
  })

  it('n’exige jamais d’écrire un mot dont les lettres ne sont pas maîtrisées', () => {
    const cible = words[0]
    // lettres seulement rencontrées (une réussite), donc pas encore maîtrisées
    const cards: Record<string, Card> = { [cible.id]: card(5) }
    for (const id of cible.requires) cards[id] = card(1)
    const item = buildSession(14, cards, TODAY).find((i) => i.id === cible.id)
    expect(item?.kind).toBe('listen')
  })
})

describe('verrous du vocabulaire', () => {
  it('ne propose aucun mot à un débutant absolu', () => {
    expect(kinds(buildSession(10, {}, TODAY))).not.toContain('translate')
  })

  it('débloque un mot dès que ses lettres ont été rencontrées', () => {
    const cible = words.find((word) => word.requires.length <= 3)!
    const cards: Record<string, Card> = {}
    // une seule réussite par lettre : rencontrées, pas maîtrisées
    for (const id of cible.requires) cards[id] = card(1, '2027-01-01')
    const session = buildSession(14, cards, TODAY)
    expect(session.some((item) => item.id === cible.id)).toBe(true)
  })
})

describe('composition de la séance', () => {
  it('suit l’objectif quotidien', () => {
    const cards = withLetters(28, 3)
    expect(buildSession(5, cards, TODAY).length).toBeLessThan(
      buildSession(20, cards, TODAY).length,
    )
  })

  it('plafonne l’écriture à une minorité d’exercices', () => {
    // tous les mots dus et écrivables en même temps
    const cards = withLetters(28, 4, '2026-01-01')
    for (const word of words) cards[word.id] = card(6, '2026-01-01')
    const session = buildSession(10, cards, TODAY)
    const questions = session.filter(isScored)
    const writes = session.filter((item) => item.kind === 'write')
    expect(writes.length).toBeLessThanOrEqual(Math.ceil(questions.length * 0.5))
  })

  it('sert d’abord les cartes les plus en retard', () => {
    const cards = withLetters(10, 3, '2026-08-01')
    cards[orderedLetters[5].id] = card(3, '2026-07-01')
    const session = buildSession(6, cards, TODAY)
    expect(session[0].id).toBe(orderedLetters[5].id)
  })

  it('produit toujours la même séance pour la même entrée', () => {
    const cards = withLetters(20, 2)
    expect(buildSession(10, cards, TODAY)).toEqual(buildSession(10, cards, TODAY))
  })
})

describe('QCM', () => {
  it('propose toujours quatre options distinctes dont la bonne réponse', () => {
    const paquets = [{}, withLetters(14, 1), withLetters(28, 3)]
    for (const cards of paquets) {
      for (const item of buildSession(14, cards, TODAY)) {
        if (item.kind !== 'recognize' && item.kind !== 'listen' && item.kind !== 'translate') {
          continue
        }
        expect(item.options).toHaveLength(4)
        expect(new Set(item.options).size).toBe(4)
        const attendu = item.kind === 'listen' ? item.arabic : item.answer
        expect(item.options).toContain(attendu)
      }
    }
  })
})

describe('compteurs affichés', () => {
  it('compte les questions et non les écrans de présentation', () => {
    const session = buildSession(10, {}, TODAY)
    const composition = describeSession(session, {})
    expect(composition.screens).toBe(session.length)
    expect(composition.news).toBe(session.filter(isScored).length)
    expect(composition.reviews).toBe(0)
  })

  it('ne compte comme dû que ce qui est réellement échu', () => {
    expect(dueToday(withLetters(5, 1, '2027-01-01'), TODAY)).toBe(0)
    expect(dueToday(withLetters(5, 1, TODAY), TODAY)).toBe(5)
  })
})
