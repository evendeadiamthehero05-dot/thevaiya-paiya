const io = require('d:\\sshhh\\frontend\\node_modules\\socket.io-client');

const BACKEND = 'http://localhost:3001';

const socket = io(BACKEND, {
  reconnection: false,
});

socket.on('connect', () => {
  console.log('connected', socket.id);
  socket.emit('JOIN_GAME_ROOM', { roomId: 'TEST01', playerId: 'test-uid' });
});

socket.on('connect_error', (err) => {
  console.error('connect_error', err.message);
});

socket.on('ROOM_STATE_UPDATE', (data) => {
  console.log('ROOM_STATE_UPDATE', JSON.stringify(data));
});

socket.on('ERROR', (e) => console.error('ERROR', e));

setTimeout(() => {
  console.log('closing');
  socket.close();
  process.exit(0);
}, 8000);
