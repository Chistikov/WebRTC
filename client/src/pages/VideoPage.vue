<template>
  <div class="wrapper">
    <div class="header">
      <div>Mатематика (групповое занятие)</div>
      {{ `peerId: ${this.$route.params.peerId}` }}
      <div>10:40</div>
    </div>
    <main class="videos-container">
      <div class="video-wrapper">
        <video src="" class="video"></video>
      </div>
      <div class="video-wrapper">
        <video src="" class="video"></video>
      </div>
    </main>
    <div class="footer">
      <button class="button button--disconnect">завершить звонок</button>
    </div>
  </div>
</template>

<script>
export default {}
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

}
.button {
  height: 40px;
  width: 40px;
  border: 0;
  background: #1C293C;
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

