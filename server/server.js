const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('socket connected')
  socket.on('JOIN_ROOM', ({roomId, userId, connectionId}) => {
    console.log(`roomId: ${roomId}  /  userId: ${userId} / connectionId: ${connectionId}`)
    socket.join(roomId)
    socket.to(roomId).emit('USER_CONNECTED', connectionId)

    socket.on("disconnect", () => {
      console.log('user dic: ', connectionId)
      socket.to(roomId).emit("USER_DISCONNECTED", connectionId)
    })
  })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});