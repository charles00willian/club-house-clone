import UserStream from "./entities/userStream.js";

export default class RoomService {
  constructor({
    media
  }){
    this.media = media;
    this.currentPeer = {};
    this.currentUser = {};
    this.currentStream = {};
    this.peers = new Map();
  }

  async init() {
    this.currentStream = new UserStream({
      stream: await this.media.getUserAudio(),
      isFake: false,
    })
  }

  setCurrentPeer(peer) {
    this.currentPeer = peer;
  }
  
  getCurrentUser() {
    return this.currentUser;
  }

  upgradeUserPermission(user) {
    if(!user.isSpeaker) return;

    const isCurrentUser = user.id === this.currentUser.id;
    
    if(!isCurrentUser) return;

    this.currentUser = user;

  }

  updateCurrentUserProfile(users) {
    console.log(users)
    this.currentUser = users.find(({ peerId }) => peerId === this.currentPeer.id);
  }
  

  async getCurrentStream() {
    const { isSpeaker } = this.currentUser;

    if(isSpeaker) {
      return this.currentStream.stream;
    }

    return this.media.createMediaStreamFake();
  }

  async callNewUser(user) {
    //se o usuario que estrou for speaker, ele vai me ligar!
    const { isSpeaker } = this.currentUser;

    if(!isSpeaker) return;

    const stream = await this.getCurrentStream();
    this.currentPeer.call(user.peerId, stream);
  }

  addReceivedPeer(call) {
    const calledId = call.peer;
    this.peers.set(calledId, { call });

    const isCurrentId = calledId === this.currentUser.id;

    return { isCurrentId };
  }

  disconnectPeer({
    peerId
  }) {
    if(!this.peers.has(peerId)) return;

    this.peers.get(peerId).call.close();
    this.peers.delete(peerId);
  }
}