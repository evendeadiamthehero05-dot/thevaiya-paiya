const http = require('http');

function testRoomCreation() {
  const data = JSON.stringify({ playerName: 'TestPlayer123' });
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/rooms',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        console.log('\n✓ Response received');
        console.log('Status:', res.statusCode);
        console.log('Body:', body);
        try {
          const json = JSON.parse(body);
          console.log('Parsed JSON:', json);
          resolve(json);
        } catch (e) {
          console.error('Failed to parse JSON:', e.message);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error('✗ Request error:', e.message);
      reject(e);
    });

    console.log('\n→ Sending POST /api/rooms with playerName=TestPlayer123');
    req.write(data);
    req.end();
  });
}

testRoomCreation().then(() => {
  console.log('\n✓ Test completed successfully');
  process.exit(0);
}).catch((err) => {
  console.error('\n✗ Test failed:', err.message);
  process.exit(1);
});
