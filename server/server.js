const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('JOIN_ROOM', ({roomId, userId}) => {
    console.log(roomId, userId)
    socket.join(roomId)
    socket.to(roomId).emit('USER_CONNECTED', userId)

    socket.on("disconnect", () => {
      socket.to(roomId).emit("USER_DISCONNECTED", userId)
    })
  })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});