import { describe, expect, it, vi } from 'vitest'
import { letters } from './letters'
import { words } from './words'
import {
  checkAudioSource,
  hasArabicVoice,
  playPronunciation,
  pronunciationPath,
} from '../lib/speech'

describe('speech & audio infrastructure', () => {
  it('génère les chemins audio relatifs corrects', () => {
    expect(pronunciationPath('letter', 'alif')).toBe('/audio/letters/alif.mp3')
    expect(pronunciationPath('word', 'bint', 'wav')).toBe('/audio/words/bint.wav')
  })

  it('fournit une vérification de la présence d’une voix arabe', () => {
    expect(typeof hasArabicVoice()).toBe('boolean')
  })

  it('gère la résolution des sources sans planter', async () => {
    const info = await checkAudioSource('word', 'bint')
    expect(['local', 'fallback']).toContain(info.source)
  })

  it('déclenche le callback de fallback ou de démarrage lors de la lecture', () => {
    const onStart = vi.fn()
    const onEnd = vi.fn()
    const onFallback = vi.fn()
    const onSourceResolved = vi.fn()

    playPronunciation(
      { kind: 'word', id: 'bint', text: 'بنت' },
      { onStart, onEnd, onFallback, onSourceResolved },
    )

    // En environnement de test Node/JSDOM, Audio.play est un stub ou fallback
    expect(onSourceResolved).toHaveBeenCalled()
  })

  it('couvre l’ensemble des identifiants de lettres et mots sans erreur', () => {
    for (const letter of letters) {
      expect(pronunciationPath('letter', letter.id)).toContain(`/audio/letters/${letter.id}`)
    }
    for (const word of words) {
      expect(pronunciationPath('word', word.id)).toContain(`/audio/words/${word.id}`)
    }
  })
})
