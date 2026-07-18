import React, { useEffect, useState } from "react";
import { translateTextWithGroq } from "../../utils/groqTranslation";
import { getLanguageLabel } from "./chatLanguages";
import { isSpeechSupported, speakInLanguage, stopSpeaking } from "./chatSpeech";
import "./Chat.css";

/**
 * Single chat message bubble with translate + multilingual speaker actions.
 */
const MessageBubble = ({ message, isOwn, targetLang = "hi" }) => {
  const [translated, setTranslated] = useState(message.translatedText || "");
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState("");

  useEffect(() => {
    if (message.translatedText) {
      setTranslated(message.translatedText);
    }
  }, [message.translatedText]);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const speechAvailable = isSpeechSupported();

  const timeLabel = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const roleLabel =
    message.senderType === "sign"
      ? "Sign"
      : message.senderType === "normal"
        ? "Voice/Text"
        : message.senderType;

  // Original messages are treated as English for pronunciation.
  const handleSpeak = (which, text, langCode) => {
    if (!text?.trim() || !speechAvailable) return;

    if (speaking === which) {
      stopSpeaking();
      setSpeaking("");
      return;
    }

    setSpeaking(which);
    speakInLanguage(text, langCode, {
      onEnd: () => setSpeaking((cur) => (cur === which ? "" : cur)),
    });
  };

  const handleTranslate = async () => {
    if (!message.text?.trim() || isTranslating) return;

    setIsTranslating(true);
    setError("");

    try {
      const result = await translateTextWithGroq(
        message.text.trim(),
        "auto",
        targetLang
      );

      if (!result || /not configured|unavailable|error/i.test(result)) {
        setError(result || "Translation failed");
        setTranslated("");
      } else {
        setTranslated(result.trim());
      }
    } catch (err) {
      console.error("Chat translate error:", err);
      setError("Translation failed. Try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div
      className={`chat-bubble-row ${isOwn ? "chat-bubble-row--own" : "chat-bubble-row--peer"}`}
    >
      <div
        className={`chat-bubble ${isOwn ? "chat-bubble--own" : "chat-bubble--peer"}`}
      >
        <div className="chat-bubble__meta">
          <span className="chat-bubble__name">
            {message.senderName || "User"}
          </span>
          <span className="chat-bubble__role">{roleLabel}</span>
        </div>

        <div className="chat-bubble__line">
          <p className="chat-bubble__text">{message.text}</p>
          {speechAvailable && (
            <button
              type="button"
              className="chat-bubble__speak-btn"
              onClick={() => handleSpeak("original", message.text, "en")}
              title="Read aloud"
              aria-label="Read message aloud"
            >
              {speaking === "original" ? "⏹" : "🔊"}
            </button>
          )}
        </div>

        {translated && (
          <div className="chat-bubble__line chat-bubble__translation">
            <p className="chat-bubble__translation-text">
              <span className="chat-bubble__translation-label">
                {getLanguageLabel(targetLang)}:
              </span>{" "}
              {translated}
            </p>
            {speechAvailable && (
              <button
                type="button"
                className="chat-bubble__speak-btn"
                onClick={() => handleSpeak("translated", translated, targetLang)}
                title={`Read aloud in ${getLanguageLabel(targetLang)}`}
                aria-label={`Read translation aloud in ${getLanguageLabel(targetLang)}`}
              >
                {speaking === "translated" ? "⏹" : "🔊"}
              </button>
            )}
          </div>
        )}

        {error && <p className="chat-bubble__translate-error">{error}</p>}

        <div className="chat-bubble__footer">
          <button
            type="button"
            className="chat-bubble__translate-btn"
            onClick={handleTranslate}
            disabled={isTranslating || !message.text?.trim()}
          >
            {isTranslating ? "Translating…" : "Translate"}
          </button>
          {timeLabel && <span className="chat-bubble__time">{timeLabel}</span>}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
