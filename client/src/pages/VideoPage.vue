<template>
  <div class="wrapper">
    <div class="header">
      <div>Mатематика (групповое занятие)</div>
      {{ `roomId: ${this.$route.params.roomId}` }}
      {{ `userId: ${this.$route.params.userId}` }}
      <div>10:40</div>
    </div>
    <main class="videos-container" >
      {{ peers }}
      <video ref="myMediaStream" muted autoplay style="max-width: calc(100% - 100px); border: 5px solid red;s"></video>
      <div ref="videosContainer"></div>
      <!-- <video
        v-for="userStream of Object.values(peers)"
        :key="userStream.ids"
        :srcObject="userStream"
      ></video> -->
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
import {v4 as uuidv4} from 'uuid'

console.log(socket);

export default {
  name: "StreamComponent",
  props: {
    userId: String,
  },
  data: () => ({
    myPeer: null,
    stream: null,
    peers: {}
  }),
  async mounted() {
    
    // // список медиа устройств
    // await navigator.mediaDevices.enumerateDevices()
    //   .then(function(MediaDeviceInfo) { console.log(MediaDeviceInfo); })

    const peerUuid = uuidv4()
    this.myPeer = new Peer(peerUuid)
    console.log(this.myPeer.id)

    this.myPeer.on('open', this.openPeerHandler)
    this.myPeer.on('call', this.acceptCallHandler)
    socket.on('GET_USERS', this.getUsers)
    socket.on('USER_DISCONNECTED', this.userDisconectedHander)

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
    } catch (e) {
      console.error(e)
    }
    this.$refs.myMediaStream.srcObject = this.stream

    if (!this.myPeer || ! this.stream) return;

    socket.on('USER_JOINED', ({peerId}) => {
      console.log('initiate call');
      const call = this.myPeer.call(peerId, this.stream)
      call.on('stream', (stream) => {
        // добавление в стор peerId: stream
        this.peers[peerId] = stream;
        console.log("peers:", this.peers);
      })
    })
    
  },
  methods: {
    openPeerHandler(peerId) {
      socket.emit('JOIN_ROOM', {
        roomId: this.$route.params.roomId,
        peerId: peerId
      })
    },
    getUsers({participants}) {
      console.log("participants:", participants)
    },
    acceptCallHandler(call) {
      console.log('accept call');
      call.answer()
      call.on('stream', (stream) => {
        console.log(call)
        // добавление в стор  peerId: stream
        if (Object.keys(this.peers).includes(call.peer)) return;
        this.peers[call.peer] = stream;
        console.log("peers:", this.peers);
      })
    },
    userDisconectedHander({peerId}) {
      console.log(`User ${peerId} disconnected`)
      const videoForDelete = document.getElementById(peerId.replaceAll('-', '_'))
      videoForDelete.remove()
      delete this.peers[peerId]
    }
  },
  watch: {
    peers: {
      handler(newVal) {
        console.log('REDRAW USERS VIDEOS');
        this.$refs.videosContainer.innerHTML = ""
        const streams = Object.entries(newVal);
        console.log(streams);
        streams.forEach(stream => {
          const video = document.createElement('video')
          video.id = stream[0].replaceAll('-', '_')
          video.title = stream[0]
          video.srcObject = stream[1];
          video.play()
          this.$refs.videosContainer.appendChild(video);
        })
      },
      deep: true,
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

