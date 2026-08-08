import { letters } from './letters'

const byChar = new Map(letters.map((letter) => [letter.char, letter.id]))

/** Graphies qui ne sont pas des lettres de l'alphabet mais se lisent comme l'une d'elles.
 *  La hamza portée (ء) n'a pas de lettre support propre : on l'ignore. */
const VARIANTS: Record<string, string> = { أ: 'alif', إ: 'alif', آ: 'alif', ة: 'ta', ى: 'ya' }

/** Décompose un mot en identifiants de lettres. Calculé plutôt que saisi à la main :
 *  une liste recopiée à la main finit toujours par diverger du mot. */
export function lettersOf(arabic: string): string[] {
  const ids = new Set<string>()
  for (const char of arabic) {
    const id = byChar.get(char) ?? VARIANTS[char]
    if (id) ids.add(id)
  }
  return [...ids]
}

export type Word = {
  id: string
  arabic: string
  /** translittération, sert de consigne à l'exercice d'écriture */
  translit: string
  /** sens en français, sert de réponse à l'exercice de reconnaissance */
  meaning: string
  /** décomposition en lettres, calculée depuis la graphie */
  requires: string[]
  note?: string
}

const RAW: Omit<Word, 'requires'>[] = [
  { id: 'bab', arabic: 'باب', translit: 'bāb', meaning: 'la porte', note: 'bā + alif + bā.' },
  {
    id: 'bayt',
    arabic: 'بيت',
    translit: 'bayt',
    meaning: 'la maison',
    note: 'bā + yā + tā. Le yā prend sa forme médiane ـيـ au milieu du mot.',
  },
  { id: 'bint', arabic: 'بنت', translit: 'bint', meaning: 'la fille', note: 'bā + nūn + tā.' },
  { id: 'walad', arabic: 'ولد', translit: 'walad', meaning: 'le garçon', note: 'wāw + lām + dāl.' },
  {
    id: 'umm',
    arabic: 'أم',
    translit: 'umm',
    meaning: 'la mère',
    note: 'alif portant une hamza, puis mīm.',
  },
  {
    id: 'ab',
    arabic: 'أب',
    translit: 'ab',
    meaning: 'le père',
    note: 'alif portant une hamza, puis bā.',
  },
  { id: 'yad', arabic: 'يد', translit: 'yad', meaning: 'la main', note: 'yā + dāl.' },
  {
    id: 'ayn',
    arabic: 'عين',
    translit: 'ʿayn',
    meaning: 'l’œil',
    note: 'ʿayn + yā + nūn. Le mot désigne aussi la source d’eau.',
  },
  {
    id: 'qamar',
    arabic: 'قمر',
    translit: 'qamar',
    meaning: 'la lune',
    note: 'qāf + mīm + rā. Le rā ne se lie pas à la suite, le mot s’arrête net.',
  },
  { id: 'shams', arabic: 'شمس', translit: 'shams', meaning: 'le soleil', note: 'shīn + mīm + sīn.' },
  { id: 'nar', arabic: 'نار', translit: 'nār', meaning: 'le feu', note: 'nūn + alif + rā.' },
  { id: 'bahr', arabic: 'بحر', translit: 'baḥr', meaning: 'la mer', note: 'bā + ḥā + rā.' },
  { id: 'jabal', arabic: 'جبل', translit: 'jabal', meaning: 'la montagne', note: 'jīm + bā + lām.' },
  { id: 'khubz', arabic: 'خبز', translit: 'khubz', meaning: 'le pain', note: 'khā + bā + zāy.' },
  { id: 'qalam', arabic: 'قلم', translit: 'qalam', meaning: 'le stylo', note: 'qāf + lām + mīm.' },
  {
    id: 'kitab',
    arabic: 'كتاب',
    translit: 'kitāb',
    meaning: 'le livre',
    note: 'kāf + tā + alif + bā.',
  },
  {
    id: 'salam',
    arabic: 'سلام',
    translit: 'salām',
    meaning: 'la paix',
    note: 'sīn + lām + alif + mīm.',
  },
  { id: 'sadiq', arabic: 'صديق', translit: 'ṣadīq', meaning: 'l’ami', note: 'ṣād + dāl + yā + qāf.' },
  { id: 'tariq', arabic: 'طريق', translit: 'ṭarīq', meaning: 'la route', note: 'ṭā + rā + yā + qāf.' },
  {
    id: 'miftah',
    arabic: 'مفتاح',
    translit: 'miftāḥ',
    meaning: 'la clé',
    note: 'mīm + fā + tā + alif + ḥā.',
  },
  {
    id: 'madrasa',
    arabic: 'مدرسة',
    translit: 'madrasa',
    meaning: 'l’école',
    note: 'mīm + dāl + rā + sīn, puis un tā fermé ة à la fin.',
  },
  {
    id: 'ghurfa',
    arabic: 'غرفة',
    translit: 'ghurfa',
    meaning: 'la chambre',
    note: 'ghayn + rā + fā, puis un tā fermé ة.',
  },
]

export const words: Word[] = RAW.map((word) => ({
  ...word,
  id: `word-${word.id}`,
  requires: lettersOf(word.arabic),
}))

export const wordsById = new Map(words.map((word) => [word.id, word]))
