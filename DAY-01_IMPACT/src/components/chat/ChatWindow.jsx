import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import "./Chat.css";

/**
 * Session chat history for both user types.
 * @param {{
 *   messages: Array,
 *   currentUserType: 'sign' | 'normal',
 *   peerTyping?: boolean,
 *   peerName?: string,
 *   title?: string,
 * }} props
 */
const ChatWindow = ({
  messages = [],
  currentUserType,
  peerTyping = false,
  peerName = "Peer",
  title = "Conversation",
}) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, peerTyping]);

  return (
    <div className="chat-window">
      <div className="chat-window__header">
        <h3>{title}</h3>
        <span className="chat-window__count">{messages.length} messages</span>
      </div>

      <div className="chat-window__messages" role="log" aria-live="polite">
        {messages.length === 0 ? (
          <p className="chat-window__empty">
            No messages yet. Start signing or typing to begin.
          </p>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderType === currentUserType}
            />
          ))
        )}
        {peerTyping && (
          <p className="chat-window__typing">{peerName} is typing…</p>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ChatWindow;
