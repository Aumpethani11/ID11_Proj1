import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

let socket = null;

/**
 * Returns a singleton Socket.IO client connected to the chat server.
 */
export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

export const joinRoom = ({ roomId, userType, userName }) => {
  const s = connectSocket();
  s.emit("join-room", { roomId, userType, userName });
  return s;
};

export const sendChatMessage = ({ text, senderType, senderName, id }) => {
  const s = getSocket();
  if (!s.connected || !text?.trim()) return;

  s.emit("send-message", {
    id: id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text: text.trim(),
    senderType,
    senderName,
    timestamp: new Date().toISOString(),
  });
};

export const emitTyping = (isTyping) => {
  const s = getSocket();
  if (!s.connected) return;
  s.emit("typing", { isTyping: Boolean(isTyping) });
};

export default getSocket;
