<template>
  <div class="wrapper">
    <div class="header">
      <div>Mатематика (групповое занятие)</div>
      {{ `roomId: ${this.$route.params.roomId}` }}
      {{ `userId: ${this.$route.params.userId}` }}
      <div>10:40</div>
    </div>
    <main class="videos-container" ref="videosContainer">
      <!-- <Stream :userId="$route.params.userId"></Stream> -->
    </main>
    <div class="footer">
      <button class="button button--disconnect">завершить звонок</button>
      <button class="button button--screen-share" @click="shareScreenHandler">Демонстрация экрана</button>
    </div>
  </div>
</template>

<script>
import socket from "@/socketIO.js";
import { Peer } from "peerjs";

console.log(socket);

export default {
  name: "StreamComponent",
  props: {
    userId: String,
  },
  data: () => ({
    myPeer: null,
    connectionId: null,
    connectedPeers: {},
    defaultVideoStream: null,
    cameraStream: null,
    screenStream: null
  }),
  mounted() {
    this.myPeer = new Peer();

    this.myPeer.on('open', async myConnectionId => {
      this.connectionId = myConnectionId;
      console.log("MY CONNECTION ID:: " + myConnectionId)

      socket.emit("JOIN_ROOM", {
        roomId: this.$route.params.roomId,
        userId: this.$route.params.userId,
        connectionId: myConnectionId
      })

      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      this.defaultVideoStream = this.cameraStream;

      // При звонке отправляем наш поток видео обратно
      this.myPeer.on('call', call => {
        call.answer(this.defaultVideoStream)
        
        // установка видео, которое приходит от входящего звонка
        const userVideo = document.createElement("video")
        call.on('stream', userVideoSream => {
          this.appendVideoStream(userVideo, userVideoSream)
        })
      })


      // Добавление моего видео
      let myVideo = document.createElement("video");
      this.appendVideoStream(myVideo, this.defaultVideoStream);


      // Присоединение других пользователй к себе
      socket.on('USER_CONNECTED', newUserConnectionId => {
        console.log('new user connected: ' + newUserConnectionId)
        this.connectToNewUser(newUserConnectionId, this.defaultVideoStream)
      })

      // socket.on('STREAMING_VIDEO', streamerConnectionId => {
      //   console.log(`user ${streamerConnectionId} started sharing screen`);
      // })
    }),

    // закрытие подключения с отключенным пользователем
    socket.on("USER_DISCONNECTED", userConnectionId => {
      console.log('USER DISCONNECTED:', userConnectionId)
      if (this.connectedPeers[userConnectionId]) {
        this.connectedPeers[userConnectionId].close();
        delete this.connectedPeers[userConnectionId]
        const elForDelete = document.querySelector(`#${userConnectionId}`);
        if (elForDelete) {
          elForDelete.remove();
        }
      }
    })
  },
  methods: {
    appendVideoStream(video, stream) {
      video.muted = true;
      video.classList.add("video");
      video.srcObject = stream;
      video.addEventListener("loadedmetadata", () => {
        video.play();
      });
      this.$refs.videosContainer.appendChild(video);
    },
    connectToNewUser(newUserConnectionId, myVideoStream) {
      console.log(newUserConnectionId, myVideoStream)
      // з воним пользователю и передаем наше видео
      const call = this.myPeer.call(newUserConnectionId, myVideoStream);

      // слушаем поток видое от другого пользователя и устанавливаем его в video
      const userVideo = document.createElement("video")
      userVideo.setAttribute('id', newUserConnectionId);
      call.on('stream', userVideoStream => {
        this.appendVideoStream(userVideo, userVideoStream)
      })
      // удаляем видео абонента, если соединение закрылось
      call.on('close', () => {
        userVideo.remove()
      })

      // Добавляем в список активных подключений текущее подключение с новым пользователем
      this.connectedPeers[newUserConnectionId] = call;
    },
    async shareScreenHandler() {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia()
      this.defaultVideoStream = this.screenStream;

      this.screenStream.getVideoTracks()[0].onended = function () {
        alert()
        this.defaultVideoStream = this.cameraStream
        // doWhatYouNeedToDo();
      };

      const mySheredScrenVideo = document.createElement('video');
      this.appendVideoStream(mySheredScrenVideo, this.defaultVideoStream)
      // socket.emit('SHARING_SCREEN', {
      //   connectionId: this.connectionId,
      //   userId: this.$route.params.userId,
      //   roomId: this.$route.params.roomId,
      // })
      // const stream = myPeer.video(newUserConnectionId, mySharedScreenStream);
      // myPeer.call(adminId, mySharedScreenStream);
      this.myPeer.on('call', call => {
        console.log("on call")
        call.answer(this.defaultVideoStream)
      });
    }
  }
};
</script>


<style scoped>
.wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.header {
  background: hsl(216, 37%, 15%);
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  padding: 0 20px;
  color: #fff;
}
.footer {
  height: 70px;
  background: hsl(216, 37%, 15%);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}
.videos-container {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  align-content: center;
}

.button {
  height: 40px;
  width: 40px;
  border: 0;
  background: #1c293c;
  border-radius: 20px;
}

.button--disconnect {
  height: 40px;
  width: auto;
  padding: 0 20px;
  color: #fff;
  background: rgb(227, 55, 45);
  font-size: 16px;
}

.button--screen-share {
  height: 40px;
  width: auto;
  padding: 0 20px;
  color: #fff;
  background: rgb(45, 227, 227);
  font-size: 16px;
}
</style>

<style>
.video-wrapper {
  /* min-width: 300px;
  max-width: 600px; */
  /* widows: calc(100% - 4 * 20px); */
  max-width: 300px;
  min-width: 300px;
  flex-grow: 1;
  margin: 10px;
  background: #000;
  aspect-ratio: 4 / 3;
  display: flex;
  justify-content: center;
  overflow: hidden;
  border-radius: 10px;
  border: 5px solid #182334;
}

.video {
  width: 500px;
  padding: 10px;
}
</style>

