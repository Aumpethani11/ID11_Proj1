import React, { useCallback, useEffect, useRef, useState } from "react";
import ChatWindow from "../components/chat/ChatWindow";
import SignInput from "../components/chat/SignInput";
import TranslateControls from "../components/chat/TranslateControls";
import { translateTextWithGroq } from "../utils/groqTranslation";
import {
  disconnectSocket,
  joinRoom,
  sendChatMessage,
} from "../socket/socket";
import "../components/chat/Chat.css";

/**
 * Sign User page: webcam signs → text → Socket.IO peer.
 */
const SignUser = () => {
  const [roomId, setRoomId] = useState("ROOM1");
  const [userName, setUserName] = useState("Sign User");
  const [joined, setJoined] = useState(false);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [peers, setPeers] = useState([]);
  const [status, setStatus] = useState("Not connected");
  const [targetLang, setTargetLang] = useState("hi");
  const [autoTranslate, setAutoTranslate] = useState(false);
  const lastSentRef = useRef("");
  const targetLangRef = useRef(targetLang);
  const autoTranslateRef = useRef(autoTranslate);

  useEffect(() => {
    targetLangRef.current = targetLang;
  }, [targetLang]);

  useEffect(() => {
    autoTranslateRef.current = autoTranslate;
  }, [autoTranslate]);

  const appendMessage = useCallback((message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  const translateIncoming = useCallback(async (message) => {
    if (message.senderType === "sign") return;
    if (!autoTranslateRef.current || !message.text?.trim()) return;

    try {
      const translated = await translateTextWithGroq(
        message.text.trim(),
        "auto",
        targetLangRef.current
      );
      if (!translated || /not configured|unavailable|error/i.test(translated)) {
        return;
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === message.id
            ? { ...m, translatedText: translated.trim() }
            : m
        )
      );
    } catch (err) {
      console.error("Auto-translate failed:", err);
    }
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
      userType: "sign",
      userName: userName.trim() || "Sign User",
    });

    socket.off("connect");
    socket.off("disconnect");
    socket.off("joined-room");
    socket.off("receive-message");
    socket.off("peer-joined");
    socket.off("peer-left");

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

    socket.on("receive-message", (message) => {
      appendMessage(message);
      translateIncoming(message);
    });
  };

  const handleLeave = () => {
    disconnectSocket();
    setJoined(false);
    setConnected(false);
    setPeers([]);
    setStatus("Left room");
  };

  const handleSentenceReady = useCallback(
    (sentence) => {
      const clean = sentence?.trim();
      if (!clean) return;

      if (!joined) {
        alert("Join a room first to send your sentence.");
        return;
      }

      if (clean === lastSentRef.current) return;
      lastSentRef.current = clean;

      const message = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        text: clean,
        senderType: "sign",
        senderName: userName.trim() || "Sign User",
        timestamp: new Date().toISOString(),
      };

      appendMessage(message);
      sendChatMessage(message);
    },
    [joined, userName, appendMessage]
  );

  return (
    <div className="chat-page">
      <div className="chat-page__intro">
        <h1>Sign User</h1>
        <p>
          Perform signs with your webcam. Detected sentences are sent in real
          time to the other PC. Incoming messages appear in the chat window.
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
              placeholder="Sign User"
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

      <div className="chat-layout">
        <div className="chat-panel">
          <h3>Sign detection</h3>
          <SignInput onSentenceReady={handleSentenceReady} />
        </div>

        <div className="chat-panel">
          <TranslateControls
            targetLang={targetLang}
            onTargetLangChange={setTargetLang}
            autoTranslate={autoTranslate}
            onAutoTranslateChange={setAutoTranslate}
          />
          <ChatWindow
            messages={messages}
            currentUserType="sign"
            title="Live chat"
            targetLang={targetLang}
          />
        </div>
      </div>
    </div>
  );
};

export default SignUser;
