import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3030';

export const socket = io(URL, {
  //autoConnect: false - Cái này sau tùy màn sẽ phải bật lên
});

export const keySocket = {
  CREATE_ROOM: 'createRoom',
  JOIN_ROOM: 'joinRoom',
  PLAY: 'play',
  QUESTION: 'question',
  INCREASE_POINT: 'increasePoint',
  LEAVE_ROOM: 'leaveRoom',
  READY: 'ready',
  GAME_OVER: 'gameOver',
};
