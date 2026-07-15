/*
 * =============================================================================
 * GROQ AI TRANSLATION UTILITY (SPEECH-TO-TEXT)
 * =============================================================================
 * 
 * This utility provides translation functionality using Groq's API specifically
 * for Speech-to-Text translation purposes. It uses dedicated API keys to avoid
 * quota conflicts with the main AI chat functionality.
 * 
 * Features:
 * - Fast translation responses
 * - Dedicated API keys for translation only
 * - Automatic key rotation for high volume
 * - Optimized for translation tasks
 * - Fallback between multiple translation keys
 * 
 * =============================================================================
 */

import Groq from "groq-sdk";
import { GROQ_TRANSLATION_CONFIG } from '../config/apiKeys';

// Initialize Groq clients for translation with multiple keys
const translationClients = [
  GROQ_TRANSLATION_CONFIG.API_KEY_1 ? new Groq({ 
    apiKey: GROQ_TRANSLATION_CONFIG.API_KEY_1, 
    dangerouslyAllowBrowser: true 
  }) : null,
  GROQ_TRANSLATION_CONFIG.API_KEY_2 ? new Groq({ 
    apiKey: GROQ_TRANSLATION_CONFIG.API_KEY_2, 
    dangerouslyAllowBrowser: true 
  }) : null
].filter(client => client !== null); // Remove null clients

// Debug: Check if translation API keys are available
console.log('Groq Translation Keys Status:');
console.log('Key 1 available:', !!GROQ_TRANSLATION_CONFIG.API_KEY_1);
console.log('Key 2 available:', !!GROQ_TRANSLATION_CONFIG.API_KEY_2);
console.log('Total available clients:', translationClients.length);

if (translationClients.length === 0) {
  console.error('No Groq translation API keys available! Check your .env file and apiKeys.js configuration.');
}

// Current client index for rotation
let currentClientIndex = 0;

// Get next available client for load balancing
const getNextTranslationClient = () => {
  if (translationClients.length === 0) return null;
  const client = translationClients[currentClientIndex];
  currentClientIndex = (currentClientIndex + 1) % translationClients.length;
  return client;
};

export const translateTextWithGroq = async (text, sourceLanguage, targetLanguage, retryCount = 0) => {
  if (!text || text.trim() === "") return "";
  
  // Check if we have translation clients available
  if (translationClients.length === 0) {
    console.error('Groq Translation not properly configured');
    return "Translation service not configured. Please check your translation API keys.";
  }

  const client = getNextTranslationClient();
  if (!client) {
    console.error('No translation client available');
    return "Translation service temporarily unavailable.";
  }

  try {
    console.log(`Translating with Groq (Client ${currentClientIndex}):`, text);
    console.log(`From ${sourceLanguage} to ${targetLanguage}`);
    
    const translationPrompt = `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}.

Text to translate: "${text}"

Provide only the translated text without any additional explanation or formatting. Keep the translation natural and accurate.`;

    const chatCompletion = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional translator. Provide accurate, natural translations. Only return the translated text without explanations."
        },
        {
          role: "user",
          content: translationPrompt
        }
      ],
      model: GROQ_TRANSLATION_CONFIG.MODEL,
      temperature: 0.3, // Lower temperature for more consistent translations
      max_tokens: 500,
      top_p: 1,
    });

    const translatedText = chatCompletion.choices[0]?.message?.content?.trim();
    
    if (!translatedText) {
      throw new Error('Empty translation response from Groq API');
    }
    
    console.log('Groq Translation received:', translatedText);
    return translatedText;
    
  } catch (error) {
    console.error("Groq Translation Error:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      name: error.name
    });
    
    // Retry logic with different client
    if (retryCount < translationClients.length) {
      console.log(`Retrying with different translation client... Attempt ${retryCount + 1}/${translationClients.length}`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
      return translateTextWithGroq(text, sourceLanguage, targetLanguage, retryCount + 1);
    }
    
    // Handle specific errors
    if (error.message.includes('quota') || error.message.includes('rate limit')) {
      return "Translation quota exceeded. Please try again later or upgrade your plan.";
    }
    
    if (error.message.includes('API key') || error.message.includes('unauthorized')) {
      return "Invalid translation API key. Please check your Groq translation configuration.";
    }
    
    if (error.message.includes('model') || error.status === 404) {
      return "Translation model not available. Please check the model configuration.";
    }
    
    // Fallback to original text if all attempts fail
    console.warn('All translation attempts failed, returning original text');
    return text;
  }
};

// Test function for Groq Translation API
export const testGroqTranslationConnection = async () => {
  console.log('=== Testing Groq Translation API Connection ===');
  console.log('Available translation clients:', translationClients.length);
  
  if (translationClients.length === 0) {
    console.error('❌ No Groq Translation API Keys available!');
    return false;
  }
  
  try {
    console.log('🔑 Testing Groq Translation AI...');
    
    const testClient = translationClients[0];
    const testResponse = await testClient.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Translate 'Hello' to Spanish. Only return the translated word."
        }
      ],
      model: GROQ_TRANSLATION_CONFIG.MODEL,
      max_tokens: 10
    });
    
    const response = testResponse.choices[0]?.message?.content?.trim();
    
    console.log('✅ Groq Translation Response received:', response);
    return response.toLowerCase().includes('hola') || response.length > 0;
  } catch (error) {
    console.error('❌ Groq Translation API Test Failed:', error);
    return false;
  }
};

// Get translation status
export const getTranslationStatus = () => {
  return {
    availableClients: translationClients.length,
    currentClientIndex: currentClientIndex,
    keysAvailable: {
      key1: !!GROQ_TRANSLATION_CONFIG.API_KEY_1,
      key2: !!GROQ_TRANSLATION_CONFIG.API_KEY_2
    }
  };
};
