import React from "react";
import { CHAT_LANGUAGES } from "./chatLanguages";
import "./Chat.css";

/**
 * Shared translate language picker for Sign Chat and Voice Chat.
 */
const TranslateControls = ({
  targetLang,
  onTargetLangChange,
  autoTranslate = false,
  onAutoTranslateChange,
}) => {
  return (
    <div className="translate-controls">
      <label className="translate-controls__field">
        Translate to
        <select
          value={targetLang}
          onChange={(e) => onTargetLangChange(e.target.value)}
          className="translate-controls__select"
        >
          {CHAT_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </label>

      {typeof onAutoTranslateChange === "function" && (
        <label className="translate-controls__toggle">
          <input
            type="checkbox"
            checked={autoTranslate}
            onChange={(e) => onAutoTranslateChange(e.target.checked)}
          />
          Auto-translate incoming
        </label>
      )}
    </div>
  );
};

export default TranslateControls;
