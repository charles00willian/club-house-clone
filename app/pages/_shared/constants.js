export const constants = {
  // socketUrl: 'https://club-house-clone-socket-server.herokuapp.com',
  socketUrl: 'http://localhost:3000',
  socketNamespaces: {
    room: 'room',
    lobby: 'lobby'
  },
  peerConfig: Object.values({
    id: undefined,
    config: {
      secure: 9000,
      host: 'localhost',
      path: '/'
      // secure: true,
      // host: 'club-house-clone-peerjs-server.herokuapp.com',
      // path: '/'
    }
  }),
  pages: {
    lobby: '/pages/lobby',
    login: '/pages/login',
  }, 
  events: {
    USER_CONNECTED: 'userConnection', 
    USER_DISCONNECTED: 'userDisconnection',
    JOIN_ROOM: 'joinRoom',
    LOBBY_UPDATED: 'lobbyUpdated',
    UPGRADE_USER_PERMISSION: 'upgradeUserPermission',
    SPEAK_REQUEST: 'speakRequest',
    SPEAK_ANSWER: 'speakAnswer',
  },
  firebaseConfig:  {
    apiKey: "AIzaSyB3J4agD5oQsj7nwg_1sjvCC4u57qh_HLo",
    authDomain: "club-house-clone-84dfc.firebaseapp.com",
    projectId: "club-house-clone-84dfc",
    storageBucket: "club-house-clone-84dfc.appspot.com",
    messagingSenderId: "210253705047",
    appId: "1:210253705047:web:0f9f825e7a8ab8adaa5812",
    measurementId: "G-W9GF97KVED"
  },
  storageKey: 'clubhouse:storage:user'
}