import { useState } from 'react'
import { phoneticsGuide } from '../content/phonetics'
import { playPronunciation } from '../lib/speech'
import { Button, Screen, SpeakButton } from '../ui'
import './screens.css'

export function Phonetics({ onBack }: { onBack: () => void }) {
  const [playingId, setPlayingId] = useState<string | null>(null)

  const play = (id: string, text: string) => {
    playPronunciation(
      { kind: 'letter', id, text },
      { onStart: () => setPlayingId(id), onEnd: () => setPlayingId(null) },
    )
  }

  return (
    <Screen
      top={
        <>
          <Button variant="ghost" onClick={onBack} aria-label="Retour">
            ←
          </Button>
          <strong>Guide de Prononciation</strong>
        </>
      }
    >
      <section className="sound-hero">
        <h1 className="title">Points d’articulation (المخارج)</h1>
        <p className="subtitle">
          Maîtrise les 9 sons particuliers de l’arabe grâce au guidage anatomique et au comparateur
          acoustique.
        </p>
      </section>

      <div className="phonetics-list">
        {phoneticsGuide.map((item) => {
          const isPlayingMain = playingId === item.id
          const isPlayingPair = playingId === item.contrast.pairId
          return (
            <article className="phonetics-card" key={item.id}>
              <header className="phonetics-card__head">
                <div className="phonetics-card__glyph ar">{item.letterChar}</div>
                <div className="phonetics-card__meta">
                  <strong>{item.name}</strong>
                  <span className="phonetics-card__makhraj">{item.makhraj}</span>
                </div>
                <SpeakButton onPlay={() => play(item.id, item.letterChar)} playing={isPlayingMain} />
              </header>

              <p className="phonetics-card__tip">
                💡 <strong>Conseil :</strong> {item.tip}
              </p>

              <div className="phonetics-contrast">
                <span className="phonetics-contrast__label">Comparateur acoustique :</span>
                <div className="phonetics-contrast__box">
                  <div className="phonetics-contrast__item">
                    <span className="ar">{item.letterChar}</span>
                    <SpeakButton
                      onPlay={() => play(item.id, item.letterChar)}
                      playing={isPlayingMain}
                    />
                  </div>
                  <span className="phonetics-contrast__vs">vs</span>
                  <div className="phonetics-contrast__item">
                    <span className="ar">{item.contrast.pairChar}</span>
                    <SpeakButton
                      onPlay={() => play(item.contrast.pairId, item.contrast.pairChar)}
                      playing={isPlayingPair}
                    />
                  </div>
                </div>
                <p className="phonetics-contrast__explain">{item.contrast.explanation}</p>
              </div>
            </article>
          )
        })}
      </div>
    </Screen>
  )
}
