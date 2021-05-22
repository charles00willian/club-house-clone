import { constants } from "../util/constants.js";

export default class LobbyController {
  constructor({
    activeRooms,
    roomsListener
  }) {
    this.activeRooms = activeRooms;
    this.roomsListener = roomsListener;
  }

  #updateLobbyRooms(socket, activeRooms) {
    socket.emit(constants.event.LOBBY_UPDATED, activeRooms);
  }

  onNewConnection(socket) {
    const { id } = socket;
    console.log('[LOBBY] - connection established', id);
    this.#updateLobbyRooms(socket, [...this.activeRooms.values()]);
  }

  getEvents() {
    const functions = Reflect.ownKeys(LobbyController.prototype)
      .filter(fn => fn !== 'constructor')
      .map(name => [name, this[name].bind(this)]);

    return new Map(functions);
  }
}