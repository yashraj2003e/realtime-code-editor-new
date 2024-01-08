const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");
const { Socket } = require("socket.io-client");
const ACTIONS = require("./Actions");
// const router = require("./router");

const app = express();
app.use(cors());
// app.use(router);

const server = http.createServer(app);

app.get("/", (req, res) => {
  res.json("Hello");
});

const io = new Server(server);

const userSocketMap = {};

function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
}

io.on("connection", (Socket) => {
  Socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[Socket.id] = username;
    Socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: Socket.id,
      });
    });
  });

  Socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    io.to(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  Socket.on(ACTIONS.SYNC_CODE, ({ code, socketId, roomId }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  Socket.on("disconnecting", () => {
    const rooms = [...Socket.rooms];
    rooms.forEach((roomId) => {
      Socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: Socket.id,
        username: userSocketMap[Socket.id],
      });
    });
    delete userSocketMap[Socket.id];
    Socket.leave();
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT);
