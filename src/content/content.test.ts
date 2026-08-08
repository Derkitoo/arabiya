import { describe, expect, it } from 'vitest'
import { letters, lettersById, orderedLetters, teachingOrder } from './letters'
import { lettersOf, words } from './words'
import { placementLetters, seedFromPlacement } from './placement'

describe('alphabet', () => {
  it('compte 28 lettres', () => {
    expect(letters).toHaveLength(28)
  })

  it('n’a ni identifiant, ni nom, ni caractère en double', () => {
    for (const key of ['id', 'name', 'char'] as const) {
      const values = letters.map((letter) => letter[key])
      expect(new Set(values).size).toBe(values.length)
    }
  })

  it('décrit des formes attachées cohérentes avec le caractère', () => {
    for (const letter of letters) {
      expect(letter.forms.middle).toContain(letter.char)
      expect(letter.forms.end).toContain(letter.char)
    }
  })

  it('laisse isolée la forme initiale des lettres non liantes', () => {
    for (const letter of letters.filter((l) => !l.connects)) {
      expect(letter.forms.start).toBe(letter.char)
    }
  })
})

describe('ordre d’introduction', () => {
  it('couvre les 28 lettres exactement une fois', () => {
    expect(teachingOrder).toHaveLength(28)
    expect(new Set(teachingOrder).size).toBe(28)
    for (const letter of letters) expect(teachingOrder).toContain(letter.id)
  })

  it('ne référence aucune lettre inconnue', () => {
    for (const id of teachingOrder) expect(lettersById.has(id)).toBe(true)
  })

  it('suit la fréquence d’usage et non l’alphabet', () => {
    // yā arrivait en 28e position dans l'ordre alphabétique, ce qui repoussait des mots
    // aussi courants que بيت à la toute fin.
    expect(orderedLetters.slice(0, 3).map((l) => l.id)).toEqual(['alif', 'lam', 'ya'])
  })
})

describe('vocabulaire', () => {
  it('décompose chaque mot en lettres connues', () => {
    for (const word of words) {
      expect(word.requires.length).toBeGreaterThan(0)
      for (const id of word.requires) expect(lettersById.has(id)).toBe(true)
    }
  })

  it('ne laisse aucun caractère arabe non reconnu', () => {
    const known = new Set(letters.map((l) => l.char))
    const variants = new Set([...'أإآةى'])
    for (const word of words) {
      for (const char of word.arabic) {
        expect(known.has(char) || variants.has(char)).toBe(true)
      }
    }
  })

  it('rattache les graphies dérivées à leur lettre de base', () => {
    expect(lettersOf('مدرسة')).toContain('ta') // le tā fermé ة
    expect(lettersOf('أب')).toContain('alif') // l'alif porteur de hamza
  })

  it('donne à chaque mot un sens et une translittération', () => {
    for (const word of words) {
      expect(word.meaning.trim()).not.toBe('')
      expect(word.translit.trim()).not.toBe('')
    }
  })

  it('n’a pas deux mots de même sens, sinon un QCM serait insoluble', () => {
    const meanings = words.map((word) => word.meaning)
    expect(new Set(meanings).size).toBe(meanings.length)
  })
})

describe('test de placement', () => {
  it('interroge une lettre par famille de tracé', () => {
    const familles = new Set(letters.map((letter) => letter.family))
    expect(placementLetters).toHaveLength(familles.size)
    expect(new Set(placementLetters.map((l) => l.family)).size).toBe(familles.size)
  })

  it('amorce les 28 lettres quand tout est réussi', () => {
    const familles = [...new Set(letters.map((letter) => letter.family))]
    expect(Object.keys(seedFromPlacement(familles, '2026-08-08'))).toHaveLength(28)
  })

  it('n’amorce rien quand tout est raté', () => {
    expect(seedFromPlacement([], '2026-08-08')).toEqual({})
  })

  it('amorce des cartes à vérifier, jamais des cartes acquises', () => {
    const cards = seedFromPlacement(['dents'], '2026-08-08')
    for (const card of Object.values(cards)) {
      expect(card.reps).toBe(1) // une seule réussite : la maîtrise reste à prouver
      expect(card.due).toBe('2026-08-08') // dues le jour même, donc vérifiées aussitôt
    }
  })
})
