import { useState } from 'react'
import { Button, Screen } from '../ui'
import './screens.css'

const GOALS = [
  { minutes: 5, title: 'Tranquille', meta: '5 min par jour' },
  { minutes: 10, title: 'Régulier', meta: '10 min par jour' },
  { minutes: 20, title: 'Sérieux', meta: '20 min par jour' },
]

export function Settings({
  goalMinutes,
  mastered,
  lettersTotal,
  onChangeGoal,
  onRetakePlacement,
  onReset,
  onBack,
}: {
  goalMinutes: number
  mastered: number
  lettersTotal: number
  onChangeGoal: (minutes: number) => void
  onRetakePlacement: () => void
  onReset: () => void
  onBack: () => void
}) {
  // La remise à zéro efface une progression que rien ne sauvegarde ailleurs : deux gestes.
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
          Tout est enregistré dans ce navigateur uniquement. Rien n’est envoyé nulle part, et
          rien n’est récupérable après effacement.
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
