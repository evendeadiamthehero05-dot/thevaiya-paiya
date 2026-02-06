const http = require('http');
const ioClient = require('d:\\sshhh\\frontend\\node_modules\\socket.io-client');

const BACKEND_URL = 'http://localhost:3001';

async function testFullFlow() {
  console.log('\n=== Testing Full Game Flow ===\n');

  try {
    // Step 1: Create a room
    console.log('Step 1: Creating room...');
    const roomResponse = await postRequest('/api/rooms', { playerName: 'TestHost' });
    const { roomId, player } = roomResponse;
    console.log(`✓ Room created: ${roomId}`);
    console.log(`  Player: ${player.name} (${player.uid})`);

    // Step 2: Fetch room data
    console.log('\nStep 2: Fetching room data...');
    const roomData = await getRequest(`/api/rooms/${roomId}`);
    console.log(`✓ Room data fetched`);
    console.log(`  Status: ${roomData.status}`);
    console.log(`  Players: ${roomData.players.length}`);
    roomData.players.forEach(p => console.log(`    - ${p.name} (host: ${p.isHost})`));

    // Step 3: Connect via Socket.IO
    console.log('\nStep 3: Connecting via Socket.IO...');
    const socket = ioClient(BACKEND_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Socket.IO connection timeout'));
        socket.close();
      }, 5000);

      socket.on('connect', () => {
        console.log(`✓ Socket connected: ${socket.id}`);
        clearTimeout(timeout);

        // Step 4: Join room via socket
        console.log('\nStep 4: Joining room via socket...');
        socket.emit('JOIN_GAME_ROOM', {
          roomId,
          playerId: player.uid,
        });
        console.log('✓ JOIN_GAME_ROOM emitted');

        // Step 5: Wait for ROOM_STATE_UPDATE
        socket.on('ROOM_STATE_UPDATE', (data) => {
          console.log('\nStep 5: ROOM_STATE_UPDATE received');
          console.log(`✓ Room status: ${data.status}`);
          console.log(`  Players in update: ${data.players.length}`);
          
          socket.close();
          resolve('✓ Full flow test passed!');
        });

        setTimeout(() => {
          socket.close();
          reject(new Error('No ROOM_STATE_UPDATE received'));
        }, 3000);
      });

      socket.on('connect_error', (err) => {
        clearTimeout(timeout);
        socket.close();
        reject(new Error(`Socket connection error: ${err.message}`));
      });

      socket.on('error', (err) => {
        clearTimeout(timeout);
        socket.close();
        reject(new Error(`Socket error: ${err}`));
      });
    });

  } catch (err) {
    console.error('\n✗ Test failed:', err.message);
    process.exit(1);
  }
}

function postRequest(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 3001,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Status ${res.statusCode}: ${body}`));
        } else {
          resolve(JSON.parse(body));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path,
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Status ${res.statusCode}: ${body}`));
        } else {
          resolve(JSON.parse(body));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

testFullFlow().then((msg) => {
  console.log('\n' + msg);
  console.log('\n✓ All tests passed! Frontend should now work.\n');
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
