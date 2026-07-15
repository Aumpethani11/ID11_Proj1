import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

if (!apiKey) {
  console.error("Gemini API key is missing. Set REACT_APP_GEMINI_API_KEY in .env");
}

// Create model ONLY if key exists - USE THE CORRECT MODEL NAME
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }) : null;

export const translateText = async (text, sourceLanguage, targetLanguage) => {
  if (!apiKey || !model) {
    throw new Error(
      'Gemini API key is not configured. Please set it in geminiConfig.js.'
    );
  }

  if (!text.trim()) {
    throw new Error('No text to translate');
  }

  const languageMap = {
    en: 'English',
    hi: 'Hindi',
    bn: 'Bengali',
    ta: 'Tamil',
    te: 'Telugu',
    mr: 'Marathi',
    gu: 'Gujarati',
    kn: 'Kannada',
    ml: 'Malayalam',
    pa: 'Punjabi',
    ur: 'Urdu',
  };

  const sourceLangName = languageMap[sourceLanguage] || sourceLanguage;
  const targetLangName = languageMap[targetLanguage] || targetLanguage;

  const prompt = `Translate the following text from ${sourceLangName} to ${targetLangName}.
Preserve the original tone and context, including Indian language variations like Hinglish, Gujlish, etc.
Return ONLY the translated text.

Text: ${text}`;

  try {
    const result = await model.generateContent(prompt);
    const translatedText = result.response.text()?.trim();

    if (!translatedText) {
      throw new Error('Empty translation response');
    }

    return translatedText;
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Handle specific quota exceeded error
    if (error.status === 429 || error.message.includes('quota')) {
      throw new Error('API quota exceeded. Please try again later or upgrade your plan. Free tier has limited requests per day.');
    }
    
    // Handle other API errors
    throw new Error(`Translation failed: ${error.message || 'Unknown error'}`);
  }
};
