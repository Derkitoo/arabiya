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

/** Présentation d'un mot encore jamais vu. Même rôle que `teach` pour les lettres. */
export type WordIntroItem = Base & {
  kind: 'word-intro'
  arabic: string
  translit: string
  meaning: string
}

/** Voir un signe arabe, choisir sa lecture en latin. */
export type RecognizeItem = Base & {
  kind: 'recognize'
  arabic: string
  answer: string
  options: string[]
}

/** Voir un mot arabe, choisir son sens en français. Modalité la plus accessible :
 *  elle ne demande que de reconnaître, pas de produire. */
export type TranslateItem = Base & {
  kind: 'translate'
  arabic: string
  answer: string
  options: string[]
}

/** Entendre, choisir la graphie correspondante. Sert aux lettres comme aux mots. */
export type ListenItem = Base & {
  kind: 'listen'
  arabic: string
  options: string[]
}

/** Lire une translittération, écrire l'arabe. Modalité la plus exigeante :
 *  il faut produire les signes, pas les reconnaître. */
export type WriteItem = Base & {
  kind: 'write'
  prompt: string
  answer: string
}

export type Item =
  | TeachItem
  | WordIntroItem
  | RecognizeItem
  | TranslateItem
  | ListenItem
  | WriteItem

/** Un écran de présentation ne se corrige pas : il n'entre ni dans le score ni dans la
 *  répétition espacée. */
export function isScored(item: Item) {
  return item.kind !== 'teach' && item.kind !== 'word-intro'
}
