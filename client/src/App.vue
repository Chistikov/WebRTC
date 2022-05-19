<template>
  {{ userId }}
  <HelloWorld :userId="userId"/>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  data: () => ({
    userId: null
  }),
  mounted() {
    this.userId = uuidv4()
    // this.userId = "df23d18e-d3c0-4b01-b476-6f7e43299f08"
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
