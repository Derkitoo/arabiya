import { useState } from 'react'
import { orderedLetters } from '../content/letters'
import { playPronunciation } from '../lib/speech'
import { Button, Screen } from '../ui'
import { DrawingCanvas } from '../ui/DrawingCanvas'
import './screens.css'

type FormKind = 'start' | 'middle' | 'end' | 'char'

export function TraceStudio({ onBack }: { onBack: () => void }) {
  const [selectedLetterId, setSelectedLetterId] = useState(orderedLetters[0].id)
  const [formKind, setFormKind] = useState<FormKind>('char')

  const letter = orderedLetters.find((l) => l.id === selectedLetterId) ?? orderedLetters[0]

  const glyph =
    formKind === 'char'
      ? letter.char
      : letter.forms[formKind as 'start' | 'middle' | 'end']

  const play = () => {
    playPronunciation({ kind: 'letter', id: letter.id, text: letter.char })
  }

  return (
    <Screen
      top={
        <>
          <Button variant="ghost" onClick={onBack} aria-label="Retour">
            ←
          </Button>
          <strong>Atelier d’Écriture Tactile</strong>
        </>
      }
    >
      <section className="sound-hero">
        <h1 className="title">Tracer les 28 lettres</h1>
        <p className="subtitle">
          Entraîne-toi au geste du tracé sur les 3 formes attachées de l’alphabet.
        </p>
      </section>

      {/* Selecteur de lettres */}
      <div className="trace-letter-picker" role="region" aria-label="Choix de la lettre">
        {orderedLetters.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`trace-letter-btn ar${
              item.id === letter.id ? ' trace-letter-btn--active' : ''
            }`}
            onClick={() => setSelectedLetterId(item.id)}
          >
            {item.char}
          </button>
        ))}
      </div>

      {/* Fiche de la lettre selectionnee */}
      <div className="trace-card">
        <header className="trace-card__head">
          <div>
            <h2>{letter.name}</h2>
            <span>{letter.sound}</span>
          </div>
          <span className="trace-card__family">Famille : {letter.family}</span>
        </header>

        {/* Formes attachées */}
        <div className="tabs" role="tablist" aria-label="Formes de la lettre">
          <button
            type="button"
            className={`tab${formKind === 'char' ? ' tab--active' : ''}`}
            onClick={() => setFormKind('char')}
          >
            Isolée ({letter.char})
          </button>
          <button
            type="button"
            className={`tab${formKind === 'start' ? ' tab--active' : ''}`}
            onClick={() => setFormKind('start')}
          >
            Début ({letter.forms.start})
          </button>
          <button
            type="button"
            className={`tab${formKind === 'middle' ? ' tab--active' : ''}`}
            onClick={() => setFormKind('middle')}
          >
            Milieu ({letter.forms.middle})
          </button>
          <button
            type="button"
            className={`tab${formKind === 'end' ? ' tab--active' : ''}`}
            onClick={() => setFormKind('end')}
          >
            Fin ({letter.forms.end})
          </button>
        </div>

        {/* Zone de tracé tactile */}
        <DrawingCanvas glyph={glyph} onPlayAudio={play} />
      </div>
    </Screen>
  )
}
