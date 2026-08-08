import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './ui.css'

/** Gabarit d'écran : en-tête, contenu centré, action en bas. */
export function Screen({
  top,
  children,
  actions,
}: {
  top?: ReactNode
  children: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="screen">
      {top && <header className="screen__top">{top}</header>}
      <main className="screen__body">{children}</main>
      {actions}
    </div>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  block?: boolean
}

export function Button({ variant = 'primary', block, className, ...props }: ButtonProps) {
  const classes = ['btn', `btn--${variant}`, block && 'btn--block', className]
    .filter(Boolean)
    .join(' ')
  return <button type="button" className={classes} {...props} />
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="progress__fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

/** Panneau de correction. Il porte l'action suivante pour garder un seul geste possible. */
export function Feedback({
  correct,
  note,
  onNext,
  nextLabel = 'Continuer',
}: {
  correct: boolean
  note?: ReactNode
  onNext: () => void
  nextLabel?: string
}) {
  return (
    <div className={`feedback feedback--${correct ? 'ok' : 'bad'}`} role="status">
      <p className="feedback__title">
        {correct ? <CheckIcon /> : <CrossIcon />}
        {correct ? 'Bravo' : 'Pas encore'}
      </p>
      {note && <div className="feedback__note">{note}</div>}
      <Button block onClick={onNext} autoFocus>
        {nextLabel}
      </Button>
    </div>
  )
}

export function SpeakButton({ onPlay, playing }: { onPlay: () => void; playing: boolean }) {
  return (
    <button
      type="button"
      className={`btn-audio${playing ? ' btn-audio--playing' : ''}`}
      onClick={onPlay}
      aria-label="Écouter"
    >
      <SoundIcon />
    </button>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d="M4 12.5 9.5 18 20 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  )
}

function SoundIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5Z" strokeLinejoin="round" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" strokeLinecap="round" />
    </svg>
  )
}
