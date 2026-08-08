/** Clés de date au format YYYY-MM-DD, toujours en heure **locale**.
 *
 *  `toISOString()` renvoie la date UTC : à l'est de Greenwich, minuit local est encore la
 *  veille en UTC, ce qui décale d'un jour aussi bien les échéances de révision que la série
 *  de jours actifs. Tout le calcul de dates de l'app passe donc par ici. */

export function dayKey(date = new Date()) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDayKey(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addDays(key: string, days: number) {
  const date = parseDayKey(key)
  date.setDate(date.getDate() + days)
  return dayKey(date)
}
