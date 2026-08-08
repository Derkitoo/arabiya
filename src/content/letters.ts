/** Les 28 lettres de l'alphabet arabe.
 *
 *  `family` regroupe les lettres qui partagent le même squelette et ne diffèrent que par
 *  les points : c'est la vraie difficulté du débutant, et c'est ce qui sert à fabriquer des
 *  distracteurs utiles plutôt que des lettres tirées au hasard.
 *
 *  Six lettres (alif, dal, dhal, ra, zay, waw) ne s'attachent jamais à la lettre suivante :
 *  leur forme initiale est donc identique à leur forme isolée. */

export type LetterFamily =
  | 'dents'
  | 'ventre'
  | 'dal'
  | 'ra'
  | 'sin'
  | 'sad'
  | 'emphatique'
  | 'ayn'
  | 'fa'
  | 'seule'

export type Letter = {
  id: string
  char: string
  /** translittération académique, sert de réponse attendue */
  name: string
  /** description courte du son, en français */
  sound: string
  family: LetterFamily
  /** false pour les six lettres qui ne se lient pas à gauche */
  connects: boolean
  /** son absent du français : reste à apprendre même pour qui « connaît l'alphabet » */
  tricky?: boolean
  forms: { start: string; middle: string; end: string }
}

export const letters: Letter[] = [
  {
    id: 'alif',
    char: 'ا',
    name: 'alif',
    sound: 'support du « a » long',
    family: 'seule',
    connects: false,
    forms: { start: 'ا', middle: 'ـا', end: 'ـا' },
  },
  {
    id: 'ba',
    char: 'ب',
    name: 'bā',
    sound: 'b de bateau',
    family: 'dents',
    connects: true,
    forms: { start: 'بـ', middle: 'ـبـ', end: 'ـب' },
  },
  {
    id: 'ta',
    char: 'ت',
    name: 'tā',
    sound: 't de table',
    family: 'dents',
    connects: true,
    forms: { start: 'تـ', middle: 'ـتـ', end: 'ـت' },
  },
  {
    id: 'tha',
    char: 'ث',
    name: 'thā',
    sound: 'th anglais de think',
    family: 'dents',
    connects: true,
    forms: { start: 'ثـ', middle: 'ـثـ', end: 'ـث' },
  },
  {
    id: 'jim',
    char: 'ج',
    name: 'jīm',
    sound: 'dj de djinn',
    family: 'ventre',
    connects: true,
    forms: { start: 'جـ', middle: 'ـجـ', end: 'ـج' },
  },
  {
    id: 'hha',
    tricky: true,
    char: 'ح',
    name: 'ḥā',
    sound: 'h très soufflé, gorge serrée',
    family: 'ventre',
    connects: true,
    forms: { start: 'حـ', middle: 'ـحـ', end: 'ـح' },
  },
  {
    id: 'kha',
    tricky: true,
    char: 'خ',
    name: 'khā',
    sound: 'j espagnol, raclé',
    family: 'ventre',
    connects: true,
    forms: { start: 'خـ', middle: 'ـخـ', end: 'ـخ' },
  },
  {
    id: 'dal',
    char: 'د',
    name: 'dāl',
    sound: 'd de dame',
    family: 'dal',
    connects: false,
    forms: { start: 'د', middle: 'ـد', end: 'ـد' },
  },
  {
    id: 'dhal',
    char: 'ذ',
    name: 'dhāl',
    sound: 'th anglais de this',
    family: 'dal',
    connects: false,
    forms: { start: 'ذ', middle: 'ـذ', end: 'ـذ' },
  },
  {
    id: 'ra',
    char: 'ر',
    name: 'rā',
    sound: 'r roulé',
    family: 'ra',
    connects: false,
    forms: { start: 'ر', middle: 'ـر', end: 'ـر' },
  },
  {
    id: 'zay',
    char: 'ز',
    name: 'zāy',
    sound: 'z de zèbre',
    family: 'ra',
    connects: false,
    forms: { start: 'ز', middle: 'ـز', end: 'ـز' },
  },
  {
    id: 'sin',
    char: 'س',
    name: 'sīn',
    sound: 's de sable',
    family: 'sin',
    connects: true,
    forms: { start: 'سـ', middle: 'ـسـ', end: 'ـس' },
  },
  {
    id: 'shin',
    char: 'ش',
    name: 'shīn',
    sound: 'ch de chat',
    family: 'sin',
    connects: true,
    forms: { start: 'شـ', middle: 'ـشـ', end: 'ـش' },
  },
  {
    id: 'sad',
    tricky: true,
    char: 'ص',
    name: 'ṣād',
    sound: 's emphatique, bouche pleine',
    family: 'sad',
    connects: true,
    forms: { start: 'صـ', middle: 'ـصـ', end: 'ـص' },
  },
  {
    id: 'dad',
    tricky: true,
    char: 'ض',
    name: 'ḍād',
    sound: 'd emphatique, la lettre emblème de l’arabe',
    family: 'sad',
    connects: true,
    forms: { start: 'ضـ', middle: 'ـضـ', end: 'ـض' },
  },
  {
    id: 'tta',
    tricky: true,
    char: 'ط',
    name: 'ṭā',
    sound: 't emphatique, sourd',
    family: 'emphatique',
    connects: true,
    forms: { start: 'طـ', middle: 'ـطـ', end: 'ـط' },
  },
  {
    id: 'dha',
    tricky: true,
    char: 'ظ',
    name: 'ẓā',
    sound: 'z emphatique',
    family: 'emphatique',
    connects: true,
    forms: { start: 'ظـ', middle: 'ـظـ', end: 'ـظ' },
  },
  {
    id: 'ayn',
    tricky: true,
    char: 'ع',
    name: 'ʿayn',
    sound: 'son de gorge, sans équivalent français',
    family: 'ayn',
    connects: true,
    forms: { start: 'عـ', middle: 'ـعـ', end: 'ـع' },
  },
  {
    id: 'ghayn',
    tricky: true,
    char: 'غ',
    name: 'ghayn',
    sound: 'r grasseyé, proche du r parisien',
    family: 'ayn',
    connects: true,
    forms: { start: 'غـ', middle: 'ـغـ', end: 'ـغ' },
  },
  {
    id: 'fa',
    char: 'ف',
    name: 'fā',
    sound: 'f de fable',
    family: 'fa',
    connects: true,
    forms: { start: 'فـ', middle: 'ـفـ', end: 'ـف' },
  },
  {
    id: 'qaf',
    tricky: true,
    char: 'ق',
    name: 'qāf',
    sound: 'k profond, au fond de la gorge',
    family: 'fa',
    connects: true,
    forms: { start: 'قـ', middle: 'ـقـ', end: 'ـق' },
  },
  {
    id: 'kaf',
    char: 'ك',
    name: 'kāf',
    sound: 'k de kilo',
    family: 'seule',
    connects: true,
    forms: { start: 'كـ', middle: 'ـكـ', end: 'ـك' },
  },
  {
    id: 'lam',
    char: 'ل',
    name: 'lām',
    sound: 'l de lune',
    family: 'seule',
    connects: true,
    forms: { start: 'لـ', middle: 'ـلـ', end: 'ـل' },
  },
  {
    id: 'mim',
    char: 'م',
    name: 'mīm',
    sound: 'm de maison',
    family: 'seule',
    connects: true,
    forms: { start: 'مـ', middle: 'ـمـ', end: 'ـم' },
  },
  {
    id: 'nun',
    char: 'ن',
    name: 'nūn',
    sound: 'n de nuit',
    family: 'dents',
    connects: true,
    forms: { start: 'نـ', middle: 'ـنـ', end: 'ـن' },
  },
  {
    id: 'ha',
    char: 'ه',
    name: 'hā',
    sound: 'h aspiré léger, comme en anglais',
    family: 'seule',
    connects: true,
    forms: { start: 'هـ', middle: 'ـهـ', end: 'ـه' },
  },
  {
    id: 'waw',
    char: 'و',
    name: 'wāw',
    sound: 'ou de oui',
    family: 'seule',
    connects: false,
    forms: { start: 'و', middle: 'ـو', end: 'ـو' },
  },
  {
    id: 'ya',
    char: 'ي',
    name: 'yā',
    sound: 'y de yaourt',
    family: 'dents',
    connects: true,
    forms: { start: 'يـ', middle: 'ـيـ', end: 'ـي' },
  },
]

export const lettersById = new Map(letters.map((letter) => [letter.id, letter]))
