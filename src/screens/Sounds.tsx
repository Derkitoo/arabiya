import { useEffect, useMemo, useState } from 'react'
import { orderedLetters } from '../content/letters'
import { themeOrder, words } from '../content/words'
import {
  checkAudioSource,
  hasArabicVoice,
  playPronunciation,
  type AudioKind,
  type AudioSourceInfo,
} from '../lib/speech'
import { Button, Screen, SpeakButton } from '../ui'
import './screens.css'

type Tab = 'letters' | 'words'

function normalize(value: string) {
  return value
    .toLocaleLowerCase('fr-FR')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

export function Sounds({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>('letters')
  const [query, setQuery] = useState('')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [voiceReady, setVoiceReady] = useState(hasArabicVoice)
  const [audioSources, setAudioSources] = useState<Record<string, AudioSourceInfo>>({})

  useEffect(() => {
    if (typeof speechSynthesis === 'undefined') return
    const refresh = () => setVoiceReady(hasArabicVoice())
    refresh()
    speechSynthesis.addEventListener('voiceschanged', refresh)
    return () => speechSynthesis.removeEventListener('voiceschanged', refresh)
  }, [])

  useEffect(() => {
    let active = true
    const checkAll = async () => {
      const results: Record<string, AudioSourceInfo> = {}
      for (const letter of orderedLetters) {
        const info = await checkAudioSource('letter', letter.id)
        results[`letter:${letter.id}`] = info
      }
      for (const word of words) {
        const info = await checkAudioSource('word', word.id)
        results[`word:${word.id}`] = info
      }
      if (active) {
        setAudioSources(results)
      }
    }
    checkAll()
    return () => {
      active = false
    }
  }, [])

  const q = normalize(query.trim())

  const filteredLetters = useMemo(() => {
    if (!q) return orderedLetters
    return orderedLetters.filter((letter) =>
      normalize(`${letter.char} ${letter.name} ${letter.sound}`).includes(q),
    )
  }, [q])

  const filteredWords = useMemo(() => {
    if (!q) return words
    return words.filter((word) =>
      normalize(`${word.arabic} ${word.translit} ${word.meaning}`).includes(q),
    )
  }, [q])

  const localLettersCount = useMemo(() => {
    return orderedLetters.filter((l) => audioSources[`letter:${l.id}`]?.source === 'local').length
  }, [audioSources])

  const localWordsCount = useMemo(() => {
    return words.filter((w) => audioSources[`word:${w.id}`]?.source === 'local').length
  }, [audioSources])

  const play = (kind: AudioKind, id: string, text: string) => {
    playPronunciation(
      { kind, id, text },
      {
        onStart: () => setPlayingId(id),
        onEnd: () => setPlayingId(null),
        onSourceResolved: (info) => {
          setAudioSources((prev) => ({ ...prev, [`${kind}:${id}`]: info }))
        },
      },
    )
  }

  return (
    <Screen
      top={
        <>
          <Button variant="ghost" onClick={onBack} aria-label="Retour">
            ←
          </Button>
          <strong>Bibliothèque des sons</strong>
        </>
      }
    >
      <section className="sound-hero">
        <h1 className="title">Écouter les lettres et les mots</h1>
        <p className="subtitle">
          Répète à l’oreille avant les exercices : signe isolé, mot complet, puis sens.
        </p>

        <div className="sound-coverage">
          <span>Couverture audios HD locaux</span>
          <span className="sound-coverage__count">
            {tab === 'letters'
              ? `${localLettersCount} / ${orderedLetters.length} lettres`
              : `${localWordsCount} / ${words.length} mots`}
          </span>
        </div>
      </section>

      {!voiceReady && (
        <p className="notice">
          Aucun fichier audio local ni voix arabe fiable n’est garanti sur cet appareil. Les
          boutons restent disponibles avec une voix navigateur en secours.
        </p>
      )}

      <div className="sound-tools">
        <div className="tabs" role="tablist" aria-label="Type de sons">
          <button
            type="button"
            className={`tab${tab === 'letters' ? ' tab--active' : ''}`}
            onClick={() => setTab('letters')}
            role="tab"
            aria-selected={tab === 'letters'}
          >
            Lettres ({localLettersCount} HD)
          </button>
          <button
            type="button"
            className={`tab${tab === 'words' ? ' tab--active' : ''}`}
            onClick={() => setTab('words')}
            role="tab"
            aria-selected={tab === 'words'}
          >
            Mots ({localWordsCount} HD)
          </button>
        </div>

        <input
          className="sound-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={tab === 'letters' ? 'Chercher une lettre' : 'Chercher un mot'}
          aria-label="Chercher dans les sons"
        />
      </div>

      {tab === 'letters' ? (
        <div className="sound-list">
          {filteredLetters.map((letter) => {
            const info = audioSources[`letter:${letter.id}`]
            const isLocal = info?.source === 'local'
            return (
              <article className="sound-row" key={letter.id}>
                <div className="sound-row__glyph ar">{letter.char}</div>
                <div className="sound-row__body">
                  <strong>{letter.name}</strong>
                  <span>{letter.sound}</span>
                </div>
                <span
                  className={`badge-audio ${
                    isLocal ? 'badge-audio--local' : 'badge-audio--fallback'
                  }`}
                >
                  {isLocal ? `HD (${info.ext?.toUpperCase()})` : 'Synthèse'}
                </span>
                <SpeakButton
                  onPlay={() => play('letter', letter.id, letter.char)}
                  playing={playingId === letter.id}
                />
              </article>
            )
          })}
        </div>
      ) : (
        <div className="sound-sections">
          {themeOrder.map((theme) => {
            const themeWords = filteredWords.filter((word) => word.theme === theme.id)
            if (themeWords.length === 0) return null
            return (
              <section className="sound-section" key={theme.id}>
                <h2>{theme.label}</h2>
                <div className="sound-list">
                  {themeWords.map((word) => {
                    const info = audioSources[`word:${word.id}`]
                    const isLocal = info?.source === 'local'
                    return (
                      <article className="sound-row sound-row--word" key={word.id}>
                        <div className="sound-row__glyph sound-row__glyph--word ar">
                          {word.arabic}
                        </div>
                        <div className="sound-row__body">
                          <strong>{word.meaning}</strong>
                          <span>{word.translit}</span>
                        </div>
                        <span
                          className={`badge-audio ${
                            isLocal ? 'badge-audio--local' : 'badge-audio--fallback'
                          }`}
                        >
                          {isLocal ? `HD (${info.ext?.toUpperCase()})` : 'Synthèse'}
                        </span>
                        <SpeakButton
                          onPlay={() => play('word', word.id, word.arabic)}
                          playing={playingId === word.id}
                        />
                      </article>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </Screen>
  )
}
