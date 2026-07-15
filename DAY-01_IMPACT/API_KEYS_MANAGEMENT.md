# API Keys Management Guide

## Overview

Cloud AI features use Groq. Sign practice verification runs fully offline with local MediaPipe + TensorFlow.js models (no API key).

## File Structure

```
src/config/
└── apiKeys.js                 # Centralized Groq configuration

src/utils/
├── groqChat.js                # Detect / Sentence Builder AI chat
└── groqTranslation.js         # Speech-to-Text translation

src/services/
└── signModelService.js        # Local ASL sign verification (offline)

public/models/
├── hand_landmarker.task
├── mediapipe/wasm/            # MediaPipe Vision WASM (offline)
└── sign_classifier/           # TF.js sign classifier

.env                           # Environment variables
```

## Current API Keys

### 1. GROQ AI (Detect AI Chat)
- **Purpose**: AI chat for signed sentences
- **Model**: `llama3-8b-8192`
- **Console**: https://console.groq.com/keys
- **Env Variable**: `REACT_APP_GROQ_API_KEY`

### 2. GROQ TRANSLATION (Speech-to-Text)
- **Purpose**: Real-time translation for Speech-to-Text
- **Model**: `llama-3.1-8b-instant`
- **Env Variables**:
  - `REACT_APP_GROQ_TRANSLATION_KEY_1`
  - `REACT_APP_GROQ_TRANSLATION_KEY_2`

### 3. Local Sign Models (SignLingo Practice)
- **Purpose**: Verify ASL signs in practice mode
- **Stack**: MediaPipe Hand Landmarker + TF.js classifier
- **API Key**: none (offline)

## Quick Setup

### Step 1: Update `.env`
```bash
REACT_APP_GROQ_API_KEY=your_groq_chat_key_here
REACT_APP_GROQ_TRANSLATION_KEY_1=your_groq_translation_key_1_here
REACT_APP_GROQ_TRANSLATION_KEY_2=your_groq_translation_key_2_here
```

### Step 2: Restart the app
```bash
npm start
```

### Step 3: Check console
```
=== API Keys Status ===
Groq API Key: ✅ Available
Groq Translation Key 1: ✅ Available
Groq Translation Key 2: ✅ Available
======================
```

## When Keys Reach Limits

1. Go to https://console.groq.com/keys
2. Generate a new key
3. Update the matching `REACT_APP_GROQ_*` value in `.env`
4. Restart the app
