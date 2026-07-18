export const CHAT_LANGUAGES = [
  { code: "en", label: "English", speechLang: "en-US" },
  { code: "hi", label: "Hindi", speechLang: "hi-IN" },
  { code: "gu", label: "Gujarati", speechLang: "gu-IN" },
  { code: "bn", label: "Bengali", speechLang: "bn-IN" },
  { code: "ta", label: "Tamil", speechLang: "ta-IN" },
  { code: "te", label: "Telugu", speechLang: "te-IN" },
  { code: "mr", label: "Marathi", speechLang: "mr-IN" },
  { code: "kn", label: "Kannada", speechLang: "kn-IN" },
  { code: "ml", label: "Malayalam", speechLang: "ml-IN" },
  { code: "pa", label: "Punjabi", speechLang: "pa-IN" },
  { code: "ur", label: "Urdu", speechLang: "ur-PK" },
];

export const getLanguageLabel = (code) =>
  CHAT_LANGUAGES.find((lang) => lang.code === code)?.label || code;

export const getSpeechLang = (code) =>
  CHAT_LANGUAGES.find((lang) => lang.code === code)?.speechLang || "en-US";
