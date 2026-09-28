const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const players = {};

app.get("/", (req, res) => {
  res.send("Pompon Multiplayer Server ONLINE");
});

io.on("connection", (socket) => {
  console.log("Jugador conectado:", socket.id);

  players[socket.id] = {
    id: socket.id,
    x: 0,
    y: 0,
    z: 0
  };

  socket.emit("currentPlayers", players);

  socket.broadcast.emit("playerJoined", players[socket.id]);

  socket.on("playerMove", (data) => {
    if (!players[socket.id]) return;

    players[socket.id].x = data.x;
    players[socket.id].y = data.y;
    players[socket.id].z = data.z;

    socket.broadcast.emit("playerMoved", players[socket.id]);
  });

  socket.on("disconnect", () => {
    console.log("Jugador desconectado:", socket.id);

    delete players[socket.id];

    io.emit("playerLeft", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Pompon Server iniciado en puerto ${PORT}`);
});
