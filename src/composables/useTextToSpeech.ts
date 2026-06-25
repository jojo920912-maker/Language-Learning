import { ref } from 'vue'
import { LANGUAGES } from '@/data/languages'
import type { Language } from '@/types'

export function useTextToSpeech() {
  const isSpeaking = ref(false)
  const isSupported = ref('speechSynthesis' in window)

  function speak(text: string, language: Language, rate = 0.85) {
    if (!isSupported.value) return

    window.speechSynthesis.cancel()

    const lang = LANGUAGES.find((l) => l.code === language)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang?.ttsLang ?? 'en-US'
    utterance.rate = rate
    utterance.pitch = 1

    const voices = window.speechSynthesis.getVoices()
    const matchedVoice = voices.find((v) => v.lang.startsWith(utterance.lang.slice(0, 2)))
    if (matchedVoice) utterance.voice = matchedVoice

    utterance.onstart = () => { isSpeaking.value = true }
    utterance.onend = () => { isSpeaking.value = false }
    utterance.onerror = () => { isSpeaking.value = false }

    window.speechSynthesis.speak(utterance)
  }

  function stop() {
    window.speechSynthesis.cancel()
    isSpeaking.value = false
  }

  return { speak, stop, isSpeaking, isSupported }
}
