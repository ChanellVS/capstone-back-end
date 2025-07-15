import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { Server } from "socket.io";
import http from "http";

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Allow user to join their own room
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  // Handle incoming message
  socket.on("send_message", (data) => {
    console.log("Message received:", data);

    if (data.is_global) {
      // Global message: broadcast to everyone, including sender
      io.emit("receive_message", data);
    } else if (data.receiver_id) {
      // Private message: only to the receiver
      io.to(`user_${data.receiver_id}`).emit("receive_message", data);
    }

    // Also send it back to sender's own inbox
    socket.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});


server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
