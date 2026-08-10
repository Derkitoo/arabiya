import { describe, expect, it } from 'vitest'
import { phrases } from './phrases'
import { wordsById } from './words'

describe('Phrases Content & Audios', () => {
  it('contient au moins 30 phrases valides', () => {
    expect(phrases.length).toBeGreaterThanOrEqual(30)
  })

  it('chaque phrase fait référence à des mots existants dans le dictionnaire', () => {
    for (const phrase of phrases) {
      expect(phrase.id).toBeTruthy()
      expect(phrase.arabic).toBeTruthy()
      expect(phrase.meaning).toBeTruthy()
      expect(phrase.requiresWords.length).toBeGreaterThan(0)

      for (const wordId of phrase.requiresWords) {
        expect(wordsById.has(wordId), `Le mot ${wordId} requis par ${phrase.id} n'existe pas`).toBe(true)
      }
    }
  })

  it('les audios de phrases sont correctement répertoriés', () => {
    const audioFiles = import.meta.glob('/public/audio/phrases/*.mp3', { eager: true })
    const foundKeys = Object.keys(audioFiles)
    for (const phrase of phrases) {
      const expectedKey = `/public/audio/phrases/${phrase.id}.mp3`
      expect(foundKeys).toContain(expectedKey)
    }
  })
})
