require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const PORT = process.env.PORT || 5000;

// CLIENT_ORIGIN can be "*", a single URL, or a comma-separated list of URLs.
const rawOrigin = process.env.CLIENT_ORIGIN || "*";
const allowedOrigins =
  rawOrigin === "*"
    ? true
    : rawOrigin
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST"],
};

const app = express();
app.use(cors(corsOptions));
app.get("/", (_req, res) => {
  res.send("Sign Language chat server is running.");
});
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "sign-language-chat-server" });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
});

/** @type {Map<string, Map<string, { userType: string, userName: string }>>} */
const rooms = new Map();

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("join-room", ({ roomId, userType, userName }) => {
    if (!roomId || !userType) {
      socket.emit("error-message", { message: "roomId and userType are required" });
      return;
    }

    const normalizedRoom = String(roomId).trim().toUpperCase();
    const name = userName?.trim() || (userType === "sign" ? "Sign User" : "Normal User");

    socket.join(normalizedRoom);
    socket.data.roomId = normalizedRoom;
    socket.data.userType = userType;
    socket.data.userName = name;

    if (!rooms.has(normalizedRoom)) {
      rooms.set(normalizedRoom, new Map());
    }
    rooms.get(normalizedRoom).set(socket.id, { userType, userName: name });

    const peers = Array.from(rooms.get(normalizedRoom).values());
    socket.emit("joined-room", {
      roomId: normalizedRoom,
      userType,
      userName: name,
      peers,
    });

    socket.to(normalizedRoom).emit("peer-joined", {
      userType,
      userName: name,
      peers,
    });

    console.log(`${name} (${userType}) joined room ${normalizedRoom}`);
  });

  socket.on("send-message", (payload) => {
    const roomId = socket.data.roomId || payload?.roomId;
    if (!roomId || !payload?.text?.trim()) return;

    const message = {
      id: payload.id || `${Date.now()}-${socket.id}`,
      text: payload.text.trim(),
      senderType: payload.senderType || socket.data.userType || "unknown",
      senderName: payload.senderName || socket.data.userName || "User",
      timestamp: payload.timestamp || new Date().toISOString(),
    };

    io.to(roomId).emit("receive-message", message);
  });

  socket.on("typing", ({ isTyping }) => {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    socket.to(roomId).emit("peer-typing", {
      isTyping: Boolean(isTyping),
      userName: socket.data.userName,
      userType: socket.data.userType,
    });
  });

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    if (roomId && rooms.has(roomId)) {
      rooms.get(roomId).delete(socket.id);
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
      } else {
        socket.to(roomId).emit("peer-left", {
          userName: socket.data.userName,
          userType: socket.data.userType,
          peers: Array.from(rooms.get(roomId).values()),
        });
      }
    }
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Sign Language chat server running on port ${PORT}`);
  console.log(
    `Allowed client origin(s): ${rawOrigin === "*" ? "* (all)" : rawOrigin}`
  );
});
