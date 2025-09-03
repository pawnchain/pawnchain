const https = require('https');

// Test updating a transaction
const data = JSON.stringify({
  status: 'COMPLETED'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/admin/transactions/test-id',
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  console.log(`Status: ${res.statusCode}`);
  
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error('Error:', error);
});

req.write(data);
req.end();