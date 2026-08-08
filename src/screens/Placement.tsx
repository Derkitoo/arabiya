import { useMemo, useState } from 'react'
import { Button, ProgressBar, Screen } from '../ui'
import { placementLetters } from '../content/placement'
import { letters, type LetterFamily } from '../content/letters'
import { shuffle } from '../lib/shuffle'
import './screens.css'

/** Test de placement : dix questions, aucune correction affichée.
 *
 *  On ne montre pas les réponses ici, volontairement — c'est une mesure, pas une leçon.
 *  Corriger au fil du test apprendrait les lettres suivantes et fausserait la mesure. */
export function Placement({
  onDone,
  onSkip,
}: {
  onDone: (correctFamilies: LetterFamily[]) => void
  onSkip: () => void
}) {
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [correct, setCorrect] = useState<LetterFamily[]>([])

  const letter = placementLetters[index]

  const options = useMemo(() => {
    const others = shuffle(
      letters.filter((l) => l.id !== letter.id),
      letter.id,
    )
      .map((l) => l.name)
      .filter((name, position, all) => all.indexOf(name) === position)
      .slice(0, 3)
    return shuffle([letter.name, ...others], `${letter.id}-placement`)
  }, [letter])

  const next = () => {
    const all = answer === letter.name ? [...correct, letter.family] : correct
    if (index + 1 >= placementLetters.length) {
      onDone(all)
      return
    }
    setCorrect(all)
    setIndex(index + 1)
    setAnswer('')
  }

  return (
    <Screen
      top={
        <>
          <ProgressBar value={index / placementLetters.length} label="Progression du test" />
          <span className="option__meta">
            {index + 1}/{placementLetters.length}
          </span>
        </>
      }
      actions={
        <div className="screen__actions">
          <Button block disabled={answer === ''} onClick={next}>
            {index + 1 >= placementLetters.length ? 'Terminer le test' : 'Suivant'}
          </Button>
          <Button variant="ghost" onClick={onSkip}>
            Je préfère partir de zéro
          </Button>
        </div>
      }
    >
      <div className="prompt">
        <p className="prompt__label">Quelle est cette lettre ?</p>
        <p className="prompt__ar ar">{letter.char}</p>
      </div>
      <div className="choices">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`choice${answer === option ? ' choice--selected' : ''}`}
            onClick={() => setAnswer(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </Screen>
  )
}
