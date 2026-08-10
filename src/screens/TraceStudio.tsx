import { useState } from 'react'
import { orderedLetters } from '../content/letters'
import { playPronunciation } from '../lib/speech'
import { Button, Screen } from '../ui'
import { DrawingCanvas } from '../ui/DrawingCanvas'
import './screens.css'

type FormKind = 'start' | 'middle' | 'end' | 'char'

export function TraceStudio({ onBack }: { onBack: () => void }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [formKind, setFormKind] = useState<FormKind>('char')
  const [showGrid, setShowGrid] = useState(false)

  const letter = orderedLetters[selectedIndex] || orderedLetters[0]

  const glyph =
    formKind === 'char'
      ? letter.char
      : letter.forms[formKind as 'start' | 'middle' | 'end']

  const play = () => {
    playPronunciation({ kind: 'letter', id: letter.id, text: letter.char })
  }

  const prevLetter = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : orderedLetters.length - 1))
  }

  const nextLetter = () => {
    setSelectedIndex((prev) => (prev < orderedLetters.length - 1 ? prev + 1 : 0))
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
      {/* En-tête de la lettre avec navigation directe ‹ et › */}
      <div className="trace-nav-header">
        <button
          type="button"
          className="trace-nav-btn"
          onClick={prevLetter}
          aria-label="Lettre précédente"
        >
          ‹
        </button>

        <div className="trace-current-badge">
          <span className="ar trace-current-glyph">{letter.char}</span>
          <div className="trace-current-info">
            <h2>{letter.name}</h2>
            <span className="trace-current-sub">{letter.sound} • {letter.family}</span>
          </div>
        </div>

        <button
          type="button"
          className="trace-nav-btn"
          onClick={nextLetter}
          aria-label="Lettre suivante"
        >
          ›
        </button>
      </div>

      {/* Bouton pour afficher/masquer la grille des 28 lettres */}
      <button
        type="button"
        className="trace-grid-toggle"
        onClick={() => setShowGrid((prev) => !prev)}
      >
        {showGrid ? '▲ Masquer les 28 lettres' : '▼ Sélectionner parmi les 28 lettres (4×7)'}
      </button>

      {/* Grille compacte 4×7 des 28 lettres adaptée mobile */}
      {showGrid && (
        <div className="trace-grid-picker" role="region" aria-label="Grille des 28 lettres">
          {orderedLetters.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              className={`trace-grid-btn ar${
                idx === selectedIndex ? ' trace-grid-btn--active' : ''
              }`}
              onClick={() => {
                setSelectedIndex(idx)
                setShowGrid(false)
              }}
            >
              {item.char}
            </button>
          ))}
        </div>
      )}

      {/* Fiche de la lettre et zone de dessin */}
      <div className="trace-card">
        {/* Choix des 4 formes attachées (Isolée, Début, Milieu, Fin) */}
        <div className="trace-forms-grid" role="tablist" aria-label="Formes de la lettre">
          <button
            type="button"
            className={`trace-form-tab${formKind === 'char' ? ' trace-form-tab--active' : ''}`}
            onClick={() => setFormKind('char')}
          >
            <span className="ar trace-form-glyph">{letter.char}</span>
            <span className="trace-form-label">Isolée</span>
          </button>

          <button
            type="button"
            className={`trace-form-tab${formKind === 'start' ? ' trace-form-tab--active' : ''}`}
            onClick={() => setFormKind('start')}
          >
            <span className="ar trace-form-glyph">{letter.forms.start}</span>
            <span className="trace-form-label">Début</span>
          </button>

          <button
            type="button"
            className={`trace-form-tab${formKind === 'middle' ? ' trace-form-tab--active' : ''}`}
            onClick={() => setFormKind('middle')}
          >
            <span className="ar trace-form-glyph">{letter.forms.middle}</span>
            <span className="trace-form-label">Milieu</span>
          </button>

          <button
            type="button"
            className={`trace-form-tab${formKind === 'end' ? ' trace-form-tab--active' : ''}`}
            onClick={() => setFormKind('end')}
          >
            <span className="ar trace-form-glyph">{letter.forms.end}</span>
            <span className="trace-form-label">Fin</span>
          </button>
        </div>

        {/* Zone de tracé tactile */}
        <DrawingCanvas glyph={glyph} onPlayAudio={play} />
      </div>
    </Screen>
  )
}
