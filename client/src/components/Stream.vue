<template>
  <div class="hello">video</div>
  <button @click="leave">leave</button>
  {{userId}}
  <div class="video-container" ref="video_container">
  </div>
</template>

<script>
import socket from '@/socketIO.js'
import { Peer } from "peerjs";

console.log(socket)
let peer = new Peer();

export default {
  name: 'StreamComponent',
  props: {
    userId: String
  },
  data: () => ({
    peer: {}
  }),
  mounted() {
    // socket.on("connect", (socket) => {
    //   console.log(socket)
    //   console.log("connect", socket.id); // x8WIv7-mJelg7on_ALbx
    // });

    this.$nextTick(() => {
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      }).then(stream => {
        // локальная трансляция видео
        let video = document.createElement('video');
        this.appendVideoStream(video, stream)


        //  обработчик при звонке
        peer.on('call', call => {
          call.answer(stream)
          let video = document.createElement('video');
          call.on('stream', userVideoStream => {
            this.appendVideoStream(video, userVideoStream)
          })
        })

        // connect new user
        socket.on("USER_CONNECTED", userId => {
          console.log('USER_CONNECTED', userId);

          // звонок абоненту + передача своего видео потока
          const call = peer.call(userId, stream)
          console.log('call', call);
          let video = document.createElement('video');
          call.on('stream', userVideoStream => {
            this.appendVideoStream(video, userVideoStream)
          })
          call.on('close', () => {video.remove()})
          this.peer[userId] = call;
        })

        socket.on('USER_DISCONNECTED', (userId) => {
          if (this.peer[userId]) {
            this.peer[userId].close()
          }
        })
        
      })

      // peer.on('open', id => {
      //   alert()
      //   console.log('test', id);
      //   socket.emit("JOIN_ROOM", {roomId: "1", userId: id})
      // })
    })
  },
  methods: {
    appendVideoStream(video, stream) {
      video.muted = true
      video.classList.add("video")
      video.srcObject = stream;
      video.addEventListener('loadedmetadata', () => {
        video.play();
      })
      this.$refs.video_container.appendChild(video)
    },
    // leave() {
    //   alert()
    //   console.log('leave');
    //   socket.emit('leave', socket.id)
    //   // socket.on("disconnect", () => {
    //   //   console.log("disconnect", socket.id); // x8WIv7-mJelg7on_ALbx
    //   // });
    // }
  },
  unmounted() {
    // socket.on("disconnect", () => {
    //   console.log("disconnect", socket.id); // x8WIv7-mJelg7on_ALbx
    // });
  }
}
</script>

<style scoped>
.video-container {
  border: 1px solid #000;
}
</style>

<style>
.video {
  width: 500px;
  height: 500px;
  background: #ccc;
  padding: 10px;
}
</style>
