import { useEffect, useRef, useState } from 'react'
import { orderedLetters } from '../content/letters'
import { phrases } from '../content/phrases'
import { words } from '../content/words'
import { playPronunciation, type AudioKind } from '../lib/speech'
import { Button, Screen } from '../ui'
import './screens.css'

type PlaylistCategory = 'letters' | 'words' | 'phrases' | 'all'

type PlaylistItem = {
  kind: AudioKind
  id: string
  arabic: string
  label: string
  sublabel: string
}

export function HandsFree({ onBack }: { onBack: () => void }) {
  const [category, setCategory] = useState<PlaylistCategory>('letters')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0)
  const [delaySeconds, setDelaySeconds] = useState<number>(3)
  const [showMeaning, setShowMeaning] = useState(true)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lettersItems: PlaylistItem[] = orderedLetters.map((l) => ({
    kind: 'letter',
    id: l.id,
    arabic: l.char,
    label: l.name,
    sublabel: l.sound,
  }))

  const wordsItems: PlaylistItem[] = words.map((w) => ({
    kind: 'word',
    id: w.id,
    arabic: w.arabic,
    label: w.meaning,
    sublabel: w.translit,
  }))

  const phrasesItems: PlaylistItem[] = phrases.map((p) => ({
    kind: 'phrase',
    id: p.id,
    arabic: p.arabic,
    label: p.meaning,
    sublabel: p.translit,
  }))

  const playlist: PlaylistItem[] =
    category === 'letters'
      ? lettersItems
      : category === 'words'
        ? wordsItems
        : category === 'phrases'
          ? phrasesItems
          : [...lettersItems, ...wordsItems, ...phrasesItems]

  const currentItem = playlist[currentIndex] || playlist[0]

  const playCurrentTrack = (indexToPlay: number) => {
    const item = playlist[indexToPlay]
    if (!item) return

    playPronunciation(
      { kind: item.kind, id: item.id, text: item.arabic },
      {
        onStart: () => setIsPlaying(true),
        onEnd: () => {
          setIsPlaying(false)
          // Programmer le morceau suivant après le délai d'attente choisi
          timerRef.current = setTimeout(() => {
            setCurrentIndex((prevIndex) => {
              const nextIdx = prevIndex + 1 < playlist.length ? prevIndex + 1 : 0
              playCurrentTrack(nextIdx)
              return nextIdx
            })
          }, delaySeconds * 1000)
        },
      },
    )
  }

  const togglePlayPause = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (isPlaying) {
      setIsPlaying(false)
    } else {
      playCurrentTrack(currentIndex)
    }
  }

  const prevTrack = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const prevIdx = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1
    setCurrentIndex(prevIdx)
    if (isPlaying) {
      playCurrentTrack(prevIdx)
    }
  }

  const nextTrack = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const nextIdx = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0
    setCurrentIndex(nextIdx)
    if (isPlaying) {
      playCurrentTrack(nextIdx)
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <Screen
      top={
        <>
          <Button variant="ghost" onClick={onBack} aria-label="Retour">
            ←
          </Button>
          <strong>Mode Écoute Continue</strong>
        </>
      }
    >
      <section className="sound-hero">
        <h1 className="title">Révision Mains Libres 🎧</h1>
        <p className="subtitle">
          Écoute enchaînée sans toucher l’écran. Idéal pour s’immerger et réviser l’oreille.
        </p>
      </section>

      {/* Sélecteur de playlist */}
      <div className="tabs" role="tablist" aria-label="Liste d'écoute">
        <button
          type="button"
          className={`tab${category === 'letters' ? ' tab--active' : ''}`}
          onClick={() => {
            if (timerRef.current) clearTimeout(timerRef.current)
            setIsPlaying(false)
            setCategory('letters')
            setCurrentIndex(0)
          }}
        >
          Alphabet (28)
        </button>
        <button
          type="button"
          className={`tab${category === 'words' ? ' tab--active' : ''}`}
          onClick={() => {
            if (timerRef.current) clearTimeout(timerRef.current)
            setIsPlaying(false)
            setCategory('words')
            setCurrentIndex(0)
          }}
        >
          Mots (78)
        </button>
        <button
          type="button"
          className={`tab${category === 'phrases' ? ' tab--active' : ''}`}
          onClick={() => {
            if (timerRef.current) clearTimeout(timerRef.current)
            setIsPlaying(false)
            setCategory('phrases')
            setCurrentIndex(0)
          }}
        >
          Phrases (32)
        </button>
      </div>

      {/* Carte du lecteur Hands-Free */}
      <div className="handsfree-card">
        <div className="handsfree-card__counter">
          <span>
            {currentIndex + 1} / {playlist.length}
          </span>
          <button
            type="button"
            className="handsfree-eye-toggle"
            onClick={() => setShowMeaning((prev) => !prev)}
            aria-label="Afficher ou masquer le sens"
          >
            {showMeaning ? '👁️ Traduction visible' : '🙈 Traduction masquée'}
          </button>
        </div>

        {/* Animation visualiseur audio */}
        <div className={`handsfree-wave${isPlaying ? ' handsfree-wave--playing' : ''}`}>
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        {/* Affichage de l'élément sonore */}
        <div className="handsfree-card__display">
          <p className="ar handsfree-card__arabic">{currentItem.arabic}</p>
          {showMeaning ? (
            <>
              <h2 className="handsfree-card__title">{currentItem.label}</h2>
              <p className="subtitle">{currentItem.sublabel}</p>
            </>
          ) : (
            <p className="handsfree-card__hidden">??? (Traduction masquée)</p>
          )}
        </div>

        {/* Contrôles du lecteur principal */}
        <div className="handsfree-player-controls">
          <button
            type="button"
            className="handsfree-btn handsfree-btn--nav"
            onClick={prevTrack}
            aria-label="Morceau précédent"
          >
            ⏮
          </button>

          <button
            type="button"
            className="handsfree-btn handsfree-btn--play"
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Lecture'}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>

          <button
            type="button"
            className="handsfree-btn handsfree-btn--nav"
            onClick={nextTrack}
            aria-label="Morceau suivant"
          >
            ⏭
          </button>
        </div>

        {/* Réglages de pause entre les sons */}
        <div className="handsfree-settings-row">
          <div className="handsfree-setting">
            <span className="stat__label">Pause entre les sons</span>
            <div className="handsfree-pills">
              {[2, 3, 5].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  className={`handsfree-pill${delaySeconds === sec ? ' handsfree-pill--active' : ''}`}
                  onClick={() => setDelaySeconds(sec)}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          <div className="handsfree-setting">
            <span className="stat__label">Vitesse</span>
            <div className="handsfree-pills">
              {[0.8, 1.0, 1.2].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  className={`handsfree-pill${audioSpeed === spd ? ' handsfree-pill--active' : ''}`}
                  onClick={() => setAudioSpeed(spd)}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Screen>
  )
}
