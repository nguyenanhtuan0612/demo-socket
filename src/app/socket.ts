import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3030';

export const socket = io(URL, {
  autoConnect: false, // false means the connection will be delayed until we call socket.connect()
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
