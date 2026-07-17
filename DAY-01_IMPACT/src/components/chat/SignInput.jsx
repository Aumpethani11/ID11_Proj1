import React from "react";
import Detect from "../Detect/Detect";
import "./Chat.css";

/**
 * Thin wrapper around existing Detect.jsx for two-way chat.
 * Detect emits completed sign sentences via onSentenceReady.
 *
 * @param {{
 *   onSentenceReady?: (sentence: string) => void,
 *   onGestureDetected?: (gesture: string) => void,
 * }} props
 */
const SignInput = ({ onSentenceReady, onGestureDetected, onSentenceBuilding }) => {
  return (
    <div className="sign-input">
      <Detect
        onSentenceReady={onSentenceReady}
        onGestureDetected={onGestureDetected}
        onSentenceBuilding={onSentenceBuilding}
        requireAuth={false}
        embedded
      />
    </div>
  );
};

export default SignInput;
