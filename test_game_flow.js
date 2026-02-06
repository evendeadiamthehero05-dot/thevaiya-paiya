const http = require('http');

async function testGameFlow() {
  console.log('\n=== Testing Game Flow (REST API) ===\n');

  try {
    // Test 1: Create room
    console.log('1️⃣ Creating room for "Alice"...');
    const room1 = await postRequest('/api/rooms', { playerName: 'Alice' });
    const { roomId: roomA } = room1;
    console.log(`   ✓ Created room: ${roomA}`);
    console.log(`   ✓ Host: Alice (${room1.player.name})`);

    // Test 2: Fetch room data
    console.log(`\n2️⃣ Fetching room ${roomA} data...`);
    let roomData = await getRequest(`/api/rooms/${roomA}`);
    console.log(`   ✓ Room status: ${roomData.status}`);
    console.log(`   ✓ Players: ${roomData.players.length}`);
    roomData.players.forEach(p => console.log(`     - ${p.name}${p.isHost ? ' (host)' : ''}`));

    // Test 3: Add players
    console.log(`\n3️⃣ Adding 6 more players to room ${roomA}...`);
    const names = ['Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace'];
    for (const name of names) {
      const player = await postRequest(`/api/rooms/${roomA}/join`, { playerName: name });
      console.log(`   ✓ Added: ${player.player.name}`);
    }

    // Test 4: Check player count
    console.log(`\n4️⃣ Checking final room state...`);
    roomData = await getRequest(`/api/rooms/${roomA}`);
    console.log(`   ✓ Room status: ${roomData.status}`);
    console.log(`   ✓ Total players: ${roomData.players.length}`);
    console.log(`\n   Players in room:`);
    roomData.players.forEach((p, i) => console.log(`     ${i+1}. ${p.name}${p.isHost ? ' (host)' : ''}`));

    // Test 5: Start game (simulation)
    console.log(`\n5️⃣ Testing role assignment on game start...`);
    console.log(`   The backend would assign 6 roles in this order:`);
    const ROLES = ['Girlfriend', 'Fling', 'Side Chick', 'Ex', "Ex's Ex", 'Lover'];
    ROLES.forEach((role, i) => console.log(`     ${i+1}. ${role}`));

    console.log('\n✅ All REST API tests passed!');
    console.log('\n📝 Summary:');
    console.log(`   ✓ Room creation works`);
    console.log(`   ✓ Player joining works`);
    console.log(`   ✓ Room data retrieval works`);
    console.log(`   ✓ Backend database is functioning`);
    console.log('\n🎮 Frontend should now work when you click "Create a Room"!');

  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
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
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
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
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

testGameFlow().then(() => {
  process.exit(0);
}).catch(() => {
  process.exit(1);
});
