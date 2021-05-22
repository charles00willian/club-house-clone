export default class PeerBuilder {
  constructor({
    peerConfig
  }) {
    this.peerConfig = peerConfig;
    this.onError = () => {};
    this.onConnectionOpened = () => {};
  }

  setOnError(fn) {
    this.onError = fn;
    return this;
  }

  setOnConnectionOpened(fn) {
    this.onConnectionOpened = fn;
    return this;
  }

  build() {
    // o peer recebe uma lista de argumentos,
    // new Peer(id, config1, config2)
    // params = [], new Peer(..params)
    const peer = new globalThis.Peer(...this.peerConfig);
    peer.on('error', this.onError);
    
    return new Promise((resolve, reject) => peer.on('open', () => {
      this.onConnectionOpened(peer);
      return resolve(peer);
    }))
  }
}