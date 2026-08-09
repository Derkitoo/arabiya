/** Audio arabe. L'app joue d'abord un fichier local stable quand il existe, puis utilise la
   synthese vocale du navigateur comme secours pour garder les exercices utilisables. */

export type AudioKind = 'letter' | 'word'

export type AudioSourceInfo = {
  source: 'local' | 'fallback'
  ext?: string
}

type AudioCallbacks = {
  onStart?: () => void
  onEnd?: () => void
  onFallback?: () => void
  onSourceResolved?: (info: AudioSourceInfo) => void
}

let currentAudio: HTMLAudioElement | null = null
const knownAudioCache = new Map<string, AudioSourceInfo>()

export function pronunciationPath(kind: AudioKind, id: string, ext = 'mp3') {
  const base = import.meta.env.BASE_URL || '/'
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}audio/${kind}s/${id}.${ext}`
}

function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
  if (typeof speechSynthesis !== 'undefined') {
    speechSynthesis.cancel()
  }
}

export function hasArabicVoice() {
  if (typeof speechSynthesis === 'undefined') return false
  return speechSynthesis.getVoices().some((voice) => voice.lang.startsWith('ar'))
}

export async function checkAudioSource(kind: AudioKind, id: string): Promise<AudioSourceInfo> {
  const cacheKey = `${kind}:${id}`
  if (knownAudioCache.has(cacheKey)) {
    return knownAudioCache.get(cacheKey)!
  }

  if (typeof fetch === 'undefined') {
    const fallbackInfo: AudioSourceInfo = { source: 'fallback' }
    knownAudioCache.set(cacheKey, fallbackInfo)
    return fallbackInfo
  }

  const exts = ['mp3', 'webm', 'ogg', 'wav']
  for (const ext of exts) {
    try {
      const res = await fetch(pronunciationPath(kind, id, ext), { method: 'HEAD' })
      const contentType = res.headers.get('content-type') || ''
      if (res.ok && !contentType.includes('text/html')) {
        const info: AudioSourceInfo = { source: 'local', ext }
        knownAudioCache.set(cacheKey, info)
        return info
      }
    } catch {
      // Continue to next extension
    }
  }

  const fallbackInfo: AudioSourceInfo = { source: 'fallback' }
  knownAudioCache.set(cacheKey, fallbackInfo)
  return fallbackInfo
}

export function speak(
  text: string,
  { onStart, onEnd }: { onStart?: () => void; onEnd?: () => void } = {},
) {
  if (typeof speechSynthesis === 'undefined') {
    onEnd?.()
    return
  }
  speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ar-SA'
  utterance.rate = 0.8
  const voice = speechSynthesis.getVoices().find((v) => v.lang.startsWith('ar'))
  if (voice) utterance.voice = voice
  utterance.onstart = () => onStart?.()
  utterance.onend = () => onEnd?.()
  utterance.onerror = () => onEnd?.()
  speechSynthesis.speak(utterance)
}

export function playPronunciation(
  {
    kind,
    id,
    text,
  }: {
    kind: AudioKind
    id: string
    text: string
  },
  { onStart, onEnd, onFallback, onSourceResolved }: AudioCallbacks = {},
) {
  stopCurrentAudio()

  if (typeof Audio === 'undefined') {
    onFallback?.()
    onSourceResolved?.({ source: 'fallback' })
    speak(text, { onStart, onEnd })
    return
  }

  const exts = ['mp3', 'webm', 'ogg', 'wav']
  let index = 0
  let isHandled = false
  let isPlayingStarted = false

  const tryNext = () => {
    if (isHandled || isPlayingStarted) return
    isHandled = true
    index += 1
    trySource()
  }

  const trySource = () => {
    const ext = exts[index]
    if (!ext) {
      if (!isPlayingStarted) {
        onFallback?.()
        onSourceResolved?.({ source: 'fallback' })
        speak(text, { onStart, onEnd })
      }
      return
    }

    isHandled = false
    const src = pronunciationPath(kind, id, ext)
    const audio = new Audio(src)
    currentAudio = audio
    audio.preload = 'auto'

    audio.onplaying = () => {
      isPlayingStarted = true
      onSourceResolved?.({ source: 'local', ext })
      knownAudioCache.set(`${kind}:${id}`, { source: 'local', ext })
      onStart?.()
    }

    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null
      onEnd?.()
    }

    audio.onerror = () => {
      tryNext()
    }

    audio.play()
      .then(() => {
        isPlayingStarted = true
      })
      .catch(() => {
        tryNext()
      })
  }

  trySource()
}
