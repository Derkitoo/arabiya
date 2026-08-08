import { letters } from './letters'
import type { WriteItem } from './types'

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

const RAW: { id: string; prompt: string; answer: string; note: string }[] = [
  { id: 'bab', prompt: 'bāb — la porte', answer: 'باب', note: 'bā + alif + bā.' },
  {
    id: 'bayt',
    prompt: 'bayt — la maison',
    answer: 'بيت',
    note: 'bā + yā + tā. Le yā prend sa forme médiane ـيـ au milieu du mot.',
  },
  { id: 'bint', prompt: 'bint — la fille', answer: 'بنت', note: 'bā + nūn + tā.' },
  { id: 'walad', prompt: 'walad — le garçon', answer: 'ولد', note: 'wāw + lām + dāl.' },
  { id: 'umm', prompt: 'umm — la mère', answer: 'أم', note: 'alif portant une hamza, puis mīm.' },
  { id: 'ab', prompt: 'ab — le père', answer: 'أب', note: 'alif portant une hamza, puis bā.' },
  { id: 'yad', prompt: 'yad — la main', answer: 'يد', note: 'yā + dāl.' },
  {
    id: 'ayn',
    prompt: 'ʿayn — l’œil',
    answer: 'عين',
    note: 'ʿayn + yā + nūn. Le mot désigne aussi la source d’eau.',
  },
  {
    id: 'qamar',
    prompt: 'qamar — la lune',
    answer: 'قمر',
    note: 'qāf + mīm + rā. Le rā ne se lie pas à la suite, le mot s’arrête net.',
  },
  { id: 'shams', prompt: 'shams — le soleil', answer: 'شمس', note: 'shīn + mīm + sīn.' },
  { id: 'nar', prompt: 'nār — le feu', answer: 'نار', note: 'nūn + alif + rā.' },
  { id: 'bahr', prompt: 'baḥr — la mer', answer: 'بحر', note: 'bā + ḥā + rā.' },
  { id: 'jabal', prompt: 'jabal — la montagne', answer: 'جبل', note: 'jīm + bā + lām.' },
  { id: 'khubz', prompt: 'khubz — le pain', answer: 'خبز', note: 'khā + bā + zāy.' },
  { id: 'qalam', prompt: 'qalam — le stylo', answer: 'قلم', note: 'qāf + lām + mīm.' },
  { id: 'kitab', prompt: 'kitāb — le livre', answer: 'كتاب', note: 'kāf + tā + alif + bā.' },
  { id: 'salam', prompt: 'salām — la paix', answer: 'سلام', note: 'sīn + lām + alif + mīm.' },
  { id: 'sadiq', prompt: 'ṣadīq — l’ami', answer: 'صديق', note: 'ṣād + dāl + yā + qāf.' },
  { id: 'tariq', prompt: 'ṭarīq — la route', answer: 'طريق', note: 'ṭā + rā + yā + qāf.' },
  {
    id: 'miftah',
    prompt: 'miftāḥ — la clé',
    answer: 'مفتاح',
    note: 'mīm + fā + tā + alif + ḥā.',
  },
  {
    id: 'madrasa',
    prompt: 'madrasa — l’école',
    answer: 'مدرسة',
    note: 'mīm + dāl + rā + sīn, puis un tā fermé ة à la fin.',
  },
  {
    id: 'ghurfa',
    prompt: 'ghurfa — la chambre',
    answer: 'غرفة',
    note: 'ghayn + rā + fā, puis un tā fermé ة.',
  },
]

/** Mots courts servant d'exercice d'écriture. Chacun ne sera proposé qu'une fois toutes ses
 *  lettres maîtrisées : on n'écrit pas un mot dont on ne connaît pas les signes. */
export const words: WriteItem[] = RAW.map((word) => ({
  id: `word-${word.id}`,
  kind: 'write',
  label: 'Écris en arabe',
  prompt: word.prompt,
  answer: word.answer,
  note: word.note,
  requires: lettersOf(word.answer),
}))

export const wordsById = new Map(words.map((word) => [word.id, word]))
