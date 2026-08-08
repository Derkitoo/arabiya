import { describe, expect, it } from 'vitest'
import { addDays, dayKey } from './date'

describe('dayKey', () => {
  it('utilise la date locale et non la date UTC', () => {
    // Minuit local le 9 août : en UTC+2 c'est encore le 8 août à 22 h. toISOString()
    // renvoyait donc la veille, ce qui décalait toutes les échéances d'un jour.
    expect(dayKey(new Date(2026, 7, 9, 0, 30))).toBe('2026-08-09')
    expect(dayKey(new Date(2026, 7, 9, 23, 30))).toBe('2026-08-09')
  })

  it('complète les mois et jours à deux chiffres', () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('addDays', () => {
  it('avance d’un jour', () => {
    expect(addDays('2026-08-08', 1)).toBe('2026-08-09')
  })

  it('franchit les fins de mois', () => {
    expect(addDays('2026-08-31', 1)).toBe('2026-09-01')
  })

  it('franchit les fins d’année', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('gère le 29 février d’une année bissextile', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
    expect(addDays('2027-02-28', 1)).toBe('2027-03-01')
  })

  it('reste cohérent sur un long intervalle', () => {
    expect(addDays('2026-08-08', 365)).toBe('2027-08-08')
  })
})
