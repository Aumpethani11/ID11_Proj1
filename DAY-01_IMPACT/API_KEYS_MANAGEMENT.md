# 🗝️ API Keys Management Guide

## 📋 Overview

This project uses a centralized API key management system to make it easy to update and maintain API keys when they reach their limits.

## 📁 File Structure

```
src/config/
├── apiKeys.js          # 🎯 MAIN: Centralized API configuration
└── geminiConfig.js     # 🔄 LEGACY: Backward compatibility

src/utils/
├── groqChat.js         # 🚀 NEW: Groq AI chat utility
├── geminiChat.js       # 🔄 OLD: Gemini AI chat utility
└── geminiTranslation.js # 🔄 OLD: Gemini translation utility

.env                    # 🔐 Environment variables
```

## 🔑 Current API Keys

### 1. GROQ AI TRANSLATION (Speech-to-Text)
- **Purpose**: Translation for Speech-to-Text functionality
- **Model**: `llama-3.1-8b-instant` (fast translation)
- **Console**: https://console.groq.com/keys
- **Rate Limits**: Dedicated keys for translation only
- **Response Time**: Sub-second translation
- **Env Variables**: 
  - `REACT_APP_GROQ_TRANSLATION_KEY_1`
  - `REACT_APP_GROQ_TRANSLATION_KEY_2`

### 2. GROQ AI (Primary - Fast & High Limits)
- **Purpose**: AI Chat responses
- **Model**: `mixtral-8x7b-32768`
- **Console**: https://console.groq.com/keys
- **Rate Limits**: Very generous free tier
- **Response Time**: Sub-second for most queries
- **Env Variable**: `REACT_APP_GROQ_API_KEY`

### 3. GEMINI AI (Backup - Google)
- **Purpose**: AI Chat & Translation (backup)
- **Model**: `gemini-2.5-flash`
- **Console**: https://aistudio.google.com/app/apikey
- **Rate Limits**: Limited free tier
- **Response Time**: 2-5 seconds
- **Env Variable**: `REACT_APP_GEMINI_API_KEY`

## 🚀 Quick Setup

### Step 1: Update .env file
```bash
REACT_APP_GEMINI_API_KEY=your_gemini_key_here
REACT_APP_GROQ_API_KEY=your_groq_chat_key_here
REACT_APP_GROQ_TRANSLATION_KEY_1=your_groq_translation_key_1_here
REACT_APP_GROQ_TRANSLATION_KEY_2=your_groq_translation_key_2_here
```

### Step 2: Restart the app
```bash
npm start
```

### Step 3: Check console for API status
Look for:
```
=== API Keys Status ===
Gemini API Key: ✅ Available
Groq API Key: ✅ Available
======================
```

## 🔄 How to Switch Between APIs

### Option 1: Change in Detect.jsx
```javascript
// For Groq (Recommended - Fast)
import { getGroqResponse } from "../../utils/groqChat";
const response = await getGroqResponse(currentSentence);

// For Gemini (Backup)
import { getAIResponse } from "../../utils/geminiChat";
const response = await getAIResponse(currentSentence);
```

### Option 2: Change in apiKeys.js
```javascript
// Update the model or API key configuration
export const GROQ_CONFIG = {
  API_KEY: process.env.REACT_APP_GROQ_API_KEY,
  MODEL: 'llama3-70b-8192', // Change model here
  BASE_URL: 'https://api.groq.com/openai/v1'
};
```

## ⚠️ When API Keys Reach Limits

### Groq API (Primary)
1. Go to: https://console.groq.com/keys
2. Generate a new key
3. Update `REACT_APP_GROQ_API_KEY` in `.env`
4. Restart the app

### Gemini API (Backup)
1. Go to: https://aistudio.google.com/app/apikey
2. Create a new key
3. Update `REACT_APP_GEMINI_API_KEY` in `.env`
4. Restart the app

## 🎯 Features by API

| Feature | Groq AI | Gemini AI |
|---------|---------|-----------|
| Chat | ✅ Primary | ✅ Backup |
| Translation | ❌ | ✅ |
| Speed | 🚀 Fast | 🐢 Slow |
| Rate Limits | 🎉 High | ⚠️ Limited |
| Cost | 💰 Free tier generous | 💰 Limited free tier |

## 🔧 Available Groq Models

```javascript
// Most Capable
'llama3-70b-8192'

// Fast & Efficient (Current)
'mixtral-8x7b-32768'

// Fastest
'llama3-8b-8192'
```

## 🧪 Testing API Connections

The app automatically tests API connections on startup. You can also test manually:

```javascript
import { testGroqConnection } from '../../utils/groqChat';
await testGroqConnection();
```

## 📊 Monitoring

Check the browser console for:
- API key availability status
- Connection test results
- Error messages and rate limit warnings

## 🛡️ Security

- API keys are stored in environment variables (`.env`)
- Never commit `.env` to version control
- Keys are not exposed in the frontend build
- Use HTTPS in production

## 🚨 Troubleshooting

### "API quota exceeded"
- Generate new API key from respective console
- Update `.env` file
- Restart application

### "Invalid API key"
- Check key is correctly copied
- Ensure no extra spaces or characters
- Verify key is active in console

### "Network error"
- Check internet connection
- Verify API service is operational
- Check for CORS issues (use HTTPS in production)

## 📝 Future API Integrations

The centralized system is ready for future APIs:

```javascript
// OpenAI (placeholder)
export const OPENAI_CONFIG = {
  API_KEY: process.env.REACT_APP_OPENAI_API_KEY,
  MODEL: 'gpt-4',
  BASE_URL: 'https://api.openai.com/v1'
};

// Anthropic (placeholder)
export const ANTHROPIC_CONFIG = {
  API_KEY: process.env.REACT_APP_ANTHROPIC_API_KEY,
  MODEL: 'claude-3-sonnet-20240229',
  BASE_URL: 'https://api.anthropic.com/v1'
};
```

---

**🎉 Your AI chat is now powered by Groq for faster responses and higher rate limits!**
