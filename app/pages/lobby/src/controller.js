export default class LobbyController {
  constructor({
    socketBuilder, 
    user,
    view,
  }) {
    this.socketBuilder = socketBuilder;
    this.user = user;
    this.socket = {};
    this.view = view;
  }

  static initialize(deps) {
    return new LobbyController(deps)._initialize()
  }

  async _initialize() {
    this.socket = this._setupSocket();
  }

  _setupSocket() {
    return this.socketBuilder
      .setOnLobbyUpdated(this.onLobbyUpdated())
      .build()
  }

  onLobbyUpdated() {
    return (rooms) => {
      console.log('lobby updated', rooms);
      this.view.updateRoomList(rooms);
    };
  }
}