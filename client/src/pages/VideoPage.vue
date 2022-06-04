<template>
  <div class="wrapper">
    <div class="header">
      <div>Mатематика (групповое занятие)</div>
      {{ `roomId: ${this.$route.params.roomId}` }}
      {{ `userId: ${this.$route.params.userId}` }}
      <div>10:40</div>
    </div>
    <main class="videos-container" >
      <div class="video-wrapper">
        <video ref="myMediaStream" muted autoplay :title="myPeer._id"></video>
      </div> 
      
      <!-- <div v-for="(peer, key) in peers" :key="key">{{key}} {{ peer }}</div> -->
      <div class="video-wrapper" v-for="(peer, key) in peers"  :key="key" >
        <video :srcObject.prop="peer" autoplay :title="key"></video>
      </div> 
      
    </main>
    <div class="footer">
      <button class="button button--disconnect" @click="toggleMicrophone">mic {{microphoneAnable}}</button>
      <button class="button button--disconnect" @click="toggleCamera">cam {{cameraAnable}}</button>
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
    screenStream: null,
    peers: {},
    microphoneAnable: true,
    cameraAnable: true,
    myScreenStream: null
  }),
  created() {
    const peerUuid = uuidv4()
    this.myPeer = new Peer(peerUuid)
    console.log(this.myPeer._id)
  },
  async mounted() {
    
    // // список медиа устройств
    // await navigator.mediaDevices.enumerateDevices()
    //   .then(function(MediaDeviceInfo) { console.log(MediaDeviceInfo); })
    
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
      this.stream.getVideoTracks()[0].enabled = this.cameraAnable;
      this.stream.getAudioTracks()[0].enabled = this.microphoneAnable;
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
      call.answer(this.stream)
      call.on('stream', (stream) => {
        console.log('call', call)
        this.peers[call.peer] = stream;
        console.log("peers:", this.peers);
      })
    },
    userDisconectedHander({peerId}) {
      console.log(`User ${peerId} disconnected`)
      delete this.peers[peerId]
    },
    toggleCamera() {
      this.cameraAnable = !this.cameraAnable;
      this.stream.getVideoTracks()[0].enabled = this.cameraAnable;
      console.log('Camera', this.cameraAnable);
    },
    toggleMicrophone() {
      this.microphoneAnable = !this.microphoneAnable;
      this.stream.getAudioTracks()[0].enabled = this.microphoneAnable;
      console.log('Microphone', this.microphoneAnable);
    },
    async shareScreenHandler() {
      if (!this.screenStream) {
        this.screenStream = await navigator.mediaDevices.getDisplayMedia()
        this.$refs.myMediaStream.srcObject = this.screenStream;
        this.sendNewStreamToOtherPeers(this.screenStream)

        this.screenStream.getVideoTracks()[0].onended = this.switchLocalVideoToCamera.bind(this)
      } else {
        this.screenStream.getTracks().forEach(track => {track.stop()}) // force stop screen sharing
        this.switchLocalVideoToCamera()
      }
    },
    switchLocalVideoToCamera() {
      this.$refs.myMediaStream.srcObject = this.stream;
      this.sendNewStreamToOtherPeers(this.stream)
      this.screenStream = null;
    },
    sendNewStreamToOtherPeers(stream) {
      const videoTrack = stream.getTracks().find(track => track.kind === 'video');
        Object.values(this.myPeer.connections).forEach(connection => {
          console.log(connection);
          connection[0].peerConnection
            .getSenders()[1]
            .replaceTrack(videoTrack)
            .catch(e => console.error(e))
        })
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
  /* flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  align-content: center; */
  flex-grow: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr
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
.user-videos-container {
  width: 300px;
}
</style>

<style>
.video-wrapper {
  /* min-width: 300px;
  max-width: 600px; */
  /* widows: calc(100% - 4 * 20px); */
  /* max-width: 300px;
  min-width: 300px; */
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
  max-width: 500px;
  display: block;
  padding: 10px;
}
</style>

