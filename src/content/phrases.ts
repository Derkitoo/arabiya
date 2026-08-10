/** Phrases simples de 2 à 3 mots pour passer du mot isolé à la syntaxe réelle.
 *  Chaque phrase dépend des mots composants : elle ne débloque dans les sessions
 *  que lorsque ses mots requis sont maîtrisés. */

export type Phrase = {
  id: string
  arabic: string
  translit: string
  meaning: string
  requiresWords: string[]
  note?: string
}

export const phrases: Phrase[] = [
  // Famille
  {
    id: 'phrase-umm-jadda',
    arabic: 'أم وجدة',
    translit: 'umm wa jadda',
    meaning: 'une mère et une grand-mère',
    requiresWords: ['word-umm', 'word-jadda'],
    note: '« و » (wa) signifie « et » et se colle directement au mot suivant.',
  },
  {
    id: 'phrase-ab-sadiq',
    arabic: 'أب وصديق',
    translit: 'ab wa ṣadīq',
    meaning: 'un père et un ami',
    requiresWords: ['word-ab', 'word-sadiq'],
  },
  {
    id: 'phrase-walad-saghir',
    arabic: 'ولد صغير',
    translit: 'walad ṣaghīr',
    meaning: 'un petit garçon',
    requiresWords: ['word-walad', 'word-saghir'],
    note: 'En arabe, l’adjectif se place après le nom qu’il qualifie.',
  },
  {
    id: 'phrase-bint-jamil',
    arabic: 'بنت صغيرة',
    translit: 'bint ṣaghīra',
    meaning: 'une petite fille',
    requiresWords: ['word-bint', 'word-saghir'],
  },
  // Maison
  {
    id: 'phrase-bayt-kabir',
    arabic: 'بيت كبير',
    translit: 'bayt kabīr',
    meaning: 'une grande maison',
    requiresWords: ['word-bayt', 'word-kabir'],
    note: '« كبير » (kabīr) s’accorde au masculin avec « بيت » (bayt).',
  },
  {
    id: 'phrase-bab-jadid',
    arabic: 'باب جديد',
    translit: 'bāb jadīd',
    meaning: 'une nouvelle porte',
    requiresWords: ['word-bab', 'word-jadid'],
  },
  {
    id: 'phrase-ghurfa-kabira',
    arabic: 'غرفة كبيرة',
    translit: 'ghurfa kabīra',
    meaning: 'une grande chambre',
    requiresWords: ['word-ghurfa', 'word-kabir'],
    note: 'L’adjectif prend le tā fermé (ة) pour s’accorder au féminin.',
  },
  {
    id: 'phrase-miftah-saghir',
    arabic: 'مفتاح صغير',
    translit: 'miftāḥ ṣaghīr',
    meaning: 'une petite clé',
    requiresWords: ['word-miftah', 'word-saghir'],
  },
  {
    id: 'phrase-kursi-jadid',
    arabic: 'كرسي جديد',
    translit: 'kursī jadīd',
    meaning: 'une nouvelle chaise',
    requiresWords: ['word-kursi', 'word-jadid'],
  },
  // Nourriture
  {
    id: 'phrase-shay-qahwa',
    arabic: 'شاي وقهوة',
    translit: 'shāy wa qahwa',
    meaning: 'du thé et du café',
    requiresWords: ['word-shay', 'word-qahwa'],
  },
  {
    id: 'phrase-khubz-jubn',
    arabic: 'خبز وجبن',
    translit: 'khubz wa jubn',
    meaning: 'du pain et du fromage',
    requiresWords: ['word-khubz', 'word-jubn'],
  },
  {
    id: 'phrase-halib-barid',
    arabic: 'حليب بارد',
    translit: 'ḥalīb bārid',
    meaning: 'du lait frais',
    requiresWords: ['word-halib'],
  },
  {
    id: 'phrase-samak-jadid',
    arabic: 'سمك طازج',
    translit: 'samak ṭāzij',
    meaning: 'du poisson frais',
    requiresWords: ['word-samak'],
  },
  // Nature
  {
    id: 'phrase-shams-qamar',
    arabic: 'شمس وقمر',
    translit: 'shams wa qamar',
    meaning: 'soleil et lune',
    requiresWords: ['word-shams', 'word-qamar'],
  },
  {
    id: 'phrase-bahr-kabir',
    arabic: 'بحر كبير',
    translit: 'baḥr kabīr',
    meaning: 'une grande mer',
    requiresWords: ['word-bahr', 'word-kabir'],
  },
  {
    id: 'phrase-jabal-kabir',
    arabic: 'جبل كبير',
    translit: 'jabal kabīr',
    meaning: 'une grande montagne',
    requiresWords: ['word-jabal', 'word-kabir'],
  },
  {
    id: 'phrase-ward-jamil',
    arabic: 'ورد جميل',
    translit: 'ward jamīl',
    meaning: 'de belles roses',
    requiresWords: ['word-ward'],
  },
  // Corps
  {
    id: 'phrase-ras-qalb',
    arabic: 'رأس وقلب',
    translit: 'raʾs wa qalb',
    meaning: 'une tête et un cœur',
    requiresWords: ['word-ras', 'word-qalb'],
  },
  {
    id: 'phrase-ayn-jamil',
    arabic: 'عين جميلة',
    translit: 'ʿayn jamīla',
    meaning: 'un bel œil',
    requiresWords: ['word-ayn'],
  },
  // Objets
  {
    id: 'phrase-kitab-jadid',
    arabic: 'كتاب جديد',
    translit: 'kitāb jadīd',
    meaning: 'un nouveau livre',
    requiresWords: ['word-kitab', 'word-jadid'],
  },
  {
    id: 'phrase-qalam-saghir',
    arabic: 'قلم صغير',
    translit: 'qalam ṣaghīr',
    meaning: 'un petit stylo',
    requiresWords: ['word-qalam', 'word-saghir'],
  },
  {
    id: 'phrase-haqiba-kabira',
    arabic: 'حقيبة كبيرة',
    translit: 'ḥaqība kabīra',
    meaning: 'un grand sac',
    requiresWords: ['word-haqiba', 'word-kabir'],
  },
  {
    id: 'phrase-hatif-jadid',
    arabic: 'هاتف جديد',
    translit: 'hātif jadīd',
    meaning: 'un nouveau téléphone',
    requiresWords: ['word-hatif', 'word-jadid'],
  },
  // Ville
  {
    id: 'phrase-madrasa-kabira',
    arabic: 'مدرسة كبيرة',
    translit: 'madrasa kabīra',
    meaning: 'une grande école',
    requiresWords: ['word-madrasa', 'word-kabir'],
  },
  {
    id: 'phrase-suq-kabir',
    arabic: 'سوق كبير',
    translit: 'sūq kabīr',
    meaning: 'un grand marché',
    requiresWords: ['word-suq', 'word-kabir'],
  },
  {
    id: 'phrase-madina-jamil',
    arabic: 'مدينة جميلة',
    translit: 'madīna jamīla',
    meaning: 'une belle ville',
    requiresWords: ['word-madina'],
  },
  {
    id: 'phrase-masjid-kabir',
    arabic: 'مسجد كبير',
    translit: 'masjid kabīr',
    meaning: 'une grande mosquée',
    requiresWords: ['word-masjid', 'word-kabir'],
  },
  // Couleurs
  {
    id: 'phrase-bayt-abyad',
    arabic: 'بيت أبيض',
    translit: 'bayt abyaḍ',
    meaning: 'une maison blanche',
    requiresWords: ['word-bayt', 'word-abyad'],
  },
  {
    id: 'phrase-ward-ahmar',
    arabic: 'ورد أحمر',
    translit: 'ward aḥmar',
    meaning: 'des roses rouges',
    requiresWords: ['word-ward', 'word-ahmar'],
  },
  {
    id: 'phrase-bahr-azraq',
    arabic: 'بحر أزرق',
    translit: 'baḥr azraq',
    meaning: 'une mer bleue',
    requiresWords: ['word-bahr', 'word-azraq'],
  },
  // Temps & Utiles
  {
    id: 'phrase-yawm-jamil',
    arabic: 'يوم جميل',
    translit: 'yawm jamīl',
    meaning: 'une belle journée',
    requiresWords: ['word-yawm'],
  },
  {
    id: 'phrase-salam-sadiq',
    arabic: 'سلام وصديق',
    translit: 'salām wa ṣadīq',
    meaning: 'paix et amitié',
    requiresWords: ['word-salam', 'word-sadiq'],
  },
]

export const phrasesById = new Map(phrases.map((p) => [p.id, p]))
