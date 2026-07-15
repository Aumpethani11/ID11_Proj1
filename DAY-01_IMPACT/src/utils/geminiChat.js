import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config/geminiConfig";

// Debug: Check if API key is available
console.log('Gemini API Key available:', !!GEMINI_API_KEY);
console.log('API Key length:', GEMINI_API_KEY?.length || 0);

if (!GEMINI_API_KEY) {
  console.error('Gemini API key is missing! Check your .env file and configuration.');
}

// Use the same initialization pattern as the working translation utility
const apiKey = GEMINI_API_KEY;

if (!apiKey) {
  console.error("Gemini API key is missing. Check geminiConfig.js");
}

// Create model ONLY if key exists - USE THE CORRECT MODEL NAME
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }) : null;

export const getAIResponse = async (inputText, retryCount = 0) => {
  if (!inputText) return "Please sign something first.";

  // Check if API key is available
  if (!apiKey || !model) {
    console.error('Gemini API not properly configured');
    return "AI service not configured. Please check your API key configuration.";
  }

  try {
    console.log('Sending to AI:', inputText);
    
    // Simpler context prompting for better results with Sign Language grammar
    const prompt = `You are an intelligent assistant for a Deaf user. The user input is converted from Sign Language to Text, so it may lack prepositions or have unique grammar (e.g., "BANK WHERE?" instead of "Where is the bank?").

User's Question: "${inputText}"

Provide a concise, helpful, and direct answer.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text()?.trim();
    
    console.log('AI Response received:', responseText);
    return responseText;
  } catch (error) {
    console.error("AI Chat Error:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      name: error.name
    });
    
    // Retry logic for network errors
    if (retryCount < 2 && (error.message.includes('fetch') || error.message.includes('network') || error.name === 'AbortError')) {
      console.log(`Retrying AI request... Attempt ${retryCount + 1}/2`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
      return getAIResponse(inputText, retryCount + 1);
    }
    
    // Handle specific quota exceeded error
    if (error.status === 429 || error.message.includes('quota')) {
      return "API quota exceeded. Please try again later or upgrade your plan. Free tier has limited requests per day.";
    }
    
    // Handle API key errors
    if (error.message.includes('API key') || error.status === 400 || error.status === 401) {
      return "Invalid API key. Please check your Gemini API configuration.";
    }
    
    // Handle network errors
    if (error.message.includes('fetch') || error.message.includes('network') || error.name === 'AbortError') {
      return "Network error. Please check your internet connection and try again. The AI service may be temporarily unavailable.";
    }
    
    // Handle CORS issues
    if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
      return "CORS error. The AI service may be blocked by your browser or network.";
    }
    
    return `AI service error: ${error.message || 'Unknown error occurred'}`;
  }
};
