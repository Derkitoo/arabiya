import { letters } from './letters'

const byChar = new Map(letters.map((letter) => [letter.char, letter.id]))

/** Graphies qui ne sont pas des lettres de l'alphabet mais se lisent comme l'une d'elles.
 *  La hamza portée (ء) n'a pas de lettre support propre : on l'ignore pour la décomposition. */
const VARIANTS: Record<string, string> = { أ: 'alif', إ: 'alif', آ: 'alif', ة: 'ta', ى: 'ya' }

/** Nom affiché de chaque graphie particulière lors de l'épellation. */
const VARIANT_NAMES: Record<string, string> = {
  أ: 'alif avec hamza',
  إ: 'alif avec hamza',
  آ: 'alif allongé',
  ة: 'tā fermé',
  ى: 'alif maqṣūra',
  ء: 'hamza',
}

/** Décompose un mot en identifiants de lettres. Calculé plutôt que saisi à la main :
 *  une liste recopiée finit toujours par diverger du mot. */
export function lettersOf(arabic: string): string[] {
  const ids = new Set<string>()
  for (const char of arabic) {
    const id = byChar.get(char) ?? VARIANTS[char]
    if (id) ids.add(id)
  }
  return [...ids]
}

/** Épelle un mot dans l'ordre de lecture : « kāf + tā + alif + bā ».
 *  Générée depuis la graphie, cette épellation ne peut pas contredire le mot. */
export function spellOut(arabic: string): string {
  const parts: string[] = []
  for (const char of arabic) {
    const variant = VARIANT_NAMES[char]
    if (variant) {
      parts.push(variant)
      continue
    }
    const id = byChar.get(char)
    const letter = letters.find((l) => l.id === id)
    if (letter) parts.push(letter.name)
  }
  return parts.join(' + ')
}

/** Regroupement thématique. Un thème donne deux choses : des leurres pertinents dans les QCM
 *  (confondre « la porte » et « la fenêtre » a du sens, pas « la porte » et « jaune »), et un
 *  ordre d'introduction cohérent plutôt qu'un vrac. */
export type Theme =
  | 'famille'
  | 'maison'
  | 'nourriture'
  | 'nature'
  | 'corps'
  | 'objets'
  | 'ville'
  | 'couleurs'
  | 'temps'
  | 'utiles'

/** Ordre d'introduction des thèmes : du plus concret et proche au plus abstrait. */
export const themeOrder: { id: Theme; label: string }[] = [
  { id: 'famille', label: 'La famille' },
  { id: 'maison', label: 'La maison' },
  { id: 'nourriture', label: 'La nourriture' },
  { id: 'nature', label: 'La nature' },
  { id: 'corps', label: 'Le corps' },
  { id: 'objets', label: 'Les objets' },
  { id: 'ville', label: 'La ville' },
  { id: 'couleurs', label: 'Les couleurs' },
  { id: 'temps', label: 'Le temps' },
  { id: 'utiles', label: 'Mots utiles' },
]

export type Word = {
  id: string
  arabic: string
  /** translittération, sert de consigne à l'exercice d'écriture */
  translit: string
  /** sens en français, sert de réponse à l'exercice de reconnaissance */
  meaning: string
  theme: Theme
  /** décomposition en lettres, calculée depuis la graphie */
  requires: string[]
  /** épellation dans l'ordre de lecture, calculée depuis la graphie */
  spell: string
  /** remarque facultative, ajoutée à l'épellation dans la correction */
  note?: string
}

type Raw = { id: string; arabic: string; translit: string; meaning: string; note?: string }

const THEMES: { theme: Theme; words: Raw[] }[] = [
  {
    theme: 'famille',
    words: [
      { id: 'umm', arabic: 'أم', translit: 'umm', meaning: 'la mère' },
      { id: 'ab', arabic: 'أب', translit: 'ab', meaning: 'le père' },
      { id: 'ibn', arabic: 'ابن', translit: 'ibn', meaning: 'le fils' },
      { id: 'bint', arabic: 'بنت', translit: 'bint', meaning: 'la fille' },
      { id: 'akh', arabic: 'أخ', translit: 'akh', meaning: 'le frère' },
      { id: 'ukht', arabic: 'أخت', translit: 'ukht', meaning: 'la sœur' },
      { id: 'jadd', arabic: 'جد', translit: 'jadd', meaning: 'le grand-père' },
      { id: 'jadda', arabic: 'جدة', translit: 'jadda', meaning: 'la grand-mère' },
      { id: 'walad', arabic: 'ولد', translit: 'walad', meaning: 'le garçon' },
      { id: 'zawj', arabic: 'زوج', translit: 'zawj', meaning: 'le mari' },
    ],
  },
  {
    theme: 'maison',
    words: [
      { id: 'bayt', arabic: 'بيت', translit: 'bayt', meaning: 'la maison' },
      { id: 'bab', arabic: 'باب', translit: 'bāb', meaning: 'la porte' },
      { id: 'ghurfa', arabic: 'غرفة', translit: 'ghurfa', meaning: 'la chambre' },
      { id: 'miftah', arabic: 'مفتاح', translit: 'miftāḥ', meaning: 'la clé' },
      { id: 'kursi', arabic: 'كرسي', translit: 'kursī', meaning: 'la chaise' },
      { id: 'sarir', arabic: 'سرير', translit: 'sarīr', meaning: 'le lit' },
      { id: 'nafidha', arabic: 'نافذة', translit: 'nāfidha', meaning: 'la fenêtre' },
      { id: 'matbakh', arabic: 'مطبخ', translit: 'maṭbakh', meaning: 'la cuisine' },
    ],
  },
  {
    theme: 'nourriture',
    words: [
      { id: 'ma', arabic: 'ماء', translit: 'māʾ', meaning: 'l’eau' },
      { id: 'khubz', arabic: 'خبز', translit: 'khubz', meaning: 'le pain' },
      { id: 'lahm', arabic: 'لحم', translit: 'laḥm', meaning: 'la viande' },
      { id: 'halib', arabic: 'حليب', translit: 'ḥalīb', meaning: 'le lait' },
      { id: 'aruzz', arabic: 'أرز', translit: 'aruzz', meaning: 'le riz' },
      { id: 'samak', arabic: 'سمك', translit: 'samak', meaning: 'le poisson' },
      { id: 'jubn', arabic: 'جبن', translit: 'jubn', meaning: 'le fromage' },
      { id: 'shay', arabic: 'شاي', translit: 'shāy', meaning: 'le thé' },
      { id: 'qahwa', arabic: 'قهوة', translit: 'qahwa', meaning: 'le café' },
    ],
  },
  {
    theme: 'nature',
    words: [
      { id: 'shams', arabic: 'شمس', translit: 'shams', meaning: 'le soleil' },
      { id: 'qamar', arabic: 'قمر', translit: 'qamar', meaning: 'la lune' },
      { id: 'najm', arabic: 'نجم', translit: 'najm', meaning: 'l’étoile' },
      { id: 'bahr', arabic: 'بحر', translit: 'baḥr', meaning: 'la mer' },
      { id: 'nar', arabic: 'نار', translit: 'nār', meaning: 'le feu' },
      { id: 'jabal', arabic: 'جبل', translit: 'jabal', meaning: 'la montagne' },
      { id: 'shajara', arabic: 'شجرة', translit: 'shajara', meaning: 'l’arbre' },
      { id: 'matar', arabic: 'مطر', translit: 'maṭar', meaning: 'la pluie' },
      { id: 'ward', arabic: 'ورد', translit: 'ward', meaning: 'les roses' },
    ],
  },
  {
    theme: 'corps',
    words: [
      { id: 'yad', arabic: 'يد', translit: 'yad', meaning: 'la main' },
      {
        id: 'ayn',
        arabic: 'عين',
        translit: 'ʿayn',
        meaning: 'l’œil',
        note: 'Le même mot désigne aussi une source d’eau.',
      },
      { id: 'ras', arabic: 'رأس', translit: 'raʾs', meaning: 'la tête' },
      { id: 'qalb', arabic: 'قلب', translit: 'qalb', meaning: 'le cœur' },
      { id: 'anf', arabic: 'أنف', translit: 'anf', meaning: 'le nez' },
      { id: 'fam', arabic: 'فم', translit: 'fam', meaning: 'la bouche' },
      { id: 'udhun', arabic: 'أذن', translit: 'udhun', meaning: 'l’oreille' },
      { id: 'shaar', arabic: 'شعر', translit: 'shaʿr', meaning: 'les cheveux' },
    ],
  },
  {
    theme: 'objets',
    words: [
      { id: 'kitab', arabic: 'كتاب', translit: 'kitāb', meaning: 'le livre' },
      { id: 'qalam', arabic: 'قلم', translit: 'qalam', meaning: 'le stylo' },
      { id: 'waraqa', arabic: 'ورقة', translit: 'waraqa', meaning: 'la feuille' },
      { id: 'saa', arabic: 'ساعة', translit: 'sāʿa', meaning: 'la montre' },
      { id: 'haqiba', arabic: 'حقيبة', translit: 'ḥaqība', meaning: 'le sac' },
      { id: 'hatif', arabic: 'هاتف', translit: 'hātif', meaning: 'le téléphone' },
    ],
  },
  {
    theme: 'ville',
    words: [
      { id: 'madrasa', arabic: 'مدرسة', translit: 'madrasa', meaning: 'l’école' },
      { id: 'suq', arabic: 'سوق', translit: 'sūq', meaning: 'le marché' },
      { id: 'tariq', arabic: 'طريق', translit: 'ṭarīq', meaning: 'la route' },
      { id: 'madina', arabic: 'مدينة', translit: 'madīna', meaning: 'la ville' },
      { id: 'matar_airport', arabic: 'مطار', translit: 'maṭār', meaning: 'l’aéroport' },
      { id: 'funduq', arabic: 'فندق', translit: 'funduq', meaning: 'l’hôtel' },
      { id: 'masjid', arabic: 'مسجد', translit: 'masjid', meaning: 'la mosquée' },
    ],
  },
  {
    theme: 'couleurs',
    words: [
      { id: 'ahmar', arabic: 'أحمر', translit: 'aḥmar', meaning: 'rouge' },
      { id: 'azraq', arabic: 'أزرق', translit: 'azraq', meaning: 'bleu' },
      { id: 'akhdar', arabic: 'أخضر', translit: 'akhḍar', meaning: 'vert' },
      { id: 'asfar', arabic: 'أصفر', translit: 'aṣfar', meaning: 'jaune' },
      { id: 'abyad', arabic: 'أبيض', translit: 'abyaḍ', meaning: 'blanc' },
      { id: 'aswad', arabic: 'أسود', translit: 'aswad', meaning: 'noir' },
    ],
  },
  {
    theme: 'temps',
    words: [
      { id: 'yawm', arabic: 'يوم', translit: 'yawm', meaning: 'le jour' },
      { id: 'layl', arabic: 'ليل', translit: 'layl', meaning: 'la nuit' },
      { id: 'sabah', arabic: 'صباح', translit: 'ṣabāḥ', meaning: 'le matin' },
      { id: 'masa', arabic: 'مساء', translit: 'masāʾ', meaning: 'le soir' },
      { id: 'usbu', arabic: 'أسبوع', translit: 'usbūʿ', meaning: 'la semaine' },
      { id: 'shahr', arabic: 'شهر', translit: 'shahr', meaning: 'le mois' },
      { id: 'sana', arabic: 'سنة', translit: 'sana', meaning: 'l’année' },
    ],
  },
  {
    theme: 'utiles',
    words: [
      { id: 'salam', arabic: 'سلام', translit: 'salām', meaning: 'la paix' },
      { id: 'sadiq', arabic: 'صديق', translit: 'ṣadīq', meaning: 'l’ami' },
      { id: 'shukran', arabic: 'شكرا', translit: 'shukran', meaning: 'merci' },
      { id: 'naam', arabic: 'نعم', translit: 'naʿam', meaning: 'oui' },
      { id: 'la', arabic: 'لا', translit: 'lā', meaning: 'non' },
      { id: 'kabir', arabic: 'كبير', translit: 'kabīr', meaning: 'grand' },
      { id: 'saghir', arabic: 'صغير', translit: 'ṣaghīr', meaning: 'petit' },
      { id: 'jadid', arabic: 'جديد', translit: 'jadīd', meaning: 'nouveau' },
    ],
  },
]

/** Les mots, groupés par thème dans l'ordre d'introduction. */
export const words: Word[] = THEMES.flatMap(({ theme, words: list }) =>
  list.map((word) => ({
    ...word,
    id: `word-${word.id}`,
    theme,
    requires: lettersOf(word.arabic),
    spell: spellOut(word.arabic),
  })),
)

export const wordsById = new Map(words.map((word) => [word.id, word]))
