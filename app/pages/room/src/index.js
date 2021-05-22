import { constants } from "../../_shared/constants.js"
import SocketBuilder from "../../_shared/socket.js"
import RoomController from "./controller.js"
import RoomSocketBuilder from "./util/roomSocket.js"
import View from "./view.js"

const room = {
  id: 'Date.now()',
  topic: 'JS expert eh noix'
}

const user = {
  img: 'https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/batman_hero_avatar_comics-512.png',
  username: 'Charles ' + Date.now()
}

const roomInfo = { user, room}

const socketBuilder = new RoomSocketBuilder({
  socketUrl: constants.socketUrl,
  namespace: constants.socketNamespaces.room
})

const dependencies = {
  view: View,
  socketBuilder,
  roomInfo
}

const roomController =  RoomController.initialize(dependencies);




  



// socket.emit(constants.events.JOIN_ROOM, { user, room });