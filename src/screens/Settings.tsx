import { useState } from 'react'
import { Button, Screen } from '../ui'
import './screens.css'

const GOALS = [
  { minutes: 5, title: 'Tranquille', meta: '5 min par jour' },
  { minutes: 10, title: 'Régulier', meta: '10 min par jour' },
  { minutes: 20, title: 'Sérieux', meta: '20 min par jour' },
]

const THEMES = [
  { id: 'system', title: 'Automatique', meta: 'Suit le système' },
  { id: 'light', title: 'Clair Papier', meta: 'Fond clair chaud' },
  { id: 'dark', title: 'Sombre Émeraude', meta: 'Vert profond & or' },
] as const

export function Settings({
  goalMinutes,
  theme = 'system',
  mastered,
  lettersTotal,
  onChangeGoal,
  onChangeTheme,
  onRetakePlacement,
  onReset,
  onBack,
}: {
  goalMinutes: number
  theme?: 'system' | 'light' | 'dark'
  mastered: number
  lettersTotal: number
  onChangeGoal: (minutes: number) => void
  onChangeTheme: (theme: 'system' | 'light' | 'dark') => void
  onRetakePlacement: () => void
  onReset: () => void
  onBack: () => void
}) {
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <Screen
      top={
        <>
          <Button variant="ghost" onClick={onBack} aria-label="Retour">
            ←
          </Button>
          <strong>Réglages</strong>
        </>
      }
      actions={
        <div className="screen__actions">
          <Button block onClick={onBack}>
            Retour
          </Button>
        </div>
      }
    >
      <section className="settings-block">
        <h2 className="stat__label">Apparence & Thème</h2>
        <div className="options" role="radiogroup" aria-label="Thème d'affichage">
          {THEMES.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={theme === option.id}
              className={`option${theme === option.id ? ' option--selected' : ''}`}
              onClick={() => onChangeTheme(option.id)}
            >
              <span className="option__title">{option.title}</span>
              <span className="option__meta">{option.meta}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="settings-block">
        <h2 className="stat__label">Objectif quotidien</h2>
        <div className="options" role="radiogroup" aria-label="Objectif quotidien">
          {GOALS.map((option) => (
            <button
              key={option.minutes}
              type="button"
              role="radio"
              aria-checked={goalMinutes === option.minutes}
              className={`option${goalMinutes === option.minutes ? ' option--selected' : ''}`}
              onClick={() => onChangeGoal(option.minutes)}
            >
              <span className="option__title">{option.title}</span>
              <span className="option__meta">{option.meta}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="settings-block">
        <h2 className="stat__label">Niveau</h2>
        <p className="subtitle">
          {mastered}/{lettersTotal} lettres maîtrisées. Repasser le test réévalue les lettres
          que tu connais déjà ; ta série et tes sessions sont conservées.
        </p>
        <Button variant="secondary" block onClick={onRetakePlacement}>
          Repasser le test de niveau
        </Button>
      </section>

      <section className="settings-block">
        <h2 className="stat__label">Données</h2>
        <p className="subtitle">
          Tout est enregistré dans ce navigateur uniquement. Rien n’est envoyé nulle part.
        </p>
        {confirmReset ? (
          <div className="settings-danger">
            <p className="feedback__title">Effacer toute la progression ?</p>
            <p className="feedback__note">
              {mastered > 0
                ? `Les ${mastered} lettres maîtrisées, ta série et ton historique seront perdus.`
                : 'Ta progression, ta série et ton historique seront perdus.'}
            </p>
            <Button variant="secondary" block onClick={() => setConfirmReset(false)}>
              Annuler
            </Button>
            <Button variant="ghost" block onClick={onReset}>
              Oui, tout effacer
            </Button>
          </div>
        ) : (
          <Button variant="ghost" block onClick={() => setConfirmReset(true)}>
            Tout effacer
          </Button>
        )}
      </section>
    </Screen>
  )
}
