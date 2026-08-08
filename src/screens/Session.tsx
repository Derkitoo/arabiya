import { useEffect, useMemo, useState } from 'react'
import { Button, Feedback, ProgressBar, Screen, SpeakButton } from '../ui'
import { hasArabicVoice, speak } from '../lib/speech'
import { shuffle } from '../lib/shuffle'
import { isScored, type Item } from '../content/types'
import './screens.css'

export type SessionResult = { id: string; correct: boolean }

/** Compare deux graphies arabes en ignorant voyelles courtes, tatweel et formes de hamza :
   à ce stade on valide le squelette consonantique, pas la vocalisation. */
function normalizeArabic(value: string) {
  return value
    .replace(/[ً-ْـ]/g, '')
    .replace(/[آأإ]/g, 'ا')
    .replace(/\s+/g, '')
    .trim()
}

export function Session({
  items,
  onQuit,
  onFinish,
}: {
  items: Item[]
  onQuit: () => void
  onFinish: (results: SessionResult[]) => void
}) {
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState<SessionResult[]>([])
  const [playing, setPlaying] = useState(false)

  const item = items[index]
  const expected = item.kind === 'teach' ? '' : item.kind === 'listen' ? item.arabic : item.answer
  const isCorrect =
    item.kind === 'write'
      ? normalizeArabic(answer) === normalizeArabic(expected)
      : answer === expected

  // L'ordre des propositions est figé pour un item donné, sinon il change à chaque rendu.
  const options = useMemo(() => {
    if (item.kind === 'write' || item.kind === 'teach') return []
    return shuffle(item.options, item.id)
  }, [item])

  const play = () => {
    if (item.kind !== 'listen' && item.kind !== 'teach') return
    speak(item.arabic, { onStart: () => setPlaying(true), onEnd: () => setPlaying(false) })
  }

  // La consigne sonore se déclenche seule : l'utilisateur n'a pas à la demander.
  useEffect(() => {
    if (item.kind !== 'listen' && item.kind !== 'teach') return
    speak(item.arabic, { onStart: () => setPlaying(true), onEnd: () => setPlaying(false) })
  }, [item])

  const next = () => {
    // Un écran de présentation ne produit pas de résultat : il n'y avait rien à réussir.
    const all = isScored(item) ? [...results, { id: item.id, correct: isCorrect }] : results
    if (index + 1 >= items.length) {
      onFinish(all)
      return
    }
    setResults(all)
    setIndex(index + 1)
    setAnswer('')
    setChecked(false)
  }

  const choiceClass = (option: string) => {
    if (!checked) return `choice${answer === option ? ' choice--selected' : ''}`
    if (option === expected) return 'choice choice--ok'
    if (option === answer) return 'choice choice--bad'
    return 'choice'
  }

  return (
    <Screen
      top={
        <>
          <Button variant="ghost" onClick={onQuit} aria-label="Quitter la session">
            ✕
          </Button>
          <ProgressBar value={index / items.length} label="Progression de la session" />
          <span className="option__meta">
            {index + 1}/{items.length}
          </span>
        </>
      }
      actions={
        item.kind === 'teach' ? (
          <div className="screen__actions">
            <Button block onClick={next}>
              J’ai compris
            </Button>
          </div>
        ) : checked ? (
          <Feedback
            correct={isCorrect}
            note={
              <>
                {!isCorrect && (
                  <p>
                    Réponse : <strong className={item.kind === 'write' || item.kind === 'listen' ? 'ar' : ''}>{expected}</strong>
                  </p>
                )}
                {item.note && <p>{item.note}</p>}
              </>
            }
            onNext={next}
            nextLabel={index + 1 >= items.length ? 'Voir le bilan' : 'Continuer'}
          />
        ) : (
          <div className="screen__actions">
            <Button block disabled={answer === ''} onClick={() => setChecked(true)}>
              Vérifier
            </Button>
          </div>
        )
      }
    >
      <div className="prompt">
        <p className="prompt__label">{item.label}</p>
        {(item.kind === 'recognize' || item.kind === 'teach') && (
          <p className="prompt__ar ar">{item.arabic}</p>
        )}
        {item.kind === 'write' && <p className="title">{item.prompt}</p>}
      </div>

      {item.kind === 'teach' && (
        <div className="teach">
          <p className="teach__name">{item.name}</p>
          <p className="subtitle">{item.sound}</p>
          <SpeakButton onPlay={play} playing={playing} />
          <div className="teach__forms">
            {(['start', 'middle', 'end'] as const).map((position) => (
              <div className="teach__form" key={position}>
                <span className="ar teach__form-glyph">{item.forms[position]}</span>
                <span className="stat__label">
                  {position === 'start' ? 'début' : position === 'middle' ? 'milieu' : 'fin'}
                </span>
              </div>
            ))}
          </div>
          {!item.connects && (
            <p className="notice">Cette lettre ne s’attache jamais à la lettre suivante.</p>
          )}
        </div>
      )}

      {item.kind === 'listen' && (
        <div className="listen">
          <SpeakButton onPlay={play} playing={playing} />
          {!hasArabicVoice() && (
            <p className="notice">
              Aucune voix arabe installée sur cet appareil : l’exercice reste jouable, mais sans
              son.
            </p>
          )}
        </div>
      )}

      {item.kind === 'teach' ? null : item.kind === 'write' ? (
        <input
          className="input ar"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          disabled={checked}
          placeholder="اكتب هنا"
          aria-label="Ta réponse en arabe"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      ) : (
        <div className={`choices${item.kind === 'listen' ? ' choices--grid' : ''}`}>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={choiceClass(option)}
              disabled={checked}
              onClick={() => setAnswer(option)}
            >
              <span className={item.kind === 'listen' ? 'ar choice__ar' : ''}>{option}</span>
            </button>
          ))}
        </div>
      )}
    </Screen>
  )
}
