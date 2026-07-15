import React, { useState, useEffect, useRef, useCallback } from 'react';
import { translateTextWithGroq, testGroqTranslationConnection } from '../../utils/groqTranslation';
import './SpeechToText.css';

const indianLanguages = [
  { code: 'en-US', name: 'English (US)', display: 'English', translateCode: 'en' },
  { code: 'en-IN', name: 'English (India)', display: 'English (India)', translateCode: 'en' },
  { code: 'hi-IN', name: 'Hindi (India)', display: 'हिन्दी', translateCode: 'hi' },
  { code: 'bn-IN', name: 'Bengali (India)', display: 'বাংলা', translateCode: 'bn' },
  { code: 'ta-IN', name: 'Tamil (India)', display: 'தமிழ்', translateCode: 'ta' },
  { code: 'te-IN', name: 'Telugu (India)', display: 'తెలుగు', translateCode: 'te' },
  { code: 'mr-IN', name: 'Marathi (India)', display: 'मराठी', translateCode: 'mr' },
  { code: 'gu-IN', name: 'Gujarati (India)', display: 'ગુજરાતી', translateCode: 'gu' },
  { code: 'kn-IN', name: 'Kannada (India)', display: 'ಕನ್ನಡ', translateCode: 'kn' },
  { code: 'ml-IN', name: 'Malayalam (India)', display: 'മലയാളം', translateCode: 'ml' },
  { code: 'pa-IN', name: 'Punjabi (India)', display: 'ਪੰਜਾਬੀ', translateCode: 'pa' },
  { code: 'ur-IN', name: 'Urdu (India)', display: 'اردو', translateCode: 'ur' },
];

const SpeechToText = () => {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [supported, setSupported] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('hi-IN');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState('');
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechVolume, setSpeechVolume] = useState(1);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [speechHistory, setSpeechHistory] = useState([]);
  const recognitionRef = useRef(null);
  const autoTranslateRef = useRef(autoTranslate);
  const translateTextHandlerRef = useRef(null);

  useEffect(() => {
    autoTranslateRef.current = autoTranslate;
  }, [autoTranslate]);

  const addToHistory = useCallback((originalText, translatedTextValue, originalLang, targetLang) => {
    const newEntry = {
      id: Date.now(),
      originalText,
      translatedText: translatedTextValue,
      originalLang,
      targetLang,
      timestamp: new Date().toLocaleString()
    };

    setSpeechHistory(prev => [newEntry, ...prev]);
  }, []);

  const translateTextHandler = useCallback(async (text) => {
    if (!text.trim()) {
      setTranslationError('No text to translate');
      return;
    }

    const sourceLang = indianLanguages.find(l => l.code === selectedLanguage)?.translateCode || 'en';
    const targetLang = indianLanguages.find(l => l.code === targetLanguage)?.translateCode || 'hi';

    if (sourceLang === targetLang) {
      setTranslationError('Source and target languages are the same');
      return;
    }

    setIsTranslating(true);
    setTranslationError('');

    try {
      const translated = await translateTextWithGroq(text, sourceLang, targetLang);
      setTranslatedText(translated);

      if (translated.trim()) {
        addToHistory(text, translated, selectedLanguage, targetLanguage);
      }
    } catch (err) {
      console.error('Translation error:', err);
      setTranslationError(err.message || 'Translation service unavailable. Please check your internet connection.');
    } finally {
      setIsTranslating(false);
    }
  }, [selectedLanguage, targetLanguage, addToHistory]);

  useEffect(() => {
    translateTextHandlerRef.current = translateTextHandler;
  }, [translateTextHandler]);

  const verifyLanguageSupport = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    console.log('=== Language Support Verification ===');

    indianLanguages.forEach(lang => {
      const targetLangCode = lang.code;
      const langPrefix = targetLangCode.split('-')[0];

      const exactMatches = voices.filter(voice => voice.lang === targetLangCode);
      const prefixMatches = voices.filter(voice => voice.lang.startsWith(langPrefix));

      console.log(`${lang.name} (${lang.code}):`);
      console.log(`  Exact matches: ${exactMatches.length}`);
      exactMatches.forEach(voice => console.log(`    - ${voice.name} (${voice.lang})`));
      console.log(`  Prefix matches: ${prefixMatches.length}`);
      prefixMatches.forEach(voice => console.log(`    - ${voice.name} (${voice.lang})`));
      console.log('');
    });

    console.log('=====================================');
  }, []);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage;

      recognition.onstart = () => {
        setIsListening(true);
        setError('');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let liveInterimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const resultText = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += resultText + ' ';
          } else {
            liveInterimTranscript += resultText;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => {
            const newTranscript = prev + finalTranscript;
            if (autoTranslateRef.current && finalTranscript.trim()) {
              translateTextHandlerRef.current?.(newTranscript);
            }
            return newTranscript;
          });
          setInterimTranscript('');
        } else {
          setInterimTranscript(liveInterimTranscript);
        }
      };

      recognition.onerror = (event) => {
        // Aborted when stopping/restarting recognition — ignore
        if (event.error === 'aborted' || event.error === 'no-speech') {
          if (event.error === 'no-speech') {
            setError('No speech detected. Please try again.');
          }
          setIsListening(false);
          return;
        }

        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone access.');
        } else {
          setError('Speech recognition error. Please try again.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      setSupported(true);
    } else {
      setSupported(false);
      setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [selectedLanguage]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = selectedLanguage;
    }
  }, [selectedLanguage]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log('Voices loaded:', voices.length, 'voices available');
      console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
      setVoicesLoaded(true);
      setTimeout(() => verifyLanguageSupport(), 1000);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    testGroqTranslationConnection();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [verifyLanguageSupport]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      setInterimTranscript('');
      setError('');
      setTranslatedText('');
      setTranslationError('');
      recognitionRef.current.start();
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setError('');
    setTranslatedText('');
    setTranslationError('');
  };

  // Chrome/browsers fire these when cancel() stops prior speech — not real failures
  const isBenignSpeechError = (error) =>
    error === 'interrupted' || error === 'canceled' || error === 'cancelled';

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Text copied to clipboard!');
    });
  };

  const speakText = (text, lang = 'en-US') => {
    if (!text || !window.speechSynthesis) {
      console.error('Speech synthesis not supported');
      alert('Speech synthesis is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (!voicesLoaded) {
      console.warn('Voices not yet loaded, please try again in a moment');
      alert('Voice system is still loading. Please try again in a moment.');
      return;
    }

    // Stop any ongoing speech (triggers "interrupted" on the previous utterance)
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Enhanced language mapping with fallback options
    const speechLanguageMap = {
      'en-US': 'en-US',
      'en-IN': 'en-IN', 
      'hi-IN': 'hi-IN',
      'bn-IN': 'bn-IN',
      'ta-IN': 'ta-IN',
      'te-IN': 'te-IN',
      'mr-IN': 'mr-IN',
      'gu-IN': 'gu-IN',
      'kn-IN': 'kn-IN',
      'ml-IN': 'ml-IN',
      'pa-IN': 'pa-IN',
      'ur-IN': 'ur-IN'
    };
    
    // Set language for speech synthesis with fallback
    const targetLangCode = speechLanguageMap[lang] || 'en-US';
    utterance.lang = targetLangCode;
    
    // Set speech parameters for more natural speech
    utterance.rate = Math.max(0.8, Math.min(1.2, speechRate)); // Balanced rate for Indian languages
    utterance.volume = speechVolume;
    utterance.pitch = 1.0; // Natural pitch

    // Get available voices and find the best match
    const voices = window.speechSynthesis.getVoices();
    console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
    console.log('Target language code:', targetLangCode);
    
    // Enhanced voice selection with multiple fallback strategies
    let selectedVoice = null;
    
    // Strategy 1: Exact language match
    selectedVoice = voices.find(voice => voice.lang === targetLangCode);
    
    // Strategy 2: Language prefix match (e.g., 'hi' for 'hi-IN')
    if (!selectedVoice) {
      const langPrefix = targetLangCode.split('-')[0];
      selectedVoice = voices.find(voice => voice.lang.startsWith(langPrefix));
    }
    
    // Strategy 3: Language-specific voice name patterns
    if (!selectedVoice) {
      const targetLang = indianLanguages.find(l => l.code === lang)?.translateCode || 'en';
      console.log('Target language for voice selection:', targetLang);
      
      // Enhanced voice mapping with more flexible patterns for all languages
      const voicePatterns = {
        'hi': ['hindi', 'हिन्दी', 'ravi', 'heera', 'kalpana', 'google hindi', 'microsoft hindi'],
        'bn': ['bengali', 'বাংলা', 'banashree', 'bhasha', 'google bengali', 'microsoft bengali'],
        'ta': ['tamil', 'தமிழ்', 'valluvar', 'anu', 'google tamil', 'microsoft tamil'],
        'te': ['telugu', 'తెలుగు', 'chitra', 'rani', 'google telugu', 'microsoft telugu'],
        'mr': ['marathi', 'मराठी', 'leena', 'supriya', 'google marathi', 'microsoft marathi'],
        'gu': ['gujarati', 'ગુજરાતી', 'dipali', 'meera', 'google gujarati', 'microsoft gujarati'],
        'kn': ['kannada', 'ಕನ್ನಡ', 'shashi', 'deepa', 'google kannada', 'microsoft kannada'],
        'ml': ['malayalam', 'മലയാളം', 'meera', 'radhika', 'google malayalam', 'microsoft malayalam'],
        'pa': ['punjabi', 'ਪੰਜਾਬੀ', 'balwinder', 'gurpreet', 'google punjabi', 'microsoft punjabi'],
        'ur': ['urdu', 'اردو', 'khalid', 'fatima', 'google urdu', 'microsoft urdu'],
        'en': ['english', 'google', 'microsoft', 'samantha', 'karen', 'david', 'alex', 'siri']
      };
      
      const patterns = voicePatterns[targetLang] || voicePatterns['en'];
      selectedVoice = voices.find(voice => {
        const voiceName = voice.name.toLowerCase();
        return patterns.some(pattern => voiceName.includes(pattern));
      });
    }
    
    // Strategy 4: Any available voice (last resort)
    if (!selectedVoice && voices.length > 0) {
      console.warn('No specific voice found, using default voice');
      selectedVoice = voices[0]; // Use first available voice
    }
    
    // Set the selected voice if found
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('Selected voice:', selectedVoice.name, 'Language:', selectedVoice.lang);
    } else {
      console.warn('No voice available for language:', targetLangCode);
      alert(`No voice available for ${lang}. Please try a different language or check browser support.`);
      return;
    }

    // Event handlers for better user feedback
    utterance.onstart = () => {
      setIsSpeaking(true);
      console.log('Speech started for:', text.substring(0, 50) + '...');
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      console.log('Speech ended');
    };
    
    utterance.onerror = (event) => {
      setIsSpeaking(false);
      // Expected when stopping previous speech or starting a new one
      if (isBenignSpeechError(event.error)) {
        return;
      }
      console.error('Speech error:', event.error);
      alert(`Speech error: ${event.error}. Please try again.`);
    };

    // Brief delay after cancel() — Chrome often fires "interrupted" without this
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  const getAvailableVoicesForLanguage = () => {
    if (!voicesLoaded) return [];
    
    const voices = window.speechSynthesis.getVoices();
    const targetLangCode = targetLanguage.split('-')[0]; // Get language prefix
    
    // Enhanced voice filtering with multiple strategies
    const filteredVoices = voices.filter(voice => {
      // Strategy 1: Exact language match
      if (voice.lang === targetLanguage) return true;
      
      // Strategy 2: Language prefix match
      if (voice.lang.startsWith(targetLangCode)) return true;
      
      // Strategy 3: Voice name contains language indicators
      const voiceName = voice.name.toLowerCase();
      const targetLang = indianLanguages.find(l => l.code === targetLanguage)?.translateCode || 'en';
      
      const voicePatterns = {
        'hi': ['hindi', 'हिन्दी'],
        'bn': ['bengali', 'বাংলা'],
        'ta': ['tamil', 'தமிழ்'],
        'te': ['telugu', 'తెలుగు'],
        'mr': ['marathi', 'मराठी'],
        'gu': ['gujarati', 'ગુજરાતી'],
        'kn': ['kannada', 'ಕನ್ನಡ'],
        'ml': ['malayalam', 'മലയാളം'],
        'pa': ['punjabi', 'ਪੰਜਾਬੀ'],
        'ur': ['urdu', 'اردو'],
        'en': ['english']
      };
      
      const patterns = voicePatterns[targetLang] || [];
      return patterns.some(pattern => voiceName.includes(pattern));
    });
    
    // Sort voices: native voices first, then by quality
    return filteredVoices.sort((a, b) => {
      const aIsNative = a.name.includes('Google') || a.name.includes('Microsoft');
      const bIsNative = b.name.includes('Google') || b.name.includes('Microsoft');
      
      if (aIsNative && !bIsNative) return -1;
      if (!aIsNative && bIsNative) return 1;
      
      // Prefer exact language matches
      const aExact = a.lang === targetLanguage;
      const bExact = b.lang === targetLanguage;
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      return 0;
    });
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const downloadTranscript = () => {
    const content = `Original Transcript (${getCurrentLanguageDisplay()}):\n${transcript}\n\nTranslation (${getTargetLanguageDisplay()}):\n${translatedText}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speech-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Debug function to log available voices
  const debugVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    console.log('=== Available Voices Debug ===');
    console.log('Total voices:', voices.length);
    console.log('Target language:', targetLanguage);
    console.log('All voices:');
    voices.forEach((voice, index) => {
      console.log(`${index + 1}. ${voice.name} (${voice.lang}) - Local: ${voice.localService}`);
    });
    
    const availableVoices = getAvailableVoicesForLanguage();
    console.log('Filtered voices for', targetLanguage + ':', availableVoices.length);
    availableVoices.forEach((voice, index) => {
      console.log(`${index + 1}. ${voice.name} (${voice.lang})`);
    });
    console.log('============================');
  };

  const speakFromHistory = (text, language) => {
    if (!text || !window.speechSynthesis) {
      console.error('Speech synthesis not supported');
      return;
    }

    if (!voicesLoaded) {
      console.warn('Voices not yet loaded, please try again in a moment');
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language for speech synthesis
    utterance.lang = language;
    
    // Set speech parameters
    utterance.rate = Math.max(0.8, speechRate);
    utterance.volume = speechVolume;
    utterance.pitch = 1.0;

    // Get available voices and find the best match
    const voices = window.speechSynthesis.getVoices();
    console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
    console.log('Target language code:', language);
    
    // Enhanced voice selection with native voice prioritization
    let preferredVoice = null;
    
    // Strategy 1: Exact language match with native voice preference
    preferredVoice = voices.find(voice => {
      const isExactMatch = voice.lang === language;
      const isNativeVoice = voice.name.includes('Google') || voice.name.includes('Microsoft');
      return isExactMatch && isNativeVoice;
    });
    
    // Strategy 2: Language prefix match with native voice preference
    if (!preferredVoice) {
      const langPrefix = language.split('-')[0];
      preferredVoice = voices.find(voice => {
        const isPrefixMatch = voice.lang.startsWith(langPrefix);
        const isNativeVoice = voice.name.includes('Google') || voice.name.includes('Microsoft');
        return isPrefixMatch && isNativeVoice;
      });
    }
    
    // Strategy 3: Fallback to any voice with correct language prefix
    if (!preferredVoice) {
      const langPrefix = language.split('-')[0];
      preferredVoice = voices.find(voice => voice.lang.startsWith(langPrefix));
    }
    
    // Strategy 4: Fallback to any available voice
    if (!preferredVoice) {
      preferredVoice = voices[0];
      console.warn('No specific voice found, using default voice:', preferredVoice);
    }
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log('Using voice:', preferredVoice.name, 'Language:', preferredVoice.lang);
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      setIsSpeaking(false);
      if (isBenignSpeechError(event.error)) {
        return;
      }
      console.error('Speech synthesis error:', event);
    };

    // Add a small delay to ensure everything is ready
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const clearHistory = () => {
    setSpeechHistory([]);
  };

  const deleteHistoryItem = (id) => {
    setSpeechHistory(prev => prev.filter(item => item.id !== id));
  };

  const getCurrentLanguageDisplay = () => {
    const lang = indianLanguages.find(l => l.code === selectedLanguage);
    return lang ? lang.display : 'English';
  };

  const getTargetLanguageDisplay = () => {
    const lang = indianLanguages.find(l => l.code === targetLanguage);
    return lang ? lang.display : 'हिन्दी';
  };

  if (!supported) {
    return (
      <div className="speech-to-text-container">
        <div className="speech-header">
          <h1>Speech to Text for Deaf Users</h1>
          <p>Convert spoken words into text in real-time</p>
        </div>
        <div className="error-message">
          Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.
        </div>
      </div>
    );
  }

  return (
    <div className="speech-to-text-container">
      <div className="speech-header">
        <h1>Speech to Text & Translation</h1>
        <p>Convert spoken words into text and translate in real-time</p>
      </div>

      <div className="language-selector">
        <div className="language-input-group">
          <label htmlFor="language-select">Speech Language:</label>
          <select 
            id="language-select"
            value={selectedLanguage} 
            onChange={(e) => setSelectedLanguage(e.target.value)}
            disabled={isListening}
            className="language-dropdown"
          >
            {indianLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <div className="current-language">
            Current: <span className="language-badge">{getCurrentLanguageDisplay()}</span>
          </div>
        </div>

        <div className="language-input-group">
          <label htmlFor="target-language-select">Translate To:</label>
          <select 
            id="target-language-select"
            value={targetLanguage} 
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="language-dropdown"
          >
            {indianLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <div className="current-language">
            Target: <span className="language-badge">{getTargetLanguageDisplay()}</span>
          </div>
        </div>
      </div>

      <div className="auto-translate-toggle">
        <label>
          <input 
            type="checkbox" 
            checked={autoTranslate}
            onChange={(e) => setAutoTranslate(e.target.checked)}
          />
          <span>Auto-translate while speaking</span>
        </label>
      </div>

      <div className="speech-controls">
        <button 
          className={`mic-button ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
          disabled={!supported}
        >
          <span className="mic-icon">
            {isListening ? '🔴' : '🎤'}
          </span>
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </button>
        
        <button 
          className="clear-button"
          onClick={clearTranscript}
          disabled={!transcript}
        >
          Clear Text
        </button>

        <button 
          className="translate-button"
          onClick={() => translateTextHandler(transcript)}
          disabled={!transcript || isTranslating}
        >
          {isTranslating ? 'Translating...' : '🌐 Translate'}
        </button>

        {transcript && (
          <button className="copy-button" onClick={() => copyToClipboard(transcript)}>
            📋 Copy Original
          </button>
        )}

        {translatedText && (
          <button className="copy-button" onClick={() => copyToClipboard(translatedText)}>
            📋 Copy Translation
          </button>
        )}

        {isSpeaking && (
          <button className="stop-button" onClick={stopSpeaking}>
            🔇 Stop Speaking
          </button>
        )}

        {(transcript || translatedText) && (
          <button className="download-button" onClick={downloadTranscript}>
            📥 Download Transcript
          </button>
        )}
      </div>

      {/* Voice Selection */}
      {voicesLoaded && (
        <div className="voice-selector">
          <div className="setting-group">
            <label htmlFor="voice-select">Voice for {getTargetLanguageDisplay()}:</label>
            <select 
              id="voice-select"
              className="voice-dropdown"
              onChange={(e) => {
                const selectedVoice = window.speechSynthesis.getVoices()[e.target.value];
                if (selectedVoice && translatedText) {
                  const utterance = new SpeechSynthesisUtterance(translatedText);
                  utterance.voice = selectedVoice;
                  utterance.lang = targetLanguage;
                  utterance.rate = speechRate;
                  utterance.volume = speechVolume;
                  window.speechSynthesis.speak(utterance);
                }
              }}
            >
              <option value="">Test available voices...</option>
              {getAvailableVoicesForLanguage().map((voice, index) => (
                <option key={index} value={window.speechSynthesis.getVoices().indexOf(voice)}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
            <button 
              className="debug-voices-btn"
              onClick={debugVoices}
              title="Debug available voices (check console)"
              style={{ marginLeft: '10px', padding: '5px 10px', fontSize: '12px' }}
            >
              🐞 Debug Voices
            </button>
            <button 
              className="verify-languages-btn"
              onClick={verifyLanguageSupport}
              title="Verify language support (check console)"
              style={{ marginLeft: '5px', padding: '5px 10px', fontSize: '12px' }}
            >
              🌍 Verify Languages
            </button>
          </div>
        </div>
      )}

      {/* Speech Controls */}
      <div className="speech-settings">
        <div className="setting-group">
          <label htmlFor="speech-rate">Speech Rate: {speechRate.toFixed(1)}x</label>
          <input 
            id="speech-rate"
            type="range" 
            min="0.5" 
            max="2" 
            step="0.1" 
            value={speechRate}
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            className="speech-slider"
          />
        </div>
        
        <div className="setting-group">
          <label htmlFor="speech-volume">Volume: {Math.round(speechVolume * 100)}%</label>
          <input 
            id="speech-volume"
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={speechVolume}
            onChange={(e) => setSpeechVolume(parseFloat(e.target.value))}
            className="speech-slider"
          />
        </div>
      </div>

      {isListening && (
        <div className="listening-indicator">
          <span className="pulse-dot"></span>
          Listening... Speak now
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="transcript-container">
        <div className="transcript-header">
          <h3>Original Transcript ({getCurrentLanguageDisplay()})</h3>
          <div className="transcript-actions">
            {transcript && (
              <span className="word-count">
                {transcript.trim().split(/\s+/).length} words
              </span>
            )}
            {transcript && (
              <button 
                className="speaker-button" 
                onClick={() => speakText(transcript, selectedLanguage)}
                disabled={isSpeaking}
                title="Speak original text"
              >
                {isSpeaking ? '🔇' : '🔊'}
              </button>
            )}
          </div>
        </div>
        
        <div className="transcript-display">
          {transcript || interimTranscript ? (
            <>
              <div className="final-text">
                {transcript}
              </div>
              {interimTranscript && (
                <div className="interim-text">
                  {interimTranscript}
                </div>
              )}
            </>
          ) : (
            <div className="placeholder-text">
              Click "Start Listening" to begin speech recognition in {getCurrentLanguageDisplay()}...
            </div>
          )}
        </div>
      </div>

      {(translatedText || isTranslating || translationError) && (
        <div className="transcript-container translation-container">
          <div className="transcript-header">
            <h3>Translation ({getTargetLanguageDisplay()})</h3>
            <div className="transcript-actions">
              {translatedText && (
                <span className="word-count">
                  {translatedText.trim().split(/\s+/).length} words
                </span>
              )}
              {translatedText && (
                <button 
                  className="speaker-button" 
                  onClick={() => speakText(translatedText, targetLanguage)}
                  disabled={isSpeaking}
                  title="Speak translated text"
                >
                  {isSpeaking ? '🔇' : '🔊'}
                </button>
              )}
            </div>
          </div>
          
          <div className="transcript-display">
            {isTranslating ? (
              <div className="placeholder-text">
                <span className="translation-spinner">⟳</span> Translating...
              </div>
            ) : translationError ? (
              <div className="error-message">
                {translationError}
              </div>
            ) : (
              <div className="final-text">
                {translatedText}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="instructions">
        <h3>How to Use:</h3>
        <ul>
          <li>Select your speech language from the first dropdown</li>
          <li>Select the language you want to translate to from the second dropdown</li>
          <li>Enable "Auto-translate while speaking" for real-time translation</li>
          <li>Click "Start Listening" to begin speech recognition</li>
          <li>Speak clearly and at a moderate pace</li>
          <li>Click the "Translate" button to translate the text manually</li>
          <li>Use the copy buttons to copy original or translated text</li>
        </ul>
        <div className="language-note">
          <strong>Note:</strong> Speech recognition and translation accuracy may vary depending on the language and your accent. 
          For best results, speak clearly and maintain consistent pronunciation. Translation requires an internet connection.
        </div>
      </div>

      {/* Speech History */}
      {speechHistory.length > 0 && (
        <div className="history-container">
          <div className="history-header">
            <h3>Speech History</h3>
            <button className="clear-history-button" onClick={clearHistory}>
              🗑️ Clear History
            </button>
          </div>
          <div className="history-list">
            {speechHistory.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-content">
                  <div className="history-original">
                    <span className="history-lang">
                      {indianLanguages.find(l => l.code === item.originalLang)?.display || item.originalLang}
                    </span>
                    <p className="history-text">{item.originalText}</p>
                    <button 
                      className="history-speaker-button"
                      onClick={() => speakFromHistory(item.originalText, item.originalLang)}
                      disabled={isSpeaking}
                      title="Speak original text"
                    >
                      🔊
                    </button>
                  </div>
                  <div className="history-arrow">→</div>
                  <div className="history-translated">
                    <span className="history-lang">
                      {indianLanguages.find(l => l.code === item.targetLang)?.display || item.targetLang}
                    </span>
                    <p className="history-text">{item.translatedText}</p>
                    <button 
                      className="history-speaker-button"
                      onClick={() => speakFromHistory(item.translatedText, item.targetLang)}
                      disabled={isSpeaking}
                      title="Speak translated text"
                    >
                      🔊
                    </button>
                  </div>
                  <div className="history-actions">
                    <button 
                      className="history-delete-button"
                      onClick={() => deleteHistoryItem(item.id)}
                      title="Delete from history"
                    >
                      ❌
                    </button>
                    <span className="history-timestamp">{item.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeechToText;
