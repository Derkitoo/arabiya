import type { ListeningItem } from '../types'

export const listeningItems: ListeningItem[] = [
  {
    id: 'listen-alif',
    title: 'Lettre Alif',
    arabic: '\u0627',
    transliteration: 'alif',
    french: 'Premiere lettre de l’alphabet.',
    category: 'lettre',
  },
  {
    id: 'listen-ba',
    title: 'Lettre Ba',
    arabic: '\u0628',
    transliteration: 'ba',
    french: 'Son proche du b francais.',
    category: 'lettre',
  },
  {
    id: 'listen-bayt',
    title: 'Mot : maison',
    arabic: '\u0628\u064a\u062a',
    transliteration: 'bayt',
    french: 'Maison',
    category: 'mot',
  },
  {
    id: 'listen-kitab',
    title: 'Mot : livre',
    arabic: '\u0643\u062a\u0627\u0628',
    transliteration: 'kitab',
    french: 'Livre',
    category: 'mot',
  },
  {
    id: 'listen-salam',
    title: 'Salutation',
    arabic: '\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064a\u0643\u0645',
    transliteration: 'as-salamu alaykum',
    french: 'Que la paix soit sur vous.',
    category: 'phrase',
  },
  {
    id: 'listen-reply',
    title: 'Reponse a la salutation',
    arabic: '\u0648\u0639\u0644\u064a\u0643\u0645 \u0627\u0644\u0633\u0644\u0627\u0645',
    transliteration: 'wa alaykum as-salam',
    french: 'Et sur vous la paix.',
    category: 'dialogue',
  },
]
