// Using built-in fetch API (Node.js 18+)

// Test registration
async function testRegistration() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'testpassword',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        planType: 'King',
        referrerId: ''
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testRegistration();