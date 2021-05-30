import { constants } from "../../_shared/constants.js";
import Attendee from "./entities/attendee.js";
import getTemplate from "./templates/usersTemplate.js";

const imgUser = document.getElementById('imgUser');
const roomTopic = document.getElementById('pTopic');
const gridAttendees = document.getElementById('gridAttendees');
const gridSpeakers = document.getElementById('gridSpeakers');
const btnMicrophone = document.getElementById('btnMicrophone');
const btnClipBoard = document.getElementById('btnClipBoard');
const btnClap = document.getElementById('btnClap');
const toggleImage = document.getElementById('toggleImage');
const btnLeave = document.getElementById('btnLeave');

export default class View {
  static updateUserImage({
    img,
    username,
  }){
    imgUser.src = img;
    imgUser.alt = username;
  }

  static redirectToLogin() {
    window.location = constants.pages.login
  }

  static _getExistingItemOnGrid({
    id,
    baseElement = document
  }){
    const existingItem = baseElement.querySelector(`[id="${id}"]`);
    return existingItem;
  }

  static _createAudioElement({
    muted = true,
    srcObject,
  }) {
    const audio = document.createElement('audio');
    audio.muted = muted;
    audio.srcObject = srcObject;

    audio.addEventListener('loadedmetadata', async () => {
      try {
        await audio.play()
      } catch (error) {
        console.log('error to play', error);
      }
    })

    return audio;
  }

  static _appedToHTMLTree(userId, audio) {
    const div = document.createElement('div');

    div.id = userId;
    div.append(audio);
  }

  static _onClapClick(command) {
    return () => {
      command();

      const basePath = './../../assets/icons';
      const handActive = 'hand-solid.svg';
      const handInactive = 'hand.svg';

      if(toggleImage.src.match(handInactive)) {
        toggleImage.src = `${basePath}/${handActive}`;
        return;
      }
      toggleImage.src = `${basePath}/${handInactive}`;
    }
  }
  
  static _redirectToLobby() {
    window.location = constants.pages.lobby;
  }

  static _toggleMicrophone() {
    const icon = btnMicrophone.firstElementChild;
    const classes = [...icon.classList];

    const inactiveClass = 'fa-microphone-slash';
    const activeClass = 'fa-microphone';

    const isInactive = classes.includes(inactiveClass);

    if(isInactive) {
      icon.classList.remove(inactiveClass);
      icon.classList.add(activeClass);
      return
    }

    icon.classList.add(inactiveClass);
    icon.classList.remove(activeClass);
  }

  static removeItemFromGrid(id){
    const existingItem = View._getExistingItemOnGrid({id});

    existingItem?.remove()
  }

  static updateRoomTopic({topic}) {
    roomTopic.innerHTML = topic;
  }

  static updateAttendeesOnGrid(users) {
    users.forEach(item => View.addAttendeeOnGrid(item));
  }

  static addAttendeeOnGrid(item, removeFirst = false) {
    const attendee = new Attendee(item);
    const id = attendee.id;
    const htmlTemplate = getTemplate(attendee);
    const baseElement = attendee.isSpeaker ? gridSpeakers : gridAttendees;

    if(removeFirst) {
      View.removeItemFromGrid(id);
      baseElement.innerHTML += htmlTemplate;
      return;
    }
    
    const existingItem = View._getExistingItemOnGrid({ id, baseElement });

    if(existingItem){
      existingItem = htmlTemplate;
      return;
    }

    baseElement.innerHTML += htmlTemplate;
  }

  static renderAudioElement({
    callerId,
    stream,
    isCurrentId
  }) {
     View._createAudioElement({
      muted: isCurrentId,
      srcObject: stream,
    })
  }

  static showUserFeatures(isSpeaker) {
    //attendee
    if(!isSpeaker){
      btnClap.classList.remove('hidden');
      btnMicrophone.classList.add('hidden');
      btnClipBoard.classList.add('hidden');
      return;
    }

    // speaker
    btnClap.classList.add('hidden');

    btnMicrophone.classList.remove('hidden');
    btnClipBoard.classList.remove('hidden');
  }

  static configureClapButton(command) {
    btnClap.addEventListener('click', View._onClapClick(command));
  }

  static configureLeaveButton() {
    btnLeave.addEventListener('click', View._redirectToLobby);
  } 

  static configureMicrophoneToggle(command) {
    btnMicrophone.addEventListener('click', () => {
      View._toggleMicrophone();
      command();
    });
  } 
}