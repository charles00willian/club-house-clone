import { constants } from "../../_shared/constants.js"
import Attendee from "./entities/attendee.js";

export default class RoomController {
  constructor({
    roomInfo, 
    socketBuilder,
    view,
    peerBuilder,
    roomService
  }){
    this.roomInfo =  roomInfo;
    this.socketBuilder = socketBuilder;
    this.socket = {};
    this.view = view;
    this.peerBuilder = peerBuilder;
    this.roomService = roomService;
  }

  static initialize(deps) {
    return new RoomController(deps)._initialize();
  }
  
  async _initialize(){
    this._setupViewEvents();
    this.socket = this._setupSocket();
    this.roomService.setCurrentPeer(await this._setupWebRTC());
  }

  _setupViewEvents(){
    this.view.updateUserImage(this.roomInfo.user)
    this.view.updateRoomTopic(this.roomInfo.room)
  }

  _setupSocket() {
    return this.socketBuilder
      .setOnUserConnected(this.onUserConnected())
      .setOnUserDisconnected(this.onUserDisconnected())
      .setOnRoomUpdated(this.onRoomUpdated())
      .setOnUserProfileUpgrade(this.setOnUserProfileUpgrade())
      .build()
  }

  async _setupWebRTC() {
    return this.peerBuilder
      .setOnError(this.onPeerError())
      .setOnConnectionOpened(this.onPeerConnectionOpened())
      .build()
  }

  onPeerError() {
    return (error) => { 
      console.error('peer deu ruim', error)
    };
  }

  // quando a conexão for abetta ele pede para entrar na sala do socket
  onPeerConnectionOpened() {
    return (peer) => { 
      console.log('peer', peer)
      this.roomInfo.user.peerId = peer.id;
      this.socket.emit(constants.events.JOIN_ROOM, this.roomInfo)
    };
  }

  setOnUserProfileUpgrade() {
    return (user) => {
      const attendee = new Attendee(user);
      console.log('profile upgrade', attendee);
      this.roomService.upgradeUserPermission(attendee)

      if(attendee.isSpeaker){
        this.view.addAttendeeOnGrid(attendee, true);
      }

      this.activateUserFeatures();
    };
  }

  onRoomUpdated() {
    return (data) => {
      const users = data.map(item => new Attendee(item));

      this.view.updateAttendeesOnGrid(users);
      this.roomService.updateCurrentUserProfile(users);
      this.activateUserFeatures()

      console.log('room list', data)
    };
  }

  onUserDisconnected() {
    return (data) => {
      const attendee = new Attendee(data);

      console.log(`${attendee.username} disconnected`, );
      this.view.removeItemFromGrid(attendee.id)
    };
  }

  onUserConnected() {
    return (data) => {
      const attendee = new Attendee(data);
      console.log('user connected', attendee);
      this.view.addAttendeeOnGrid(attendee);
    };
  }

  activateUserFeatures() {
    const currentUser = this.roomService.getCurrentUser();
    this.view.showUserFeatures(currentUser.isSpeaker);
  }
}