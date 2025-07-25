import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

const userSockets = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Authenticate user via token
  socket.on("authenticate", (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // Attach user info to socket
      userSockets[decoded.id] = socket.id;
      console.log(`User authenticated: ${decoded.username}`);
    } catch (err) {
      console.error("Invalid token:", err.message);
      socket.emit("auth_error", "Authentication failed. Please log in again.");
      socket.disconnect(true); // Kick unauthorized user
    }
  });

  // Handle global chat messages (only if authenticated)
  socket.on("chat_message", (msg) => {
    if (!socket.user) {
      console.warn("Unauthenticated user tried to send a chat message");
      return;
    }

    const messageData = {
      username: socket.user.username,
      content: msg.content,
      timestamp: new Date().toLocaleTimeString(),
    };

    io.emit("chat_message", messageData);
  });

  // Handle private messages (only if authenticated)
  socket.on("private-message", ({ toUserId, message }) => {
    if (!socket.user) {
      console.warn("Unauthenticated user tried to send a private message");
      return;
    }

    const recipientSocketId = userSockets[toUserId];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("private-message", {
        from: socket.user.username,
        message,
        timestamp: new Date().toLocaleTimeString(),
      });
    } else {
      console.log("Recipient not connected:", toUserId);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const [userId, id] of Object.entries(userSockets)) {
      if (id === socket.id) {
        delete userSockets[userId];
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});