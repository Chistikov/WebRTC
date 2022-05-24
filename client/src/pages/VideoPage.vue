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
    </div>
  </div>
</template>

<script>
import socket from "@/socketIO.js";
import { Peer } from "peerjs";

console.log(socket);
let peer;

export default {
  name: "StreamComponent",
  props: {
    userId: String,
  },
  data: () => ({
    peer: {},
  }),
  mounted() {
    function initPeer() {
      // сюда можно передать id пользователя
      peer = new Peer();
      peer.on("open", (id) => {
        console.log(id);
        console.log("TTT", this.$route.params.roomId);
        socket.emit("JOIN_ROOM", {
          roomId: this.$route.params.roomId,
          userId: id,
        });
      });
      // socket.on("connect", (socket) => {
      //   console.log(socket)
      //   console.log("connect", socket.id); // x8WIv7-mJelg7on_ALbx
      // });

      // socket.on('test_msg', data => {
      //     console.log(data)
      // })
      this.$nextTick(() => {
        console.log("tick", this.userId);

        // socket.emit("JOIN_ROOM", {roomId: "1", userId: this.userId})

        // socket.on("USER_CONNECTED", userId => {
        //   console.log('USER_CONNECTED', userId);
        // })

        navigator.mediaDevices
          .getUserMedia({
            video: true,
            audio: true,
          })
          .then((stream) => {
            let video = document.createElement("video");
            this.appendVideoStream(video, stream);

            peer.on("call", (call) => {
              console.log("call", call);
              call.answer(stream);
              let video = document.createElement("video");
              call.on("stream", (userVideoStream) => {
                this.appendVideoStream(video, userVideoStream);
              });
            });

            // connect new user
            socket.on("USER_CONNECTED", (userId) => {
              console.log("USER_CONNECTED", userId);

              const call = peer.call(userId, stream);
              console.log("call", call);
              let video = document.createElement("video");
              call.on("stream", (userVideoStream) => {
                this.appendVideoStream(video, userVideoStream);
              });
              call.on("close", () => {
                video.remove();
              });
              this.peer[userId] = call;
            });

            socket.on("USER_DISCONNECTED", (userId) => {
              if (this.peer[userId]) {
                console.log("lll", this.peer[userId]);
                this.peer[userId].close();
              }
            });
          });
      });
    }

    setTimeout(initPeer.bind(this), 1000);

    // eslint-disable-next-line no-undef
    // console.log(Peer)
  },
  methods: {
    // appendVideoStream(video, stream) {
    //   if (video && stream) {
    //     let videoWrapper = document.createElement('div');
    //     videoWrapper.classList.add('video-wrapper');
    //     video.muted = true;
    //     video.classList.add('video');
    //     video.srcObject = stream;
    //     video.addEventListener('loadedmetadata', () => {
    //       video.play()
    //     })
    //     videoWrapper.appendChild(video);
    //     this.$refs.videosContainer.appendChild(videoWrapper)
    //   }
    // },
    appendVideoStream(video, stream) {
      video.muted = true;
      video.classList.add("video");
      video.srcObject = stream;
      video.addEventListener("loadedmetadata", () => {
        video.play();
      });
      this.$refs.videosContainer.appendChild(video);
    },
    leave() {
      console.log("leave");
      socket.emit("leave", socket.id);
      // socket.on("disconnect", () => {
      //   console.log("disconnect", socket.id); // x8WIv7-mJelg7on_ALbx
      // });
    },
  },
  unmounted() {
    socket.on("disconnect", () => {
      console.log("disconnect", socket.id); // x8WIv7-mJelg7on_ALbx
    });
  },
};

// import socket from '@/socketIO.js'
// import {Peer} from "peerjs";

// let peer;
// console.log(socket, peer)

// export default {
//   name: "VideoPage",
//   data: () => ({

//   }),
//   async mounted() {
//     socket.on('TTT', id => alert(id))
//     // console.log('userId ', this.$route.params.userId)
//     // console.log('peerId ', this.$route.params.peerId)

//     peer = new Peer(this.$route.params.peerId);
//     console.log(peer);

//     // let stream = null;
//     // let constraints = {
//     //   video: true,
//     //   audio: true,
//     // };

//     peer.on('open', peerId => {
//       console.log('My peer ID is: ' + peerId);
//       socket.emit(
//         "JOIN_ROOM",
//         {roomId: peerId, userId: this.$route.params.userId}
//       )
//     })

//     navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true,
//     }).then(stream => {
//       let video = document.createElement('video');
//       this.appendVideoStream(video, stream)

//       peer.on('call', call => {
//         alert('кто-то звонит')
//         call.answer(stream) // отвечаем и передаем наше видео

//         // получаем видео поток от абонента и транслируем его в video
//         let video = document.createElement('video');
//         call.on('stream', userVideoStream => {
//           this.appendVideoStream(video, userVideoStream)
//         })
//       })

//       // connect new user
//       socket.on("USER_CONNECTED", userId => {
//         alert('user connected')
//         console.log('USER_CONNECTED', userId);

//         // создать исходящий звонок
//         const call = peer.call(userId, stream)
//         console.log('call', call);
//         let video = document.createElement('video');
//         call.on('stream', userVideoStream => {
//           this.appendVideoStream(video, userVideoStream)
//         })
//         call.on('close', () => {video.remove()})
//         this.peer[userId] = call;
//       })

//       socket.on('USER_DISCONNECTED', (userId) => {
//         if (this.peer[userId]) {
//           this.peer[userId].close()
//         }
//       })

//     })

//     // try {
//     //   stream = await navigator.mediaDevices.getUserMedia(constraints);

//     //   // демонстрация видео его же владельцу
//     //   let video = document.createElement('video');
//     //   this.addpedVideoStream(video, stream);

//     //   peer.on('call', call => {
//     //     call.answer(stream)
//     //     let video = document.createElement('video');
//     //     call.on('stream', userVideoStream => {
//     //       this.appendVideoStream(video, userVideoStream)
//     //     })
//     //   })

//     //   // connect new user
//     //   socket.on("USER_CONNECTED", userId => {
//     //     console.log('USER_CONNECTED', userId);

//     //     const call = peer.call(userId, stream)
//     //     console.log('call', call);
//     //     let video = document.createElement('video');
//     //     call.on('stream', userVideoStream => {
//     //       this.appendVideoStream(video, userVideoStream)
//     //     })
//     //     call.on('close', () => {video.remove()})
//     //     this.peer[userId] = call;
//     //   })

//     // } catch(err) {
//     //   console.error(err)
//     //   alert('Ошибка при установке видео потока.')
//     // }

//     // socket.on('USER_DISCONNECTED', (userId) => {
//     //   if (this.peer[userId]) {
//     //     this.peer[userId].close()
//     //   }
//     // })

//     // peer.on('open', id => {
//     //   console.log(id);
//     //   socket.emit("JOIN_ROOM", {roomId: "1", userId: id})
//     // })

//   },
//   methods: {
//     appendVideoStream(video, stream) {
//       let videoWrapper = document.createElement('div');
//       videoWrapper.classList.add('video-wrapper');
//       video.muted = true;
//       video.classList.add('video');
//       video.srcObject = stream;
//       video.addEventListener('loadedmetadata', () => {
//         video.play()
//       })
//       videoWrapper.appendChild(video);
//       this.$refs.videosContainer.appendChild(videoWrapper)
//     }
//   },
// }
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

