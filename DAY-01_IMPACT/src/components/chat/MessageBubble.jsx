import React, { useEffect, useState } from "react";
import { translateTextWithGroq } from "../../utils/groqTranslation";
import { getLanguageLabel } from "./chatLanguages";
import "./Chat.css";

/**
 * Single chat message bubble with optional translate action.
 */
const MessageBubble = ({ message, isOwn, targetLang = "hi" }) => {
  const [translated, setTranslated] = useState(message.translatedText || "");
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (message.translatedText) {
      setTranslated(message.translatedText);
    }
  }, [message.translatedText]);

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
        <p className="chat-bubble__text">{message.text}</p>

        {translated && (
          <p className="chat-bubble__translation">
            <span className="chat-bubble__translation-label">
              {getLanguageLabel(targetLang)}:
            </span>{" "}
            {translated}
          </p>
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
