import { useState } from 'react'
import { Button, Screen } from '../ui'
import { Placement } from './Placement'
import { levelOptions, type Level } from '../content/levels'
import type { LetterFamily } from '../content/letters'
import './screens.css'

const GOALS = [
  { minutes: 5, title: 'Tranquille', meta: '5 min par jour' },
  { minutes: 10, title: 'Régulier', meta: '10 min par jour' },
  { minutes: 20, title: 'Sérieux', meta: '20 min par jour' },
]

type Step = 'welcome' | 'level' | 'placement' | 'goal'

/** Quatre écrans au plus, deux décisions. On ne demande ni compte ni email. */
export function Onboarding({
  onDone,
}: {
  onDone: (level: Level, goalMinutes: number, families?: LetterFamily[]) => void
}) {
  const [step, setStep] = useState<Step>('welcome')
  const [level, setLevel] = useState<Level>('zero')
  const [goal, setGoal] = useState(10)
  const [families, setFamilies] = useState<LetterFamily[]>([])

  if (step === 'welcome') {
    return (
      <Screen
        actions={
          <div className="screen__actions">
            <Button block onClick={() => setStep('level')}>
              Commencer
            </Button>
          </div>
        }
      >
        <div className="hero">
          <span className="hero__mark ar" aria-hidden="true">
            ض
          </span>
          <h1 className="title">Apprendre l’arabe, un geste par jour</h1>
          <p className="subtitle">
            Pas de menus, pas de choix à faire. Chaque jour, l’app t’indique la seule chose à
            travailler.
          </p>
        </div>
      </Screen>
    )
  }

  if (step === 'level') {
    return (
      <Screen
        actions={
          <div className="screen__actions">
            <Button block onClick={() => setStep(level === 'tested' ? 'placement' : 'goal')}>
              Continuer
            </Button>
          </div>
        }
      >
        <div>
          <h1 className="title">Où en es-tu ?</h1>
          <p className="subtitle">
            Si tu connais déjà quelques lettres, dix questions suffisent à savoir lesquelles —
            inutile de réapprendre ce que tu sais.
          </p>
        </div>
        <div className="options" role="radiogroup" aria-label="Niveau de départ">
          {levelOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={level === option.id}
              className={`option${level === option.id ? ' option--selected' : ''}`}
              onClick={() => setLevel(option.id)}
            >
              <span className="option__title">{option.title}</span>
              <span className="option__meta">{option.meta}</span>
            </button>
          ))}
        </div>
      </Screen>
    )
  }

  if (step === 'placement') {
    return (
      <Placement
        onDone={(correctFamilies) => {
          setFamilies(correctFamilies)
          setStep('goal')
        }}
        onSkip={() => {
          setLevel('zero')
          setFamilies([])
          setStep('goal')
        }}
      />
    )
  }

  return (
    <Screen
      actions={
        <div className="screen__actions">
          <Button block onClick={() => onDone(level, goal, level === 'tested' ? families : undefined)}>
            C’est parti
          </Button>
        </div>
      }
    >
      <div>
        <h1 className="title">Ton rythme</h1>
        <p className="subtitle">Modifiable à tout moment dans les réglages.</p>
      </div>
      <div className="options" role="radiogroup" aria-label="Objectif quotidien">
        {GOALS.map((option) => (
          <button
            key={option.minutes}
            type="button"
            role="radio"
            aria-checked={goal === option.minutes}
            className={`option${goal === option.minutes ? ' option--selected' : ''}`}
            onClick={() => setGoal(option.minutes)}
          >
            <span className="option__title">{option.title}</span>
            <span className="option__meta">{option.meta}</span>
          </button>
        ))}
      </div>
    </Screen>
  )
}
