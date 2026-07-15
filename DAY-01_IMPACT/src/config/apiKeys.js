/*
 * =============================================================================
 * CENTRALIZED API KEYS CONFIGURATION
 * =============================================================================
 *
 * FEATURES & API KEYS:
 *
 * 1. GROQ AI
 *    - Used for: AI Chat responses (Detect / Sentence Builder)
 *    - Model: llama3-8b-8192 (or other Groq models)
 *    - Key: REACT_APP_GROQ_API_KEY
 *    - Console: https://console.groq.com/keys
 *
 * 2. GROQ TRANSLATION
 *    - Used for: Speech-to-Text translation
 *    - Keys: REACT_APP_GROQ_TRANSLATION_KEY_1 / _2
 *
 * Sign practice verification uses local MediaPipe + TensorFlow.js models
 * under public/models/ (no cloud API key required).
 * =============================================================================
 */

// Groq AI Configuration
export const GROQ_CONFIG = {
  API_KEY: process.env.REACT_APP_GROQ_API_KEY,
  MODEL: 'llama3-8b-8192',
  BASE_URL: 'https://api.groq.com/openai/v1'
};

// Groq Translation Configuration (Speech-to-Text)
export const GROQ_TRANSLATION_CONFIG = {
  API_KEY_1: process.env.REACT_APP_GROQ_TRANSLATION_KEY_1,
  API_KEY_2: process.env.REACT_APP_GROQ_TRANSLATION_KEY_2,
  MODEL: 'llama-3.1-8b-instant',
  BASE_URL: 'https://api.groq.com/openai/v1'
};

export const checkApiKeys = () => {
  console.log('=== API Keys Status ===');
  console.log('Groq API Key:', !!GROQ_CONFIG.API_KEY ? '✅ Available' : '❌ Missing');
  console.log('Groq Translation Key 1:', !!GROQ_TRANSLATION_CONFIG.API_KEY_1 ? '✅ Available' : '❌ Missing');
  console.log('Groq Translation Key 2:', !!GROQ_TRANSLATION_CONFIG.API_KEY_2 ? '✅ Available' : '❌ Missing');
  console.log('======================');
};

export const API_CONFIGS = {
  GROQ: GROQ_CONFIG,
  GROQ_TRANSLATION: GROQ_TRANSLATION_CONFIG,
};
