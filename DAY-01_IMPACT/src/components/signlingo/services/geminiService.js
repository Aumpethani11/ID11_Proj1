import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY });

export async function verifySign(base64Image, targetSign) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: `Analyze this image of a person attempting to sign '${targetSign}' in American Sign Language (ASL). 
            Determine if the sign is correct. 
            Provide a short, encouraging feedback message.
            Respond strictly in JSON format.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            correct: {
              type: "BOOLEAN",
              description: 'Whether the sign is correct.',
            },
            feedback: {
              type: "STRING",
              description: 'A short explanation or encouragement.',
            },
          },
          required: ['correct', 'feedback'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return {
      correct: result.correct ?? false,
      feedback: result.feedback ?? "I couldn't quite see that. Try again!"
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { correct: false, feedback: "Error connecting to AI. Please try again." };
  }
}
