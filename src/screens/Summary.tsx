import { Button, Screen } from '../ui'
import './screens.css'

export function Summary({
  correct,
  total,
  streak,
  mastered,
  lettersTotal,
  onHome,
}: {
  correct: number
  total: number
  streak: number
  mastered: number
  lettersTotal: number
  onHome: () => void
}) {
  const pct = Math.round((correct / total) * 100)

  return (
    <Screen
      actions={
        <div className="screen__actions">
          <Button block onClick={onHome}>
            Terminer
          </Button>
        </div>
      }
    >
      <div className="hero">
        <div className="summary-score">
          <span className="summary-score__value">{pct}%</span>
          <span className="summary-score__label">réussite</span>
        </div>
        <h1 className="title">
          {pct >= 80 ? 'Très bien joué' : pct >= 50 ? 'C’est en place' : 'On reprendra ça demain'}
        </h1>
        <p className="subtitle">
          {correct} bonnes réponses sur {total}.
        </p>
      </div>

      <div className="stats">
        <div className="stat">
          <span className="stat__value">{streak}</span>
          <span className="stat__label">jours d’affilée</span>
        </div>
        <div className="stat">
          <span className="stat__value">
            {mastered}/{lettersTotal}
          </span>
          <span className="stat__label">lettres maîtrisées</span>
        </div>
      </div>
    </Screen>
  )
}
