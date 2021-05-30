class PeerCustomModule extends globalThis.Peer {
    constructor({
      config,
      onCall,
    }) {
      super(...config);

      this.onCall = onCall;
    }

    call(...args) {
      const originalCallResult = super.call(...args);
    
      // aqui acontece a magia, interceptamos o call e adicionamos
      // o comportamente para todos os objetos;
      this.onCall(originalCallResult);

      return originalCallResult;
    }
}

export default class PeerBuilder {
  constructor({
    peerConfig
  }) {
    this.peerConfig = peerConfig;
    this.onError = () => {};
    this.onConnectionOpened = () => {};
    this.onCallError = () => {};
    this.onCallClose = () => {};
    this.onCallReceived = () => {};
    this.onStreamReceived = () => {};
  }

  _prepareCallEvent(call){
    call.on('stream', (stream) => this.onStreamReceived(call, stream));
    call.on('error', (stream) => this.onCallError(call, stream));
    call.on('clone', (stream) => this.onCallClose(call, stream));

    this.onCallReceived(call);
  }

  setOnError(fn) {
    this.onError = fn;
    return this;
  }

  setOnConnectionOpened(fn) {
    this.onConnectionOpened = fn;
    return this;
  }

  setOnCallError(fn) {
    this.onCallError = fn;
    return this;
  }

  setOnCallClose(fn) {
      this.onCallClose = fn;
      return this;
  }

  setOnCallReceived(fn) {
      this.onCallReceived = fn;
      return this;
  }

  setOnStreamReceived(fn) {
      this.onStreamReceived = fn;
      return this;
  }

  async build() {
    // o peer recebe uma lista de argumentos,
    // new Peer(id, config1, config2)
    // params = [], new Peer(..params)
    const peer = new PeerCustomModule({
      config: [...this.peerConfig],
      onCall: this._prepareCallEvent.bind(this)
    });
    peer.on('error', this.onError);
    peer.on('call', this._prepareCallEvent.bind(this));
    console.log('opening');
    
    
    return new Promise((resolve, reject) => peer.on('open', () => {
      console.log('peer opened');
      this.onConnectionOpened(peer);
      return resolve(peer);
    }))
  }
}