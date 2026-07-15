import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config/geminiConfig";

// Simple test function
export const testGeminiConnection = async () => {
  console.log('=== Testing Gemini API Connection ===');
  console.log('API Key available:', !!GEMINI_API_KEY);
  console.log('API Key length:', GEMINI_API_KEY?.length || 0);
  
  if (!GEMINI_API_KEY) {
    console.error('❌ API Key is missing!');
    return false;
  }
  
  try {
    console.log('🔑 Initializing Gemini AI...');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    console.log('📡 Sending test request...');
    const result = await model.generateContent("Hello, can you respond with just 'API working'?");
    const response = result.response.text()?.trim();
    
    console.log('✅ Response received:', response);
    return true;
  } catch (error) {
    console.error('❌ API Test Failed:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      name: error.name
    });
    return false;
  }
};

// Auto-run test if this file is imported
if (typeof window !== 'undefined') {
  testGeminiConnection();
}
