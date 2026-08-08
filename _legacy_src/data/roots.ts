import type { Root } from '../types'

export const roots: Root[] = [
  {
    id: 'ktb',
    arabic: '\u0643-\u062a-\u0628',
    latin: 'k-t-b',
    meaning: 'ecrire',
    note: 'La racine de l ecriture, du livre, du bureau et de ce qui est ecrit.',
    family: [
      { id: 'ktb-kataba', arabic: '\u0643\u064e\u062a\u064e\u0628\u064e', transliteration: 'kataba', french: 'il a ecrit', patternId: 'faala', patternName: 'action de base' },
      { id: 'ktb-kitab', arabic: '\u0643\u0650\u062a\u0627\u0628', transliteration: 'kitab', french: 'livre', patternId: 'fial', patternName: 'nom concret' },
      { id: 'ktb-katib', arabic: '\u0643\u0627\u062a\u0650\u0628', transliteration: 'katib', french: 'ecrivain', patternId: 'fail', patternName: 'celui qui fait' },
      { id: 'ktb-maktab', arabic: '\u0645\u064e\u0643\u0652\u062a\u064e\u0628', transliteration: 'maktab', french: 'bureau', patternId: 'mafal', patternName: 'lieu / outil' },
      { id: 'ktb-maktaba', arabic: '\u0645\u064e\u0643\u0652\u062a\u064e\u0628\u0629', transliteration: 'maktaba', french: 'bibliotheque', patternId: 'mafala', patternName: 'lieu / institution' },
      { id: 'ktb-maktub', arabic: '\u0645\u064e\u0643\u0652\u062a\u0648\u0628', transliteration: 'maktub', french: 'ecrit / destine', patternId: 'maful', patternName: 'chose faite' },
    ],
  },
  {
    id: 'drs',
    arabic: '\u062f-\u0631-\u0633',
    latin: 'd-r-s',
    meaning: 'etudier',
    note: 'La racine de l etude, de la lecon, de l ecole et de l enseignant.',
    family: [
      { id: 'drs-darasa', arabic: '\u062f\u064e\u0631\u064e\u0633\u064e', transliteration: 'darasa', french: 'il a etudie', patternId: 'faala', patternName: 'action de base' },
      { id: 'drs-dars', arabic: '\u062f\u064e\u0631\u0652\u0633', transliteration: 'dars', french: 'lecon', patternId: 'fal', patternName: 'nom d action' },
      { id: 'drs-daris', arabic: '\u062f\u0627\u0631\u0650\u0633', transliteration: 'daris', french: 'etudiant', patternId: 'fail', patternName: 'celui qui fait' },
      { id: 'drs-mudarris', arabic: '\u0645\u064f\u062f\u064e\u0631\u0651\u0650\u0633', transliteration: 'mudarris', french: 'enseignant', patternId: 'mufail', patternName: 'acteur intensif' },
      { id: 'drs-madrasa', arabic: '\u0645\u064e\u062f\u0652\u0631\u064e\u0633\u0629', transliteration: 'madrasa', french: 'ecole', patternId: 'mafala', patternName: 'lieu / institution' },
    ],
  },
  {
    id: 'alm',
    arabic: '\u0639-\u0644-\u0645',
    latin: 'a-l-m',
    meaning: 'savoir',
    note: 'La racine du savoir, de la science, du monde savant et de l apprentissage.',
    family: [
      { id: 'alm-alima', arabic: '\u0639\u064e\u0644\u0650\u0645\u064e', transliteration: 'alima', french: 'il a su', patternId: 'faila', patternName: 'action / etat' },
      { id: 'alm-ilm', arabic: '\u0639\u0650\u0644\u0652\u0645', transliteration: 'ilm', french: 'science / savoir', patternId: 'fil', patternName: 'nom abstrait' },
      { id: 'alm-alim', arabic: '\u0639\u0627\u0644\u0650\u0645', transliteration: 'alim', french: 'savant', patternId: 'fail', patternName: 'celui qui sait' },
      { id: 'alm-mualim', arabic: '\u0645\u064f\u0639\u064e\u0644\u0651\u0650\u0645', transliteration: 'muallim', french: 'enseignant', patternId: 'mufail', patternName: 'celui qui fait apprendre' },
      { id: 'alm-taalim', arabic: '\u062a\u064e\u0639\u0652\u0644\u064a\u0645', transliteration: 'taalim', french: 'enseignement', patternId: 'tafil', patternName: 'processus' },
    ],
  },
  {
    id: 'qra',
    arabic: '\u0642-\u0631-\u0623',
    latin: 'q-r-a',
    meaning: 'lire',
    note: 'La racine de la lecture, du recit lu et de la recitation.',
    family: [
      { id: 'qra-qaraa', arabic: '\u0642\u064e\u0631\u064e\u0623\u064e', transliteration: 'qaraa', french: 'il a lu', patternId: 'faala', patternName: 'action de base' },
      { id: 'qra-qiraah', arabic: '\u0642\u0650\u0631\u0627\u0621\u0629', transliteration: 'qiraah', french: 'lecture', patternId: 'fialah', patternName: 'nom d action' },
      { id: 'qra-qari', arabic: '\u0642\u0627\u0631\u0650\u0626', transliteration: 'qari', french: 'lecteur', patternId: 'fail', patternName: 'celui qui fait' },
      { id: 'qra-maqru', arabic: '\u0645\u064e\u0642\u0652\u0631\u0648\u0621', transliteration: 'maqru', french: 'lu / lisible', patternId: 'maful', patternName: 'chose faite' },
    ],
  },
  {
    id: 'dhb',
    arabic: '\u0630-\u0647-\u0628',
    latin: 'dh-h-b',
    meaning: 'aller',
    note: 'La racine du depart, du mouvement et du fait d aller quelque part.',
    family: [
      { id: 'dhb-dhahaba', arabic: '\u0630\u064e\u0647\u064e\u0628\u064e', transliteration: 'dhahaba', french: 'il est alle', patternId: 'faala', patternName: 'action de base' },
      { id: 'dhb-dhahib', arabic: '\u0630\u0627\u0647\u0650\u0628', transliteration: 'dhahib', french: 'allant / partant', patternId: 'fail', patternName: 'celui qui fait' },
      { id: 'dhb-madhhab', arabic: '\u0645\u064e\u0630\u0652\u0647\u064e\u0628', transliteration: 'madhhab', french: 'voie / ecole', patternId: 'mafal', patternName: 'lieu / chemin conceptuel' },
    ],
  },
]
