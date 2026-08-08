export function canSpeak() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}

export function speakArabic(text: string) {
  if (!canSpeak()) return false

  const utterance = new SpeechSynthesisUtterance(text)
  const voices = window.speechSynthesis.getVoices()
  const arabicVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('ar'))

  utterance.lang = arabicVoice?.lang ?? 'ar-SA'
  utterance.voice = arabicVoice ?? null
  utterance.rate = 0.75
  utterance.pitch = 1

  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
  return true
}
