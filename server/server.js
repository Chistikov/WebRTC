const express = require('express');
const cors = require('cors')
const app = express();
app.use(cors)
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
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
      // rooms[roomId] = 
    })
  })

  // disconnect срабатывает при закрытии браузера или вкладки
  socket.on('disconnect', () => {
    console.log(`SOCKET DISCONNECTED`)
  })


  function leaveRoom(roomId, peerId) {
    rooms[roomId] = rooms[roomId].filter(participant => participant !== peerId)
    socket.to(roomId).emit('USER_DISCONNECTED', {userId: peerId})
  }
})

// function getClientsRooms() {
//   console.log(Array.from(io.sockets.adapter.rooms.keys()))
// }

// io.on('connection', (socket) => {
//   getClientsRooms()
//   console.log(`BASE SOCKET ${socket.id} CONNECTED`)
  
//   socket.on('JOIN_ROOM', ({roomId, userId, connectionId}) => {
//     const joinedRooms = socket.rooms
//     if (Array.from(joinedRooms).includes(roomId)) {
//       console.log(`Пользователь ${userId} уже присоединен к комнате ${roomId}`);
//     } else {
//       // проходимся по списку участников в комнате
//       const clientsInRoom = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
//       clientsInRoom.forEach(clientId => {
//         // каждому существующему пользователю отплавляем id нового пользователя
//         // что бы они добавили его в список пользователей, у себя, на фронте
//         // При этом createOffer стот в false, т.к. существующим пользователям не нужно инициировать новое соединение
//         io.to(clientId).emit('ADD_PEER', {
//           peerId: socket.id,
//           createOffer: false
//         })

//         // новому пользователю отправляем id старых пользователей
//         // а так же запрашиваем офер
//         socket.emit("ADD_PEER", {
//           peerId: clientId,
//           createOffer: true
//         })
//       })

//       socket.join(roomId)
//       console.log(io.sockets.adapter.rooms.get(roomId));
//     }
   

//     // console.log('New user connected', connectionId)
//     // socket.join(roomId)
//     // socket.to(roomId).emit('NEW_USER_CONNECTED', {connectionId})

//     socket.on('USER_CHAGED_VIDEO_STREAM', userConnectionId => {
//       io.to(roomId).emit("CHANGED_VIDEO_STREAM", userConnectionId)
//     })
//   })

  
    
// });

server.listen(3000, () => {
  console.log('listening on *:3000');
});

// io.on('connection', (socket) => {
//   console.log('socket connected')
//   socket.on('JOIN_ROOM', ({roomId, userId, connectionId}) => {
//     console.log(`roomId: ${roomId}  /  userId: ${userId} / connectionId: ${connectionId}`)
//     socket.join(roomId)
//     socket.to(roomId).emit('USER_CONNECTED', connectionId)

//     socket.on("disconnect", () => {
//       console.log('user dic: ', connectionId)
//       socket.to(roomId).emit("USER_DISCONNECTED", connectionId)
//     })
//   })
//   socket.on('SHARING_SCREEN', ({roomId, userId, connectionId}) => {
//     console.log('user started sharing screen:', connectionId)
//     socket.to(roomId).emit("STREAMING_VIDEO", connectionId)
//   })
// });

// server.listen(3000, () => {
//   console.log('listening on *:3000');
// });