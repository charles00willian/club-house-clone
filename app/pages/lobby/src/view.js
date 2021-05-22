import Room from "./entities/room.js";
import getTemplate from "./templates/lobbyItem.js";

const roomGrid = document.getElementById('roomGrid');

export default class View {
  static clearRoomList() {
    roomGrid.innerHTML = '';
  }

  static generateRoomLink({id, topic}) {
    return `/room/index.html?id=${id}&topic=${topic}`
  }

  static updateRoomList(rooms) {
    View.clearRoomList();

    rooms.forEach(room => {
      const params = new Room({
        ...room,
        roomLink: View.generateRoomLink({id: room.id, topic: room.topic}),
      })

      const htmlTemplate = getTemplate(params);

      roomGrid.innerHTML += htmlTemplate;
    })
  }
}