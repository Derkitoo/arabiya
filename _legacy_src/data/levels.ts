import type { Level } from '../types'

export const levels: Level[] = [
  {
    id: 'level-1',
    title: 'Niveau 1 - Alphabet et sons',
    goal: 'Reconnaître les familles de lettres, les points et les sons arabes difficiles.',
    skills: ['Lire les lettres isolées', 'Identifier les points', 'Distinguer les sons de gorge', 'Reconnaître les sons emphatiques'],
    unlock: 0,
  },
  {
    id: 'level-2',
    title: 'Niveau 2 - Formes des lettres',
    goal: 'Observer les formes isolée, initiale, médiane et finale.',
    skills: ['Distinguer les lettres attachables', 'Lire les formes', 'Comparer les familles visuelles'],
    unlock: 12,
  },
  {
    id: 'level-3',
    title: 'Niveau 3 - Voyelles courtes',
    goal: 'Lire fatha, kasra, damma, soukoun, shadda et tanwin.',
    skills: ['Lire ba/bi/bou', 'Comprendre l’absence de voyelle', 'Reconnaître une consonne double'],
    unlock: 25,
  },
  {
    id: 'level-4',
    title: 'Niveau 4 - Syllabes et mots courts',
    goal: 'Assembler des syllabes pour lire des mots simples.',
    skills: ['Lire de droite à gauche', 'Segmenter un mot', 'Relier syllabes et sens'],
    unlock: 38,
  },
  {
    id: 'level-5',
    title: 'Niveau 5 - Vocabulaire quotidien',
    goal: 'Construire un stock de mots utiles par thème.',
    skills: ['Maison', 'Famille', 'Objets', 'Questions simples'],
    unlock: 50,
  },
  {
    id: 'level-6',
    title: 'Niveau 6 - Phrases simples',
    goal: 'Construire des phrases courtes et réutilisables.',
    skills: ['Je suis', "J'ai", 'Où est', 'Je veux'],
    unlock: 62,
  },
  {
    id: 'level-7',
    title: 'Niveau 7 - Dialogues et histoires',
    goal: 'Comprendre de courts échanges et mini-récits.',
    skills: ['Saluer', 'Répondre', 'Lire une histoire courte'],
    unlock: 75,
  },
  {
    id: 'level-8',
    title: 'Niveau 8 - Grammaire de base',
    goal: 'Installer les premières structures grammaticales.',
    skills: ['Pronoms', 'Question', 'Nom/adjectif', 'Révision générale'],
    unlock: 88,
  },
]
