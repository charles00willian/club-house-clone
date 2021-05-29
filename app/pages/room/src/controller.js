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
    this.roomService.init();
    this.socket = this._setupSocket();
    this.roomService.setCurrentPeer(await this._setupWebRTC());
  }

  _setupViewEvents(){
    this.view.configureLeaveButton();
    this.view.configureMicrophoneToggle(this.onMicrophoneToggle());
    this.view.configureClapButton(this.onClapPressed())
    this.view.updateUserImage(this.roomInfo.user)
    this.view.updateRoomTopic(this.roomInfo.room)
  }

  onMicrophoneToggle() {
    return async () => { 
      return this.roomService.toggleAudioActivation();
    };
  }

  onClapPressed() {
    return () => {
      this.socket.emit(constants.events.SPEAK_REQUEST, this.roomInfo.user);
    };
  }

  _setupSocket() {
    return this.socketBuilder
      .setOnUserConnected(this.onUserConnected())
      .setOnUserDisconnected(this.onUserDisconnected())
      .setOnRoomUpdated(this.onRoomUpdated())
      .setOnUserProfileUpgrade(this.setOnUserProfileUpgrade())
      .setOnSpeakRequested(this.onSpeakRequested())
      .build()
  }

  async _setupWebRTC() {
    return this.peerBuilder
      .setOnError(this.onPeerError())
      .setOnConnectionOpened(this.onPeerConnectionOpened())
      .setOnCallReceived(this.onCallReceived())
      .setOnCallError(this.onCallError())
      .setOnCallClose(this.onCallClose())
      .setOnStreamReceived(this.onStreamReceived())
      .build()
  }

  onStreamReceived() {
    return (call, stream) => {
      const callerId = call.peer;
      console.log('onStreamReceived',call, stream);
      const { isCurrentId } = this.roomService.addReceivedPeer(call);

      this.view.renderAudioElement({
        callerId,
        stream,
        isCurrentId
      })
    };
  }

  onCallClose() {
    return (call) => {
      console.log('onCallClose', call)
      const peerId = call.peer;
      this.roomService.disconnectPeer({
        peerId
      })
     };
  }

  onCallError() {
    return (call, error) => {
      console.log('onCallError' , call, error)
      const peerId = call.peer;
      this.roomService.disconnectPeer({
        peerId
      })
     };
  }

  onCallReceived() {
    return async (call) => {
      const stream = await this.roomService.getCurrentStream();
      console.log('awnsering call', call);
      call.answer(stream);
     };
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


  onSpeakRequested() {
    return (data) => { 
      const attendee = new Attendee(data);
      const result = prompt(`${attendee.username} pediu para falar, aceitar? 1 sim, 0 não`);
      console.log(result , 'result')
      this.socket.emit(constants.events.SPEAK_ANSWER, { answer: !!Number(result), user: attendee });
    };
  }

  setOnUserProfileUpgrade() {
    return (user) => {
      const attendee = new Attendee(user);
      console.log('profile upgrade', attendee);
      
      if(attendee.isSpeaker){
        this.roomService.upgradeUserPermission(attendee)
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

      this.roomService.disconnectPeer(attendee)
    };
  }

  onUserConnected() {
    return (data) => {
      const attendee = new Attendee(data);
      console.log('user connected', attendee);
      this.view.addAttendeeOnGrid(attendee);

      // vamos ligar!
      this.roomService.callNewUser(attendee)
    };
  }

  activateUserFeatures() {
    const currentUser = this.roomService.getCurrentUser();
    this.view.showUserFeatures(currentUser.isSpeaker);
  }
}