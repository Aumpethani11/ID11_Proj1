import React, { useCallback, useEffect, useState } from "react";
import ChatWindow from "../components/chat/ChatWindow";
import VoiceInput from "../components/chat/VoiceInput";
import {
  disconnectSocket,
  emitTyping,
  joinRoom,
  sendChatMessage,
} from "../socket/socket";
import "../components/chat/Chat.css";

/**
 * Normal User page: mic / typed text → Socket.IO → Sign User.
 * Receives sign-translated messages in the chat window (text only, no TTS).
 */
const NormalUser = () => {
  const [roomId, setRoomId] = useState("ROOM1");
  const [userName, setUserName] = useState("Normal User");
  const [joined, setJoined] = useState(false);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [peers, setPeers] = useState([]);
  const [peerTyping, setPeerTyping] = useState(false);
  const [status, setStatus] = useState("Not connected");

  const appendMessage = useCallback((message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  const handleJoin = () => {
    if (!roomId.trim()) return;

    const socket = joinRoom({
      roomId: roomId.trim(),
      userType: "normal",
      userName: userName.trim() || "Normal User",
    });

    socket.off("connect");
    socket.off("disconnect");
    socket.off("joined-room");
    socket.off("receive-message");
    socket.off("peer-joined");
    socket.off("peer-left");
    socket.off("peer-typing");

    socket.on("connect", () => {
      setConnected(true);
      setStatus("Connected to server");
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setJoined(false);
      setStatus("Disconnected");
    });

    socket.on("joined-room", (payload) => {
      setJoined(true);
      setPeers(payload.peers || []);
      setStatus(`Joined room ${payload.roomId}`);
    });

    socket.on("peer-joined", (payload) => {
      setPeers(payload.peers || []);
      setStatus(`${payload.userName} joined`);
    });

    socket.on("peer-left", (payload) => {
      setPeers(payload.peers || []);
      setStatus(`${payload.userName} left`);
    });

    socket.on("peer-typing", (payload) => {
      setPeerTyping(Boolean(payload.isTyping));
    });

    socket.on("receive-message", (message) => {
      appendMessage(message);
      setPeerTyping(false);
    });
  };

  const handleLeave = () => {
    disconnectSocket();
    setJoined(false);
    setConnected(false);
    setPeers([]);
    setPeerTyping(false);
    setStatus("Left room");
  };

  const handleSend = (text) => {
    if (!joined) return;
    sendChatMessage({
      text,
      senderType: "normal",
      senderName: userName.trim() || "Normal User",
    });
    emitTyping(false);
  };

  return (
    <div className="chat-page">
      <div className="chat-page__intro">
        <h1>Normal User</h1>
        <p>
          Speak or type messages. They are sent instantly to the Sign User.
          Sign-translated replies appear in the chat window below.
        </p>
      </div>

      {!joined ? (
        <div className="chat-room-form">
          <label>
            Room ID
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="e.g. ROOM1"
            />
          </label>
          <label>
            Display name
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Normal User"
            />
          </label>
          <button type="button" className="chat-btn chat-btn--primary" onClick={handleJoin}>
            Join room
          </button>
        </div>
      ) : (
        <div className="chat-room-form">
          <div className="chat-status">
            <span
              className={`chat-status__dot ${connected ? "chat-status__dot--on" : ""}`}
            />
            <span>{status}</span>
            <span>Peers: {Math.max(peers.length - 1, 0)}</span>
          </div>
          <button type="button" className="chat-btn chat-btn--ghost" onClick={handleLeave}>
            Leave room
          </button>
        </div>
      )}

      <div className="chat-layout chat-layout--normal">
        <div className="chat-panel">
          <h3>Your message</h3>
          <VoiceInput
            onSend={handleSend}
            onTyping={emitTyping}
            disabled={!joined}
          />
          {!joined && (
            <p className="chat-window__empty">Join a room to start messaging.</p>
          )}
        </div>

        <div className="chat-panel">
          <ChatWindow
            messages={messages}
            currentUserType="normal"
            peerTyping={peerTyping}
            peerName="Sign User"
            title="Live chat"
          />
        </div>
      </div>
    </div>
  );
};

export default NormalUser;
