'use client';
import React, { useState, useEffect } from 'react';
import { keySocket, socket } from './socket';
import { qs } from './question';
import ReactJson from 'react-json-view';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [joinRoomName, setJoinRoomName] = useState('Chưa có');
  // room - { id: str room: str, playerList: user[] }
  // user - { id: '', name: 'Chưa có', ready: false, point: 0 }
  const [userOne, setUserOne] = useState({ id: '', name: 'Chưa có', ready: false, point: 0 });
  const [userTwo, setUserTwo] = useState({ id: '', name: 'Chưa có', ready: false, point: 0 });
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [playing, setPlaying] = useState('Đang chờ');
  const [qsObject, setQsObject] = useState({});
  const [ownerRoom, setOwnerRoom] = useState(false);

  useEffect(() => {
    socket.connect();
  }, []);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(socket.connected);
    });

    //socket.connect() - Cái này sau này sẽ connect tùy màn :)

    socket.on(keySocket.CREATE_ROOM, data => {
      if (data.status == 'success') {
        setRoomId(data.room.id);
        setJoinRoomName(data.room.room);
        setUserOne(data.room.playerList[0]);
        setOwnerRoom(true);
      }
    });

    socket.on(keySocket.PLAY, () => {
      setPlaying('Đang tạo câu hỏi...');
    });

    socket.on(keySocket.READY, data => {
      if (data.status == 'success') {
        setUserOne(data.room.playerList[0]);
        setUserTwo(data.room.playerList[1]);
      }
    });

    socket.on(keySocket.INCREASE_POINT, data => {
      console.log(data);
      if (data.status == 'success') {
        setUserOne(data.room.playerList[0]);
        setUserTwo(data.room.playerList[1]);
      }
    });

    socket.on(keySocket.QUESTION, data => {
      setPlaying('Đang chơi');
      setQsObject(data.room.qs);
    });

    socket.on(keySocket.LEAVE_ROOM, data => {
      if (data.status == 'success' && joinRoomName != 'Chưa có') {
        setJoinRoomId('');
        if (data.room.playerList.length == 1) {
          setUserOne(data.room.playerList[0]);
          setUserTwo({ id: '', name: 'Chưa có', ready: false, point: 0 });
        } else {
          setUserOne({ id: '', name: 'Chưa có', ready: false, point: 0 });
          setUserTwo({ id: '', name: 'Chưa có', ready: false, point: 0 });
        }
      }
    });

    socket.on(keySocket.JOIN_ROOM, data => {
      console.log(data);
      if (data.status == 'success') {
        setRoomId(data.room.id);
        setJoinRoomName(data.room.room);
        setUserOne(data.room.playerList[0]);
        setUserTwo(data.room.playerList[1]);
      }
    });

    socket.on(keySocket.MATCH_FOUND, data => {
      console.log(data);
      console.log(socket.id);
      if (data.status == 'success') {
        setRoomId(data.room.id);
        setJoinRoomName(data.room.room);
        setUserOne(data.room.playerList[0]);
        setUserTwo(data.room.playerList[1]);

        if (socket.id == data.room.playerList[0].id) {
          setOwnerRoom(true);
          socket.emit(keySocket.PLAY, { roomId: data.room.id });
          //Tạo câu hỏi chỗ này :) call api các kiểu :))
          // qs = await callAPI();
          socket.emit(keySocket.QUESTION, { roomId: data.room.id, question: qs });
        }
      }
    });

    return () => {};
  }, [roomId, joinRoomName]);

  function createRoom() {
    if (!roomName) {
      return;
    }
    socket.emit(keySocket.CREATE_ROOM, { roomName, userName });
  }

  function onReady() {
    if (!roomId) {
      return;
    }
    socket.emit(keySocket.READY, { userName, roomId });
  }

  function onLeaveRoom() {
    setRoomName('');
    setJoinRoomId('');
    setJoinRoomName('Chưa có');
    setUserOne({ id: '', name: 'Chưa có', ready: false, point: 0 });
    setUserTwo({ id: '', name: 'Chưa có', ready: false, point: 0 });
    setOwnerRoom(false);
    socket.emit(keySocket.LEAVE_ROOM, { roomId });
  }

  function play() {
    socket.emit(keySocket.PLAY, { roomId });
    //Tạo câu hỏi chỗ này :) call api các kiểu :))
    // qs = await callAPI();
    socket.emit(keySocket.QUESTION, { roomId, question: qs });
  }

  function increasePoint() {
    socket.emit(keySocket.INCREASE_POINT, { roomId });
  }

  function onJoinRoom() {
    if (!joinRoomId) {
      return;
    }
    socket.emit(keySocket.JOIN_ROOM, { roomId: joinRoomId, userName });
  }

  function onFindRoom() {
    socket.emit(keySocket.FIND_ROOM, { userName });
    setPlaying('Đang tìm phòng...');
  }

  function onCancelFindRoom() {
    socket.emit(keySocket.CANCEL_FIND_ROOM, { userName });
    setPlaying('Đang chờ');
  }

  return (
    <div className="App">
      <div>{isConnected ? 'Connected' : 'Disconnected'}</div>
      <br />
      <div>{'Tên user'}</div>
      <input value={userName} onChange={e => setUserName(e.target.value)} />
      <div></div>
      <br />
      <div>{'Tên room'}</div>
      <input value={roomName} onChange={e => setRoomName(e.target.value)} />
      <button onClick={createRoom} disabled={userName == '' || roomName == '' || joinRoomName != 'Chưa có'}>
        Tạo room
      </button>
      <div></div>
      <br />
      <div>{'Id room'}</div>
      <input value={joinRoomId} onChange={e => setJoinRoomId(e.target.value)} />
      <button onClick={onJoinRoom} disabled={joinRoomId == '' || userName == '' || joinRoomName != 'Chưa có'}>
        Vào phòng
      </button>
      <div></div>
      <br />
      <div>{'Room Info'}</div>
      <div>{`Tên room đã vào: ${joinRoomName}, roomId: ${roomId}`}</div>
      <div>{`Người chơi 1: ${userOne.name}, trạng thái: ${userOne.ready}, điểm: ${userOne.point}`}</div>
      <div>{`Người chơi 2: ${userTwo.name}, trạng thái: ${userTwo.ready}, điểm: ${userTwo.point}`}</div>
      <div>{`Trạng thái phòng: ${playing}`}</div>
      <button onClick={onReady}>Sẵn sàng</button>
      <button onClick={play} disabled={!userOne.ready || !userTwo.ready || !ownerRoom}>
        Chơi
      </button>
      <button onClick={increasePoint}>Tăng điểm</button>
      <button onClick={onLeaveRoom}>Rời phòng</button>
      <div></div>
      <br />
      <button onClick={onFindRoom} disabled={userName == '' || joinRoomName != 'Chưa có' || playing == 'Đang tìm phòng...'}>
        Tìm ngẫu nhiên
      </button>
      <button onClick={onCancelFindRoom} disabled={playing != 'Đang tìm phòng...' || joinRoomName != 'Chưa có'}>
        Hủy
      </button>
      <div></div>
      <br />
      <ReactJson src={qsObject} />
    </div>
  );
}
