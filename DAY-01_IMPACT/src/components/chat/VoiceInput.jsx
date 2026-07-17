import React, { useCallback, useEffect, useRef, useState } from "react";
import "./Chat.css";

/**
 * Browser Speech Recognition + manual text input for the Normal User.
 * @param {{
 *   onSend: (text: string) => void,
 *   onTyping?: (isTyping: boolean) => void,
 *   disabled?: boolean,
 * }} props
 */
const VoiceInput = ({ onSend, onTyping, disabled = false }) => {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech Recognition is not supported in this browser.");
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalChunk = "";
      let interimChunk = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalChunk += transcript;
        } else {
          interimChunk += transcript;
        }
      }

      if (finalChunk) {
        setText((prev) => `${prev}${prev ? " " : ""}${finalChunk.trim()}`.trim());
        onTyping?.(true);
      }
      setInterim(interimChunk);
    };

    recognition.onerror = (event) => {
      setError(event.error || "Speech recognition error");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterim("");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [onTyping]);

  const notifyTyping = useCallback(
    (value) => {
      onTyping?.(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => onTyping?.(false), 1200);
      setText(value);
    },
    [onTyping]
  );

  const toggleListening = () => {
    if (!recognitionRef.current || disabled) return;
    setError("");

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      setError(err.message || "Could not start microphone");
    }
  };

  const handleSend = () => {
    const payload = text.trim();
    if (!payload || disabled) return;
    onSend(payload);
    setText("");
    setInterim("");
    onTyping?.(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="voice-input">
      <div className="voice-input__row">
        <textarea
          className="voice-input__textarea"
          rows={3}
          placeholder="Type a message or use the microphone…"
          value={text}
          onChange={(e) => notifyTyping(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
      </div>

      {interim && <p className="voice-input__interim">Listening: {interim}</p>}
      {error && <p className="voice-input__error">{error}</p>}

      <div className="voice-input__actions">
        <button
          type="button"
          className={`chat-btn ${isListening ? "chat-btn--danger" : "chat-btn--secondary"}`}
          onClick={toggleListening}
          disabled={disabled || Boolean(error && !recognitionRef.current)}
        >
          {isListening ? "Stop Mic" : "Speak"}
        </button>
        <button
          type="button"
          className="chat-btn chat-btn--primary"
          onClick={handleSend}
          disabled={disabled || !text.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default VoiceInput;
