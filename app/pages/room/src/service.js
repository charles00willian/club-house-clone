import UserStream from "./entities/userStream.js";

export default class RoomService {
  constructor({
    media
  }){
    this.media = media;
    this.currentPeer = {};
    this.currentUser = {};
    this.currentStream = {};
    this.isAudioActive = true;
    this.peers = new Map();
  }

  async init() {
    this.currentStream = new UserStream({
      stream: await this.media.getUserAudio(),
      isFake: false,
    })
  }

  async _reconnectAsSpeaker() {
    return this.switchAudioStreamSource({ realAudio: true })
  }

  _reconnectPeers(stream) {
    for(const peer of this.peers.values()) {
      const peerId = peer.call.peer;
      peer.call.close();
      console.log('calling', peerId);

      this.currentPeer.call(peerId, stream);
    }
  }

  async switchAudioStreamSource({ realAudio }) {
    const userAudio = realAudio 
      ? await this.media.getUserAudio() 
      : this.media.createMediaStreamFake();

    this.currentStream = new UserStream({
      isFake: realAudio,
      stream: userAudio,
    })

    this.currentUser.isSpeaker = realAudio;

    // precisa encerrar as chamadas para ligar novamente
    this._reconnectPeers(this.currentStream.stream);
  }

  setCurrentPeer(peer) {
    this.currentPeer = peer;
  }
  
  getCurrentUser() {
    return this.currentUser;
  }

  async upgradeUserPermission(user) {
    if(!user.isSpeaker) return;

    const isCurrentUser = user.id === this.currentUser.id;
    
    if(!isCurrentUser) return;

    this.currentUser = user;

    return this._reconnectAsSpeaker()
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

  async toggleAudioActivation() {
    this.isAudioActive = !this.isAudioActive;
    this.switchAudioStreamSource({
      realAudio: this.isAudioActive
    })
  }
}