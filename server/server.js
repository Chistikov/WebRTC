const express = require('express');
const cors = require('cors')
const app = express();
app.use(cors)
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
require('dotenv').config()

console.log(process);
const { PORT } = process.env;

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST']
  }
});
const rooms = {}

io.on('connect', socket => {
  console.log(`SOCKET ${socket.id} CONNECTED`)

  socket.on('JOIN_ROOM', ({roomId, peerId}) => {
    console.log(`User ${peerId} joined to the room ${roomId}`);
    if (!rooms[roomId]) {
      rooms[roomId] = [peerId]
    } else {
      rooms[roomId].push(peerId)
    }
    socket.join(roomId)
    socket.to(roomId).emit('USER_JOINED', {peerId})
    console.log(rooms)

    socket.emit('GET_USERS', {
      roomId: roomId,
      participants: rooms[roomId]
    })

    socket.on('disconnect', () => {
      console.log(`User ${peerId} leave the room ${roomId}`)
      leaveRoom(roomId, peerId)
    })
  })

  // disconnect срабатывает при закрытии браузера или вкладки
  socket.on('disconnect', () => {
    console.log(`SOCKET DISCONNECTED`)
  })

  function leaveRoom(roomId, peerId) {
    rooms[roomId] = rooms[roomId].filter(participant => participant !== peerId)
    socket.to(roomId).emit('USER_DISCONNECTED', {peerId})
  }
})

server.listen(PORT, () => {
  console.log(`listening on port: ${PORT}`);
});