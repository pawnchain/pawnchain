const https = require('https');

// Test updating config
const data = JSON.stringify({
  depositWallet: "TABC1234567890",
  depositCoin: "USDT",
  depositNetwork: "TRON (TRC20)"
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/admin/config',
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