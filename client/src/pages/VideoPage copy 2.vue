<template>
  <div class="wrapper">
    <div class="header">
      <div>Mатематика (групповое занятие)</div>
      {{ `roomId: ${this.$route.params.roomId}` }}
      {{ `userId: ${this.$route.params.userId}` }}
      <div>10:40</div>
    </div>
    <main class="videos-container" ref="videosContainer">
      <video src="" ref="myMediaStream" style="max-width: calc(100% - 100px)"></video>
      <!-- <Stream :userId="$route.params.userId"></Stream> -->
    </main>
    <div class="footer">
      <button class="button button--disconnect">завершить звонок</button>
      <button class="button button--screen-share" @click="shareScreenHandler">{{ myScreenStream ? 'Остановить демонстрацию': 'Демонстрация экрана'}}</button>
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
    myDefaultMediaStream: null,
    myVideoStream: null,
    myScreenStream: null,
    connectedPeers: {},
    mediaConfig: {
      camera: {
        audio: true,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }
    }
  }),
  async mounted() {
    navigator.mediaDevices.enumerateDevices()
      .then(function(MediaDeviceInfo) { console.log(MediaDeviceInfo); })
    this.myPeer = new Peer()
    this.myPeer.on('open', this.openPeerHandler)
    socket.on("NEW_USER_CONNECTED", this.newUserHandler)
    socket.on('CHANGED_VIDEO_STREAM', this.chagedVideoStream)

    this.myVideoStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    this.myDefaultMediaStream = this.myVideoStream;

    // При звонке отправляем наш поток видео обратно
    this.myPeer.on('call', call => {
      call.answer(this.myDefaultMediaStream)
      
      // установка видео, которое приходит от входящего звонка
      const userVideo = document.createElement("video")
      call.on('stream', userVideoSream => {
        this.appendVideoStream(userVideo, userVideoSream)
      })
    })
    
  },
  methods: {
    openPeerHandler(connectionId) {
      socket.emit("JOIN_ROOM", {
        roomId: this.$route.params.roomId,
        userId: this.$route.params.userId,
        connectionId: connectionId,
      })
    },
    newUserHandler({connectionId}) {
      // отправляем новому созданному пользователю звонок с нашим потоком данных
      console.log('New user connected:', connectionId)
      this.connectToNewUser(connectionId, this.myDefaultMediaStream)
    },
    async shareScreenHandler() {
      this.myScreenStream = await navigator.mediaDevices.getDisplayMedia()
      this.myDefaultMediaStream =  this.myScreenStream;
      // обработчик прекращения демонстрации
      this.myScreenStream.getVideoTracks()[0].onended = this.stopScreenStreamingHandler;
    },
    stopScreenStreamingHandler() {
      console.log('Демонстарция экрана остановелна')
      this.myDefaultMediaStream = this.myVideoStream
      this.myScreenStream = null
    },
    appendVideoStream(video, stream) {
      video.muted = true;
      video.classList.add("video");
      video.srcObject = stream;
      video.addEventListener("loadedmetadata", () => {
        video.play();
      });
      this.$refs.videosContainer.appendChild(video);
    },
    connectToNewUser(newUserConnectionId, myMediaStream) {
      console.log(`Звоним пользователю ${newUserConnectionId} и передаем наш видео поток`)

      const call = this.myPeer.call(newUserConnectionId, myMediaStream);

      // слушаем поток видое от другого пользователя и устанавливаем его в video
      const userVideo = document.createElement("video")
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
    chagedVideoStream(userConnectionId) {
      console.log('User chaged video stream:', userConnectionId)
      // this.myPeer.reconnect()
      this.connectToNewUser(userConnectionId, this.myDefaultMediaStream)
    }
  },
  watch: {
    myDefaultMediaStream: {
      handler(newStream) {
        console.log("Source of media stream canged")

        // this.$refs.myMediaStream.muted = true;
        this.$refs.myMediaStream.srcObject = newStream;
        this.$refs.myMediaStream.addEventListener("loadedmetadata", () => {
          this.$refs.myMediaStream.play();
        });
        socket.emit("USER_CHAGED_VIDEO_STREAM", this.myPeer.id)
      },
      deep: true
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

