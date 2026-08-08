/** Mélange déterministe : le même item donne toujours le même ordre de propositions.
   Math.random() rendrait le rendu impur et ferait sauter les réponses à chaque re-render. */

function hash(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function shuffle<T>(list: T[], seed: string): T[] {
  const out = [...list]
  let state = hash(seed) || 1
  for (let i = out.length - 1; i > 0; i -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    const j = state % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
