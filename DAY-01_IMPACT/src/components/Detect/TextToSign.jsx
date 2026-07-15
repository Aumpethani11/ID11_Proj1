import React, { useState, useEffect, useCallback } from "react";
import "./TextToSign.css";
import { buildSignSequenceFromText } from "../../utils/signLookup";

const TextToSign = ({ onSignGenerated, isActive, externalPayload = { text: "", key: 0 } }) => {
  const [inputText, setInputText] = useState("");
  const [currentSignIndex, setCurrentSignIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [signSequence, setSignSequence] = useState([]);
  const [currentSign, setCurrentSign] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const applyTextInput = useCallback((text, autoPlay = false) => {
    if (!text || !text.trim()) return;

    setInputText(text);
    setIsGenerating(true);

    const sequence = buildSignSequenceFromText(text);
    setSignSequence(sequence);
    setCurrentSignIndex(0);
    setCurrentSign(null);
    setIsGenerating(false);

    if (autoPlay && sequence.length > 0) {
      setIsPlaying(true);
    }
  }, []);

  const handleTextSubmit = () => {
    applyTextInput(inputText);
  };

  useEffect(() => {
    if (externalPayload?.text && externalPayload.key) {
      applyTextInput(externalPayload.text, true);
    }
  }, [externalPayload?.key, externalPayload?.text, applyTextInput]);

  useEffect(() => {
    if (!isPlaying || signSequence.length === 0) return undefined;

    if (currentSignIndex >= signSequence.length) {
      setIsPlaying(false);
      setCurrentSign(null);
      return undefined;
    }

    const sign = signSequence[currentSignIndex];
    setCurrentSign(sign);

    if (onSignGenerated) {
      onSignGenerated(sign);
    }

    const timer = setTimeout(() => {
      setCurrentSignIndex((prev) => prev + 1);
    }, 2000 / playbackSpeed);

    return () => clearTimeout(timer);
  }, [currentSignIndex, isPlaying, playbackSpeed, signSequence, onSignGenerated]);

  const playSequence = () => {
    if (signSequence.length === 0) return;

    setIsPlaying(true);
    setCurrentSignIndex(0);
    setCurrentSign(null);
  };

  const stopSequence = () => {
    setIsPlaying(false);
    setCurrentSign(null);
    setCurrentSignIndex(0);
  };

  const clearAll = () => {
    setInputText("");
    setSignSequence([]);
    setCurrentSign(null);
    setCurrentSignIndex(0);
    setIsPlaying(false);
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="detect-section text-to-sign-section">
      <h3 className="section-subtitle">Text-to-Sign Converter</h3>

      <div className="text-input-area">
        <div className="input-group">
          <label htmlFor="text-input">Enter text to convert to sign language:</label>
          <textarea
            id="text-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message here... (e.g., 'hello thank you')"
            className="text-input"
            rows="3"
          />
        </div>

        <div className="input-actions">
          <button
            onClick={handleTextSubmit}
            disabled={!inputText.trim() || isGenerating}
            className="generate-signs-btn"
          >
            {isGenerating ? "Generating..." : "Generate Signs"}
          </button>
          <button
            onClick={clearAll}
            disabled={!inputText.trim() && signSequence.length === 0}
            className="clear-btn"
          >
            Clear
          </button>
        </div>
      </div>

      {signSequence.length > 0 && (
        <div className="sign-sequence-display">
          <div className="sequence-header">
            <h4>Sign Sequence ({signSequence.length} signs)</h4>
            <div className="playback-controls">
              <button
                onClick={playSequence}
                disabled={isPlaying}
                className="play-btn"
              >
                {isPlaying ? "Playing..." : "▶️ Play Sequence"}
              </button>
              <button
                onClick={stopSequence}
                disabled={!isPlaying}
                className="stop-btn"
              >
                ⏹️ Stop
              </button>
              <div className="speed-control">
                <label>Speed:</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                  className="speed-slider"
                />
                <span>{playbackSpeed}x</span>
              </div>
            </div>
          </div>

          {currentSign && (
            <div className="current-sign-display">
              <div className="sign-card active">
                <div className="sign-image">
                  {currentSign.image ? (
                    <img
                      src={currentSign.image}
                      alt={currentSign.displayName}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="sign-placeholder"
                    style={{ display: currentSign.image ? "none" : "flex" }}
                  >
                    <div className="sign-icon">✋</div>
                    <span>{currentSign.displayName}</span>
                  </div>
                </div>
                <div className="sign-info">
                  <h5>{currentSign.displayName}</h5>
                  <p className="sign-description">{currentSign.description}</p>
                  <p className="sign-instructions">{currentSign.instructions}</p>
                </div>
                <div className="sign-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${((currentSignIndex + 1) / signSequence.length) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="progress-text">
                    {currentSignIndex + 1} of {signSequence.length}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="sign-sequence-list">
            {signSequence.map((sign, index) => (
              <div
                key={`${sign.name}-${index}`}
                className={`sign-card ${index === currentSignIndex ? "current" : ""} ${
                  index < currentSignIndex ? "completed" : ""
                }`}
              >
                <div className="sign-image">
                  {sign.image ? (
                    <img
                      src={sign.image}
                      alt={sign.displayName}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="sign-placeholder"
                    style={{ display: sign.image ? "none" : "flex" }}
                  >
                    <div className="sign-icon">✋</div>
                    <span>{sign.displayName}</span>
                  </div>
                </div>
                <div className="sign-info">
                  <h6>{sign.displayName}</h6>
                  <p>{sign.description}</p>
                </div>
                <div className="sign-status">
                  {index < currentSignIndex && (
                    <span className="completed-icon">✓</span>
                  )}
                  {index === currentSignIndex && (
                    <span className="current-icon">●</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {signSequence.length === 0 && inputText.trim() && !isGenerating && (
        <p className="text-to-sign-empty">
          No matching signs found. Try common words like hello, thank you, yes, or spell with letters.
        </p>
      )}

      <div className="instructions-section">
        <h4>💡 How to use:</h4>
        <ul>
          <li>Type your message or use Convert to Signs from Speech or Sentence Builder</li>
          <li>Click Generate Signs to create a sign sequence from updated assets</li>
          <li>Use Play Sequence to see each sign with instructions</li>
          <li>Unknown words are finger-spelled using A-Z signs</li>
        </ul>
      </div>
    </div>
  );
};

export default TextToSign;
