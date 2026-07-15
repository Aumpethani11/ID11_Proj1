/*
 * =============================================================================
 * CENTRALIZED API KEYS CONFIGURATION
 * =============================================================================
 * 
 * This file contains all API keys used throughout the project.
 * When any API key reaches its limit, simply replace the corresponding key below.
 * 
 * FEATURES & API KEYS:
 * 
 * 1. GEMINI AI (Google Generative AI)
 *    - Used for: AI Chat responses and Text Translation
 *    - Model: gemini-2.5-flash
 *    - Key: REACT_APP_GEMINI_API_KEY
 *    - Console: https://aistudio.google.com/app/apikey
 * 
 * 2. GROQ AI
 *    - Used for: AI Chat responses (alternative to Gemini)
 *    - Model: mixtral-8x7b-32768 (or other Groq models)
 *    - Key: REACT_APP_GROQ_API_KEY
 *    - Console: https://console.groq.com/keys
 * 
 * 3. FUTURE APIS (placeholders for future integrations)
 *    - OpenAI: REACT_APP_OPENAI_API_KEY
 *    - Anthropic: REACT_APP_ANTHROPIC_API_KEY
 *    - Azure Speech: REACT_APP_AZURE_SPEECH_KEY
 * 
 * =============================================================================
 */

// Gemini AI Configuration (Google Generative AI)
export const GEMINI_CONFIG = {
  API_KEY: process.env.REACT_APP_GEMINI_API_KEY,
  MODEL: 'gemini-2.5-flash',
  BASE_URL: 'https://generativelanguage.googleapis.com'
};

// Groq AI Configuration
export const GROQ_CONFIG = {
  API_KEY: process.env.REACT_APP_GROQ_API_KEY,
  MODEL: 'llama3-8b-8192', // Reliable and widely available model
  BASE_URL: 'https://api.groq.com/openai/v1'
};

// Groq Translation Configuration (Speech-to-Text)
export const GROQ_TRANSLATION_CONFIG = {
  API_KEY_1: process.env.REACT_APP_GROQ_TRANSLATION_KEY_1,
  API_KEY_2: process.env.REACT_APP_GROQ_TRANSLATION_KEY_2,
  MODEL: 'llama-3.1-8b-instant', // Fast model for translation
  BASE_URL: 'https://api.groq.com/openai/v1'
};

// Alternative Groq Models (uncomment to use different models)
// export const GROQ_CONFIG = {
//   API_KEY: process.env.REACT_APP_GROQ_API_KEY,
//   MODEL: 'llama3-70b-8192', // Most capable model
//   BASE_URL: 'https://api.groq.com/openai/v1'
// };

// export const GROQ_CONFIG = {
//   API_KEY: process.env.REACT_APP_GROQ_API_KEY,
//   MODEL: 'llama3-8b-8192', // Fast and efficient
//   BASE_URL: 'https://api.groq.com/openai/v1'
// };

// Helper function to check if API keys are available
export const checkApiKeys = () => {
  console.log('=== API Keys Status ===');
  console.log('Gemini API Key:', !!GEMINI_CONFIG.API_KEY ? '✅ Available' : '❌ Missing');
  console.log('Groq API Key:', !!GROQ_CONFIG.API_KEY ? '✅ Available' : '❌ Missing');
  console.log('======================');
};

// Export all configurations for easy access
export const API_CONFIGS = {
  GEMINI: GEMINI_CONFIG,
  GROQ: GROQ_CONFIG
};
