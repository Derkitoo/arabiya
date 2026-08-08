/** Synthèse vocale arabe. Dégrade en silence si aucune voix arabe n'est installée :
   l'exercice reste jouable, seul le son manque. */

export function hasArabicVoice() {
  if (typeof speechSynthesis === 'undefined') return false
  return speechSynthesis.getVoices().some((voice) => voice.lang.startsWith('ar'))
}

/** onStart/onEnd sont appelés par les évènements de l'API, donc de façon asynchrone :
   c'est ce qui permet à l'appelant de piloter son état sans setState synchrone. */
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
