import { shuffle } from '../lib/shuffle'
import { isDue, isMastered, type Card } from '../lib/srs'
import { letters, lettersById, orderedLetters, type Letter } from './letters'
import { words, wordsById } from './words'
import { isScored, type Item } from './types'

/** Ordre d'introduction : les lettres par fréquence d'usage (voir `teachingOrder`), puis les
 *  mots. On ne fait pas écrire un mot avant d'avoir rencontré des lettres. */
const deck: string[] = [...orderedLetters.map((l) => l.id), ...words.map((w) => w.id)]

/** Nouveaux mots par séance, au maximum. Au-delà, le vocabulaire prendrait toute la place
 *  du quota de nouveautés et l'alphabet cesserait d'avancer. */
const WORDS_PER_SESSION = 2

/** Part maximale de la séance consacrée à l'écriture.
 *
 *  Réviser un mot veut toujours dire l'écrire, et écrire est la modalité la plus exigeante :
 *  il faut produire les signes de mémoire, pas les reconnaître parmi quatre. À mesure que le
 *  vocabulaire grossit, les révisions dues rempliraient la séance entière — jusqu'à 7 saisies
 *  sur 11 en simulation. Le surplus est reporté au lendemain : une carte revue avec un jour
 *  de retard ne perd rien, alors qu'une séance qu'on redoute est une séance qu'on saute. */
const WRITE_SHARE = 0.4

/** Choisit 3 leurres : d'abord les lettres de la même famille (celles qu'on confond
 *  vraiment), complétées si besoin par d'autres lettres, de façon déterministe. */
function distractors(target: Letter, pick: (letter: Letter) => string) {
  const siblings = letters.filter((l) => l.family === target.family && l.id !== target.id)
  const others = shuffle(
    letters.filter((l) => l.family !== target.family && l.id !== target.id),
    target.id,
  )
  const chosen: string[] = []
  for (const letter of [...siblings, ...others]) {
    const value = pick(letter)
    if (value !== pick(target) && !chosen.includes(value)) chosen.push(value)
    if (chosen.length === 3) break
  }
  return chosen
}

function recognizeItem(letter: Letter): Item {
  return {
    id: letter.id,
    kind: 'recognize',
    label: 'Quelle est cette lettre ?',
    arabic: letter.char,
    answer: letter.name,
    options: [letter.name, ...distractors(letter, (l) => l.name)],
    note: `${letter.name} — ${letter.sound}. Attachée : ${letter.forms.start} ${letter.forms.middle} ${letter.forms.end}${
      letter.connects ? '' : ' (ne se lie jamais à la lettre suivante)'
    }`,
  }
}

function listenItem(letter: Letter): Item {
  return {
    id: letter.id,
    kind: 'listen',
    label: 'Écoute et choisis la lettre',
    arabic: letter.char,
    options: [letter.char, ...distractors(letter, (l) => l.char)],
    note: `${letter.name} — ${letter.sound}`,
  }
}

/** Écran de présentation, servi avant la toute première question sur une lettre.
 *  Sans lui, la première question revient à faire deviner. */
function teachItem(letter: Letter): Item {
  return {
    id: `${letter.id}-teach`,
    kind: 'teach',
    label: 'Nouvelle lettre',
    arabic: letter.char,
    name: letter.name,
    sound: letter.sound,
    forms: letter.forms,
    connects: letter.connects,
  }
}

/** L'exercice se durcit avec la carte : on reconnaît d'abord un signe qu'on voit, puis on
 *  doit le retrouver à l'oreille seule. */
function itemFor(id: string, card: Card | undefined): Item | null {
  const word = wordsById.get(id)
  if (word) return word
  const letter = lettersById.get(id)
  if (!letter) return null
  return card && card.reps >= 2 ? listenItem(letter) : recognizeItem(letter)
}

/** Construit la session du jour : les cartes échues d'abord (les plus en retard et les plus
 *  ratées en tête), puis un quota de nouveautés, et seulement s'il reste de la place, de la
 *  révision en avance. */
export function buildSession(
  goalMinutes: number,
  cards: Record<string, Card>,
  today: string,
): Item[] {
  const count = Math.min(14, Math.max(6, Math.round(goalMinutes)))
  const newCap = Math.max(3, Math.floor(count / 2))

  const seen = deck.filter((id) => cards[id])
  const due = seen
    .filter((id) => isDue(cards[id], today))
    .sort((a, b) => cards[a].due.localeCompare(cards[b].due) || cards[b].lapses - cards[a].lapses)

  const selected: string[] = []
  let writes = 0
  const writeCap = Math.max(1, Math.round(count * WRITE_SHARE))

  /** Ajoute des candidats en respectant la taille de séance et le plafond d'écriture.
   *  Un mot refusé faute de place est simplement sauté : il reste dû et repassera demain. */
  const take = (candidates: string[], max: number) => {
    let added = 0
    for (const id of candidates) {
      if (added >= max || selected.length >= count) break
      if (wordsById.has(id)) {
        if (writes >= writeCap) continue
        writes += 1
      }
      selected.push(id)
      added += 1
    }
    return added
  }

  take(due, count)

  // Un mot n'apparaît qu'une fois toutes ses lettres maîtrisées : on n'écrit pas un mot
  // dont on ne sait pas tracer les signes.
  const fresh = deck.filter((id) => {
    if (cards[id]) return false
    const word = wordsById.get(id)
    return !word || word.requires.every((letterId) => cards[letterId] && isMastered(cards[letterId]))
  })

  // Les mots ne font pas la queue derrière les 28 lettres : dès qu'un mot est déblocable,
  // il prend une part réservée du quota de nouveautés. Sans cette réserve, le vocabulaire
  // n'apparaît qu'une fois l'alphabet entièrement introduit — soit une dizaine de jours de
  // signes isolés avant le premier mot réel.
  const freshWords = fresh.filter((id) => wordsById.has(id))
  const freshLetters = fresh.filter((id) => !wordsById.has(id))
  const slots = Math.min(newCap, count - selected.length)
  const wordSlots = freshLetters.length === 0 ? slots : Math.max(0, Math.min(WORDS_PER_SESSION, slots - 1))

  const addedWords = take(freshWords, wordSlots)
  take(freshLetters, slots - addedWords)

  // Il reste de la place : on avance des révisions plutôt que de servir une séance courte.
  if (selected.length < count) {
    const ahead = seen
      .filter((id) => !isDue(cards[id], today))
      .sort((a, b) => cards[a].due.localeCompare(cards[b].due))
    take(ahead, count - selected.length)
  }

  const items: Item[] = []
  for (const id of selected) {
    const letter = lettersById.get(id)
    // Une lettre encore sans carte est d'abord montrée, puis seulement demandée.
    if (letter && !cards[id]) items.push(teachItem(letter))
    const item = itemFor(id, cards[id])
    if (item) items.push(item)
    if (items.length >= count) break
  }

  // Les mots à écrire ferment la séance : on quitte la reconnaissance passive avant le bilan.
  return [...items.filter((i) => i.kind !== 'write'), ...items.filter((i) => i.kind === 'write')]
}

/** Composition réelle de la séance construite. On compte les *questions*, pas les écrans :
 *  une lettre neuve occupe deux écrans (présentation puis question) mais reste une lettre. */
export function describeSession(items: Item[], cards: Record<string, Card>) {
  const questions = items.filter(isScored)
  const reviews = questions.filter((item) => cards[item.id]).length
  return { screens: items.length, reviews, news: questions.length - reviews }
}

/** Y a-t-il quelque chose d'effectivement échu aujourd'hui ? Sert à distinguer « il reste du
 *  travail » de « tu es à jour, la séance ne serait que de l'avance ». */
export function dueToday(cards: Record<string, Card>, today: string) {
  return deck.filter((id) => cards[id] && isDue(cards[id], today)).length
}
