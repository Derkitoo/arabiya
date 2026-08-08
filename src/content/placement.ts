import type { Card } from '../lib/srs'
import { letters, type Letter, type LetterFamily } from './letters'

/** Test de placement.
 *
 *  On ne peut pas interroger 28 lettres sans en faire une corvée. On teste donc **une lettre
 *  par famille de tracé** : à l'intérieur d'une famille, les lettres ne diffèrent que par les
 *  points, donc reconnaître le représentant vaut pour ses voisines. Dix questions suffisent
 *  à couvrir l'alphabet. */
const REPRESENTATIVES: Record<LetterFamily, string> = {
  seule: 'alif',
  dents: 'ba',
  ventre: 'jim',
  dal: 'dal',
  ra: 'ra',
  sin: 'sin',
  sad: 'sad',
  emphatique: 'tta',
  ayn: 'ayn',
  fa: 'fa',
}

export const placementLetters: Letter[] = Object.values(REPRESENTATIVES).map(
  (id) => letters.find((letter) => letter.id === id)!,
)

/** Construit le paquet de départ à partir des familles réussies.
 *
 *  Une famille reconnue rend ses lettres « à vérifier » (une réussite au compteur, dues le
 *  jour même), pas « acquises » : la première séance les repasse vraiment, et les points qui
 *  distinguent ت de ث restent à confirmer une par une.
 *
 *  Contrairement au niveau déclaré, le test mesure : une lettre difficile correctement
 *  nommée est bel et bien connue, on ne la retire donc pas du lot. */
export function seedFromPlacement(correctFamilies: LetterFamily[], today: string) {
  const known = new Set(correctFamilies)
  const cards: Record<string, Card> = {}
  for (const letter of letters) {
    if (!known.has(letter.family)) continue
    cards[letter.id] = { reps: 1, ease: 2.5, interval: 1, due: today, lapses: 0 }
  }
  return cards
}
