<template>
  <div class="wrapper">
    <div class="centerred-content">
      <div class="video-container">
        <video src="" class="video" ref="video"></video>
        <div v-if="isVideoForbidden" class="video-overflow">Видео запрещено.<br>Предоставьте разрешение на камеру и микровон в браузере<br>и презагрузите страницу.</div>
      </div>
      <div class="buttons-container">
        <div>
          <button :class="[controls.video ? 'button--green' : 'button--red']" @click="toggleVideo">video</button>
          <button :class="[controls.audio ? 'button--green' : 'button--red']" @click="toggleAudio">audio</button>
        </div>
        <button class="connect-btn">connect</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    isVideoForbidden: null,
    controls: {
      video: true,
      audio: true,
    }
  }),
  mounted() {
    this.setupVideoStreaming()
  },
  methods: {
    toggleVideo() {
      this.controls.video = !this.controls.video
      this.setupVideoStreaming()
    },
    toggleAudio() {
      this.controls.audio = !this.controls.audio
      this.setupVideoStreaming()
    },
    hasGetUserMedia() {
      return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    },
    setupVideoStreaming() {
      if (this.hasGetUserMedia) {
      navigator.mediaDevices.getUserMedia({
          video: this.controls.video ? {width: 1920, height: 1080} : false,
          audio: true,
        }).then(stream => {
          this.isVideoForbidden = false;

          this.$refs.video.muted = !this.controls.audio
          this.$refs.video.srcObject = stream;
          this.$refs.video.addEventListener('loadedmetadata', () => {
          this.$refs.video.play();
        })
      }).catch(e => {
        console.log(e)
        this.isVideoForbidden = true;
      })
      } else {
        this.isVideoForbidden = false;
      }
    }
  }
}
</script>


<style scoped>
.wrapper {
  background: #1C293D;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  height: 100vh;
}


.video-container {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
}
.video-overflow {
  top: 0;
  left: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
}
.video {
  width: 700px;
  height: 350px;
  display: block;
  background: hsl(216, 37%, 15%);
  border: 5px solid hsl(216, 37%, 15%);
  object-fit: cover;
  border-radius: 10px;
}
.buttons-container {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
}

button {
  border: 1px solid #000;
  padding: 8px 16px;
  color: #fff;
  border: 5px solid hsl(216, 37%, 15%);
  border-radius: 8px;
  font-weight: 600;
}
.button--green {
  background-color: green;
}
.button--red {
  background-color: red;
}
.connect-btn {
  background: #FB226A;
}
</style>