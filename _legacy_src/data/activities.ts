import type { Activity } from '../types'

export const todayActivities: Activity[] = [
  {
    id: 'letters-1',
    title: 'Decouvrir 3 lettres',
    minutes: 5,
    kind: 'Alphabet',
    detail: 'Lire Alif, Ba et Ta avec le son associe, puis repeter chaque lettre a voix haute.',
  },
  {
    id: 'vocab-1',
    title: 'Memoriser 5 mots',
    minutes: 7,
    kind: 'Vocabulaire',
    detail: 'Lire le mot arabe, deviner le francais, puis verifier avec les cartes.',
  },
  {
    id: 'write-1',
    title: 'Copie active',
    minutes: 8,
    kind: 'Ecriture',
    detail: 'Copier chaque mot trois fois, puis reecrire une fois sans regarder.',
  },
  {
    id: 'review-1',
    title: 'Mini revision',
    minutes: 5,
    kind: 'Revision',
    detail: 'Repasser les cartes difficiles et marquer seulement celles reconnues rapidement.',
  },
]
