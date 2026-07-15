/*
 * =============================================================================
 * GROQ AI CHAT UTILITY (OFFICIAL SDK)
 * =============================================================================
 * 
 * This utility provides AI chat functionality using Groq's official SDK.
 * Groq offers much faster response times and higher rate limits compared to Gemini.
 * 
 * Features:
 * - Fast response times (sub-second for many queries)
 * - High rate limits (more requests per minute)
 * - Multiple model options (Llama 3.3, 3.1, Mixtral, etc.)
 * - Better for real-time chat applications
 * - Official SDK support
 * 
 * =============================================================================
 */

import Groq from "groq-sdk";

// Initialize Groq client with browser support
const groq = new Groq({ 
  apiKey: process.env.REACT_APP_GROQ_API_KEY, 
  dangerouslyAllowBrowser: true 
});

// Debug: Check if Groq API key is available
console.log('Groq API Key available:', !!process.env.REACT_APP_GROQ_API_KEY);
console.log('Groq API Key length:', process.env.REACT_APP_GROQ_API_KEY?.length || 0);

if (!process.env.REACT_APP_GROQ_API_KEY) {
  console.error('Groq API key is missing! Check your .env file and apiKeys.js configuration.');
}

export const getGroqResponse = async (inputText, retryCount = 0) => {
  if (!inputText) return "Please sign something first.";

  // Check if API key is available
  if (!process.env.REACT_APP_GROQ_API_KEY) {
    console.error('Groq API not properly configured');
    return "AI service not configured. Please check your Groq API key configuration.";
  }

  try {
    console.log('Sending to Groq AI:', inputText);
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an intelligent assistant for a Deaf user. The user input is converted from Sign Language to Text, so it may lack prepositions or have unique grammar. Be helpful, concise, and understanding."
        },
        {
          role: "user",
          content: `You are an intelligent assistant for a Deaf user. The user input is converted from Sign Language to Text, so it may lack prepositions or have unique grammar (e.g., "BANK WHERE?" instead of "Where is the bank?").

User's Question: "${inputText}"

Provide a concise, helpful, and direct answer. Be friendly and understanding of the communication method.`
        }
      ],
      // Use the latest stable model
      model: "llama-3.3-70b-versatile",
      
      temperature: 0.5,
      max_tokens: 1024,
      top_p: 1,
    });

    const responseText = chatCompletion.choices[0]?.message?.content?.trim();
    
    if (!responseText) {
      throw new Error('Empty response from Groq API');
    }
    
    console.log('Groq AI Response received:', responseText);
    return responseText;
    
  } catch (error) {
    console.error("Groq AI Chat Error:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      name: error.name
    });
    
    // Retry logic with different model
    if (retryCount < 2) {
      console.log(`Retrying with different model... Attempt ${retryCount + 1}/2`);
      try {
        const fallbackModels = ["llama-3.1-8b-instant", "mixtral-8x7b-32768"];
        const fallbackModel = fallbackModels[retryCount];
        
        const fallbackCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are an intelligent assistant for a Deaf user. The user input is converted from Sign Language to Text, so it may lack prepositions or have unique grammar. Be helpful, concise, and understanding."
            },
            {
              role: "user",
              content: inputText
            }
          ],
          model: fallbackModel,
          temperature: 0.5,
          max_tokens: 1024,
          top_p: 1,
        });
        
        const fallbackResponse = fallbackCompletion.choices[0]?.message?.content?.trim();
        if (fallbackResponse) {
          console.log(`Fallback model ${fallbackModel} response:`, fallbackResponse);
          return fallbackResponse;
        }
      } catch (fallbackError) {
        console.error(`Fallback model ${retryCount + 1} also failed:`, fallbackError);
      }
    }
    
    // If all Groq attempts fail, try Gemini as fallback
    if (process.env.REACT_APP_GEMINI_API_KEY) {
      console.log('All Groq attempts failed, trying Gemini as fallback...');
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        const geminiPrompt = `You are an intelligent assistant for a Deaf user. The user input is converted from Sign Language to Text, so it may lack prepositions or have unique grammar.

User's Question: "${inputText}"

Provide a concise, helpful, and direct answer.`;
        
        const result = await model.generateContent(geminiPrompt);
        const responseText = result.response.text()?.trim();
        
        if (responseText) {
          console.log('Gemini fallback response received:', responseText);
          return responseText;
        }
      } catch (geminiError) {
        console.error('Gemini fallback also failed:', geminiError);
      }
    }
    
    // Handle specific errors
    if (error.message.includes('quota') || error.message.includes('rate limit')) {
      return "API quota exceeded. Please try again later or upgrade your plan. Groq has generous free tier limits.";
    }
    
    if (error.message.includes('API key') || error.message.includes('unauthorized')) {
      return "Invalid API key. Please check your Groq API configuration.";
    }
    
    if (error.message.includes('model') || error.status === 404) {
      return "AI model not available. Please check the model configuration or try again later.";
    }
    
    return `Groq AI service error: ${error.message || 'Unknown error occurred'}`;
  }
};

// Test function for Groq API
export const testGroqConnection = async () => {
  console.log('=== Testing Groq API Connection ===');
  console.log('API Key available:', !!process.env.REACT_APP_GROQ_API_KEY);
  console.log('API Key length:', process.env.REACT_APP_GROQ_API_KEY?.length || 0);
  
  if (!process.env.REACT_APP_GROQ_API_KEY) {
    console.error('❌ Groq API Key is missing!');
    return false;
  }
  
  try {
    console.log('🔑 Initializing Groq AI...');
    
    const testResponse = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Hello, can you respond with just 'Groq API working'?"
        }
      ],
      model: "llama-3.1-8b-instant", // Use fast model for testing
      max_tokens: 20
    });
    
    const response = testResponse.choices[0]?.message?.content?.trim();
    
    console.log('✅ Groq Response received:', response);
    return true;
  } catch (error) {
    console.error('❌ Groq API Test Failed:', error);
    return false;
  }
};
