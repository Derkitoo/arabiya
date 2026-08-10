import { useEffect, useMemo, useState } from 'react'
import { HandsFree } from './screens/HandsFree'
import { Home } from './screens/Home'
import { Onboarding } from './screens/Onboarding'
import { Phonetics } from './screens/Phonetics'
import { Placement } from './screens/Placement'
import { Session, type SessionResult } from './screens/Session'
import { Settings } from './screens/Settings'
import { Sounds } from './screens/Sounds'
import { Summary } from './screens/Summary'
import { TraceStudio } from './screens/TraceStudio'
import { buildSession, describeSession, dueToday } from './content/session'
import { letters, lettersById, type LetterFamily } from './content/letters'
import { seedFromPlacement } from './content/placement'
import type { Level } from './content/levels'
import { isMastered, review } from './lib/srs'
import { emptyProfile, loadProfile, saveProfile, streakOf, todayKey, type Profile } from './lib/storage'

type Route =
  | { name: 'home' }
  | { name: 'session' }
  | { name: 'settings' }
  | { name: 'sounds' }
  | { name: 'phonetics' }
  | { name: 'trace' }
  | { name: 'handsfree' }
  | { name: 'placement' }
  | { name: 'summary'; correct: number; total: number }

export default function App() {
  const [profile, setProfile] = useState<Profile>(loadProfile)
  const [route, setRoute] = useState<Route>({ name: 'home' })
  const today = todayKey()

  useEffect(() => {
    saveProfile(profile)
  }, [profile])

  // Application du thème dynamique (Système, Clair, Sombre Émeraude)
  useEffect(() => {
    const theme = profile.theme ?? 'system'
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [profile.theme])

  const session = useMemo(
    () => buildSession(profile.goalMinutes ?? 10, profile.cards, today),
    [profile.goalMinutes, profile.cards, today],
  )

  const mastered = [...lettersById.keys()].filter(
    (id) => profile.cards[id] && isMastered(profile.cards[id]),
  ).length

  const applyPlacement = (families: LetterFamily[]) => {
    setProfile((current) => ({
      ...current,
      level: 'tested',
      cards: { ...seedFromPlacement(families, today), ...current.cards },
    }))
    setRoute({ name: 'home' })
  }

  const toggleTheme = () => {
    setProfile((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }))
  }

  if (profile.goalMinutes === null) {
    return (
      <div className="app-frame">
        <Onboarding
          onDone={(level: Level, goalMinutes: number, families?: LetterFamily[]) =>
            setProfile({
              ...profile,
              level,
              goalMinutes,
              cards: families ? seedFromPlacement(families, today) : {},
            })
          }
        />
      </div>
    )
  }

  const finish = (results: SessionResult[]) => {
    setProfile((current) => {
      const cards = { ...current.cards }
      for (const result of results) {
        cards[result.id] = review(cards[result.id], result.correct, today)
      }
      return {
        ...current,
        cards,
        sessionsDone: current.sessionsDone + 1,
        activeDays: current.activeDays.includes(today)
          ? current.activeDays
          : [...current.activeDays, today],
      }
    })
    setRoute({
      name: 'summary',
      correct: results.filter((result) => result.correct).length,
      total: results.length,
    })
  }

  const composition = describeSession(session, profile.cards)

  return (
    <div className="app-frame">
      {route.name === 'home' && (
        <Home
          profile={profile}
          screens={composition.screens}
          reviews={composition.reviews}
          news={composition.news}
          dueCount={dueToday(profile.cards, today)}
          mastered={mastered}
          lettersTotal={letters.length}
          onStart={() => setRoute({ name: 'session' })}
          onOpenSettings={() => setRoute({ name: 'settings' })}
          onOpenSounds={() => setRoute({ name: 'sounds' })}
          onOpenPhonetics={() => setRoute({ name: 'phonetics' })}
          onOpenTrace={() => setRoute({ name: 'trace' })}
          onOpenHandsFree={() => setRoute({ name: 'handsfree' })}
          onToggleTheme={toggleTheme}
        />
      )}
      {route.name === 'session' && (
        <Session items={session} onQuit={() => setRoute({ name: 'home' })} onFinish={finish} />
      )}
      {route.name === 'settings' && (
        <Settings
          goalMinutes={profile.goalMinutes}
          theme={profile.theme ?? 'system'}
          mastered={mastered}
          lettersTotal={letters.length}
          onChangeGoal={(goalMinutes) => setProfile({ ...profile, goalMinutes })}
          onChangeTheme={(theme) => setProfile({ ...profile, theme })}
          onRetakePlacement={() => setRoute({ name: 'placement' })}
          onReset={() => {
            setProfile(emptyProfile)
            setRoute({ name: 'home' })
          }}
          onBack={() => setRoute({ name: 'home' })}
        />
      )}
      {route.name === 'sounds' && <Sounds onBack={() => setRoute({ name: 'home' })} />}
      {route.name === 'phonetics' && <Phonetics onBack={() => setRoute({ name: 'home' })} />}
      {route.name === 'trace' && <TraceStudio onBack={() => setRoute({ name: 'home' })} />}
      {route.name === 'handsfree' && <HandsFree onBack={() => setRoute({ name: 'home' })} />}
      {route.name === 'placement' && (
        <Placement onDone={applyPlacement} onSkip={() => setRoute({ name: 'home' })} />
      )}
      {route.name === 'summary' && (
        <Summary
          correct={route.correct}
          total={route.total}
          streak={streakOf(profile.activeDays)}
          mastered={mastered}
          lettersTotal={letters.length}
          onHome={() => setRoute({ name: 'home' })}
        />
      )}
    </div>
  )
}
