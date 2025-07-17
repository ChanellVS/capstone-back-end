import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { Server } from "socket.io";
import http from "http";

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

const userSockets = {}

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("register", (userId) => {
    userSockets[userId] = socket.id
  })

  socket.on("private-message", ({ toUserId, message }) => {
    const recipientSocketId = userSockets[toUserId]

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("private-message", { from: socket.id, message }

      )
    } else {
      console.log("There is no user with that ID", toUserId)
    }
  })

  socket.on("send_message", (data) => {
    console.log("Message received:", data);
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

