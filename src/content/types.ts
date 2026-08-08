/** Un exercice = un écran = une seule action. Ajouter un type d'exercice se fait
   ici puis dans le lecteur de session, nulle part ailleurs. */

type Base = {
  id: string
  /** consigne courte affichée en haut du contenu */
  label: string
  /** explication montrée dans le panneau de correction */
  note?: string
}

/** Présentation d'une lettre encore jamais vue : on montre avant de demander.
 *  Aucune réponse attendue, aucun score — c'est le seul écran qui ne teste rien. */
export type TeachItem = Base & {
  kind: 'teach'
  arabic: string
  name: string
  sound: string
  forms: { start: string; middle: string; end: string }
  connects: boolean
}

/** Voir un signe arabe, choisir sa lecture en latin. */
export type RecognizeItem = Base & {
  kind: 'recognize'
  arabic: string
  answer: string
  options: string[]
}

/** Entendre, choisir le signe arabe correspondant. */
export type ListenItem = Base & {
  kind: 'listen'
  arabic: string
  options: string[]
}

/** Lire une translittération, écrire l'arabe. */
export type WriteItem = Base & {
  kind: 'write'
  prompt: string
  answer: string
  /** lettres qui composent le mot : il n'est proposé qu'une fois toutes maîtrisées */
  requires: string[]
}

export type Item = TeachItem | RecognizeItem | ListenItem | WriteItem

/** Un écran de présentation ne se corrige pas : il n'entre ni dans le score ni dans la
 *  répétition espacée. */
export function isScored(item: Item) {
  return item.kind !== 'teach'
}
