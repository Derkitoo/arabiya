import { Button, ProgressBar, Screen } from '../ui'
import { streakOf, todayKey, type Profile } from '../lib/storage'
import './screens.css'

export function Home({
  profile,
  screens,
  reviews,
  news,
  dueCount,
  mastered,
  lettersTotal,
  onStart,
  onOpenSettings,
  onOpenSounds,
  onOpenPhonetics,
  onOpenTrace,
  onOpenHandsFree,
  onToggleTheme,
}: {
  profile: Profile
  screens: number
  reviews: number
  news: number
  dueCount: number
  mastered: number
  lettersTotal: number
  onStart: () => void
  onOpenSettings: () => void
  onOpenSounds: () => void
  onOpenPhonetics: () => void
  onOpenTrace: () => void
  onOpenHandsFree: () => void
  onToggleTheme: () => void
}) {
  const doneToday = profile.activeDays.includes(todayKey())
  const streak = streakOf(profile.activeDays)
  const isDark = profile.theme === 'dark'

  const parts = [
    reviews > 0 && `${reviews} à revoir`,
    news > 0 && `${news} nouvelle${news > 1 ? 's' : ''}`,
  ].filter(Boolean)

  return (
    <Screen
      top={
        <>
          <span className="brand-mark" aria-hidden="true">
            <img src="./logo.png" alt="Arabiya Logo" width="40" height="40" />
          </span>
          <strong>Arabiya</strong>
          <span className="top-spacer" />
          <Button variant="ghost" onClick={onToggleTheme} aria-label="Changer de thème">
            {isDark ? '☀️' : '🌙'}
          </Button>
          <Button variant="ghost" onClick={onOpenSettings} aria-label="Réglages">
            <GearIcon />
          </Button>
        </>
      }
      actions={
        <div className="screen__actions">
          <div className="home-secondary-tools">
            <Button variant="secondary" onClick={onOpenSounds}>
              🔊 Sons
            </Button>
            <Button variant="secondary" onClick={onOpenPhonetics}>
              🗣️ Phonétique
            </Button>
            <Button variant="secondary" onClick={onOpenTrace}>
              ✍️ Tracé
            </Button>
            <Button variant="secondary" onClick={onOpenHandsFree}>
              🎧 Mains libres
            </Button>
          </div>
          <Button block onClick={onStart}>
            {doneToday ? 'Continuer quand même' : 'Commencer la session'}
          </Button>
        </div>
      }
    >
      <section className="today">
        <span className="today__eyebrow">
          {doneToday && dueCount === 0 ? 'Rien à réviser' : 'Aujourd’hui'}
        </span>
        <h1 className="title">
          {doneToday && dueCount === 0
            ? 'Tout est à jour. Reviens demain.'
            : `${profile.goalMinutes} minutes d’arabe`}
        </h1>
        <p className="subtitle">
          {parts.length > 0
            ? `${screens} écrans : ${parts.join(', ')}.`
            : 'Les prochaines révisions arrivent bientôt.'}
        </p>
      </section>

      <section className="alphabet">
        <div className="alphabet__head">
          <span className="stat__label">Alphabet maîtrisé</span>
          <strong>
            {mastered}/{lettersTotal}
          </strong>
        </div>
        <ProgressBar value={mastered / lettersTotal} label="Lettres maîtrisées" />
      </section>

      <div className="stats">
        <div className="stat">
          <span className="stat__value">{streak}</span>
          <span className="stat__label">jours d’affilée</span>
        </div>
        <div className="stat">
          <span className="stat__value">{profile.sessionsDone}</span>
          <span className="stat__label">sessions</span>
        </div>
      </div>
    </Screen>
  )
}

function GearIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3.2" />
      <path
        d="M12 2.8v2M12 19.2v2M4.3 7.5l1.7 1M18 15.5l1.7 1M4.3 16.5l1.7-1M18 8.5l1.7-1"
        strokeLinecap="round"
      />
    </svg>
  )
}
