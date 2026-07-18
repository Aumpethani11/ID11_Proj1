import { getSpeechLang } from "./chatLanguages";

/**
 * Multilingual text-to-speech helper for chat messages.
 * Picks the best available browser voice for the requested language.
 */

export const isSpeechSupported = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

const pickVoice = (speechLang) => {
  const voices = window.speechSynthesis.getVoices() || [];
  if (voices.length === 0) return null;

  const langLower = speechLang.toLowerCase();
  const base = langLower.split("-")[0];

  return (
    voices.find((v) => v.lang?.toLowerCase() === langLower) ||
    voices.find((v) => v.lang?.toLowerCase().startsWith(base)) ||
    null
  );
};

/**
 * Speaks the given text in the chat language `code` (e.g. "hi", "gu").
 * Returns the utterance so callers can wire onend/onerror if needed.
 */
export const speakInLanguage = (text, code, { onStart, onEnd } = {}) => {
  if (!isSpeechSupported() || !text?.trim()) return null;

  const speechLang = getSpeechLang(code);
  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = speechLang;

  const voice = pickVoice(speechLang);
  if (voice) utterance.voice = voice;

  utterance.rate = 1;
  utterance.pitch = 1;
  if (onStart) utterance.onstart = onStart;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return utterance;
};

export const stopSpeaking = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
};

// Voices load asynchronously in some browsers; trigger a load early.
if (isSpeechSupported()) {
  window.speechSynthesis.getVoices();
}
