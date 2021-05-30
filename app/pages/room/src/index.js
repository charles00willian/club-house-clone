import { constants } from "../../_shared/constants.js"
import Media from "../../_shared/media.js"
import PeerBuilder from "../../_shared/peerBulder.js"
import SocketBuilder from "../../_shared/socket.js"
import RoomController from "./controller.js"
import RoomService from "./service.js"
import RoomSocketBuilder from "./util/roomSocket.js"
import View from "./view.js"
import UserDb from "../../_shared/userDb.js";

const user = UserDb.get();
if(!Object.keys(user).length){
  View.redirectToLogin();
}

const urlParams = new URLSearchParams(window.location.search);
const keys = ['id', 'topic'];

const urlData = keys.map((key) => [key, urlParams.get(key)]);

const roomInfo = {
  room: {
    ...Object.fromEntries(urlData)
  },
  user
}

const peerBuilder = new PeerBuilder({
  peerConfig: constants.peerConfig
});

const socketBuilder = new RoomSocketBuilder({
  socketUrl: constants.socketUrl,
  namespace: constants.socketNamespaces.room
})

const roomService = new RoomService({
  media: Media
});

const dependencies = {
  view: View,
  socketBuilder,
  roomInfo,
  peerBuilder,
  roomService
}

 RoomController.initialize(dependencies).catch(err =>{
   alert(err.message)
 })




  



// socket.emit(constants.events.JOIN_ROOM, { user, room });