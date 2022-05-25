import { io } from "socket.io-client";
const options = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  transports: ['websocket']
}
const {VUE_APP_SERVER_URL} = process.env

const socket = io(VUE_APP_SERVER_URL, options);
console.log(socket);

export default socket