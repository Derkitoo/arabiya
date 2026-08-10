/** Base de données phonétique et guide d'articulation (Makhārij al-ḥurūf) pour les 9 lettres
 *  arabe réputées difficiles ou absentes du français. */

export type PhoneticGuide = {
  id: string
  letterChar: string
  name: string
  makhraj: string
  tip: string
  contrast: {
    pairId: string
    pairChar: string
    pairName: string
    explanation: string
  }
}

export const phoneticsGuide: PhoneticGuide[] = [
  {
    id: 'hha',
    letterChar: 'ح',
    name: 'ḥā',
    makhraj: 'Milieu du pharynx (gorge moyenne)',
    tip: 'Compresser légèrement la gorge comme pour faire de la buée sur un verre sans racler.',
    contrast: {
      pairId: 'ha',
      pairChar: 'ه',
      pairName: 'hā',
      explanation: 'ه sort du bas du thorax (souffle doux), alors que ح est frictionné au milieu de la gorge.',
    },
  },
  {
    id: 'kha',
    letterChar: 'خ',
    name: 'khā',
    makhraj: 'Haut du pharynx (racine de la langue)',
    tip: 'Frictionner au fond du palais, similaire au "j" espagnol (jota) ou "ch" allemand (Bach).',
    contrast: {
      pairId: 'hha',
      pairChar: 'ح',
      pairName: 'ḥā',
      explanation: 'ح est lisse et doux en milieu de gorge, alors que خ racle doucement le fond du palais.',
    },
  },
  {
    id: 'sad',
    letterChar: 'ص',
    name: 'ṣād',
    makhraj: 'Bout de la langue contre les incisives inférieures (emphatique)',
    tip: 'Prononcer un "s" fort avec le dos de la langue relevé vers le voûte du palais (voix grave/sombre).',
    contrast: {
      pairId: 'sin',
      pairChar: 'س',
      pairName: 'sīn',
      explanation: 'س est clair et aigu (comme dans "sac"), ص est emphatique, sourd et grave.',
    },
  },
  {
    id: 'dad',
    letterChar: 'ض',
    name: 'ḍād',
    makhraj: 'Bords de la langue contre les molaires supérieures',
    tip: 'La lettre emblème de l’arabe : un "d" lourd appuyé latéralement contre les molaires.',
    contrast: {
      pairId: 'dal',
      pairChar: 'د',
      pairName: 'dāl',
      explanation: 'د est léger sur la pointe des dents (comme "dame"), ض est lourd et appuyé sur les molaires.',
    },
  },
  {
    id: 'tta',
    letterChar: 'ط',
    name: 'ṭā',
    makhraj: 'Pointe de la langue contre la racine des incisives (emphatique)',
    tip: 'Poser le plat de la langue contre le palais en prononçant un "t" très lourd et sourd.',
    contrast: {
      pairId: 'ta',
      pairChar: 'ت',
      pairName: 'tā',
      explanation: 'ت est un "t" léger de devant, ط est un "t" emphatique avec résonance dans toute la bouche.',
    },
  },
  {
    id: 'dha',
    letterChar: 'ظ',
    name: 'ẓā',
    makhraj: 'Pointe de la langue sous le bord des incisives supérieures',
    tip: 'Un "th" anglais sonore (comme "this") rendu lourd et emphatique avec la bouche pleine.',
    contrast: {
      pairId: 'dhal',
      pairChar: 'ذ',
      pairName: 'dhāl',
      explanation: 'ذ est le "th" doux et fin, ظ est sa version emphatique et sombre.',
    },
  },
  {
    id: 'ayn',
    letterChar: 'ع',
    name: 'ʿayn',
    makhraj: 'Milieu de la gorge (contraction du pharynx)',
    tip: 'Contracter les muscles de la gorge comme au moment de la déglutition pour sortir le son.',
    contrast: {
      pairId: 'alif',
      pairChar: 'ا',
      pairName: 'alif',
      explanation: 'ا sert de support de voyelle neutre, ע (ayn) est une vraie consonne gutturale pincée.',
    },
  },
  {
    id: 'ghayn',
    letterChar: 'غ',
    name: 'ghayn',
    makhraj: 'Haut de la gorge (voile du palais)',
    tip: 'Proche du "r" parisien grasseillé ou du gargouillement doux.',
    contrast: {
      pairId: 'kha',
      pairChar: 'خ',
      pairName: 'khā',
      explanation: 'خ est sec et raclé (sourd), غ est sonore et voisé (vibration de la gorge).',
    },
  },
  {
    id: 'qaf',
    letterChar: 'ق',
    name: 'qāf',
    makhraj: 'L’extrême fond de la langue contre la luette',
    tip: 'Un "k" articulé au tout fond de la gorge, produisant un claquement lourd.',
    contrast: {
      pairId: 'kaf',
      pairChar: 'ك',
      pairName: 'kāf',
      explanation: 'ك est un "k" ordinaire sur le devant du palais, ق sort tout au fond vers la luette.',
    },
  },
]
