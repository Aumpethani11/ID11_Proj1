import React from "react";
import "./Chat.css";

/**
 * Single chat message bubble.
 * @param {{ message: { id: string, text: string, senderType: string, senderName: string, timestamp: string }, isOwn: boolean }} props
 */
const MessageBubble = ({ message, isOwn }) => {
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
        {timeLabel && <span className="chat-bubble__time">{timeLabel}</span>}
      </div>
    </div>
  );
};

export default MessageBubble;
