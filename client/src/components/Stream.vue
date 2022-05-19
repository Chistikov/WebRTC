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

    // socket.on('test_msg', data => {
    //     console.log(data)
    // })
    this.$nextTick(() => {
      console.log('tick', this.userId);

      // socket.emit("JOIN_ROOM", {roomId: "1", userId: this.userId})

      // socket.on("USER_CONNECTED", userId => {
      //   console.log('USER_CONNECTED', userId);
      // })

      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      }).then(stream => {
        let video = document.createElement('video');
        this.appendVideoStream(video, stream)
        


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

      peer.on('open', id => {
        console.log(id);
        socket.emit("JOIN_ROOM", {roomId: "1", userId: id})
      })
    })
    
    // eslint-disable-next-line no-undef
    // console.log(Peer)
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
    leave() {
      console.log('leave');
      socket.emit('leave', socket.id)
      // socket.on("disconnect", () => {
      //   console.log("disconnect", socket.id); // x8WIv7-mJelg7on_ALbx
      // });
    }
  },
  unmounted() {
    socket.on("disconnect", () => {
      console.log("disconnect", socket.id); // x8WIv7-mJelg7on_ALbx
    });
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
