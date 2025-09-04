const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createKingUsers() {
  try {
    console.log('Creating 14 new users on the King plan...');
    
    const users = [];
    const password = await bcrypt.hash('password123', 10); // Hash the password
    
    for (let i = 1; i <= 14; i++) {
      const username = `kinguser${i}`;
      const email = `king${i}@example.com`;
      const walletAddress = `0xKingWallet${i.toString().padStart(3, '0')}`;
      const referralCode = `KINGREF${i.toString().padStart(3, '0')}`;
      
      try {
        const user = await prisma.user.create({
          data: {
            username: username,
            email: email,
            password: password,
            walletAddress: walletAddress,
            plan: 'King',
            referralCode: referralCode,
            balance: 0,
            totalEarned: 0,
            isAdmin: false,
            isActive: true,
            status: 'CONFIRMED' // Set as confirmed to skip deposit step
          }
        });
        
        users.push(user);
        console.log(`Created user: ${username} (${email})`);
      } catch (error) {
        console.error(`Error creating user ${username}:`, error.message);
      }
    }
    
    console.log(`\nSuccessfully created ${users.length} users on the King plan!`);
    
    // Display summary
    console.log('\nCreated Users:');
    console.log('==============');
    users.forEach(user => {
      console.log(`${user.username} - ${user.email} - ${user.walletAddress}`);
    });
    
  } catch (error) {
    console.error('Error creating King users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createKingUsers();