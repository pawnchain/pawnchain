const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestData() {
  try {
    // Get the first user
    const user = await prisma.user.findFirst()
    
    if (!user) {
      console.log('No user found')
      return
    }
    
    console.log('Found user:', user.username)
    
    // Create a test deposit transaction
    const deposit = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'DEPOSIT',
        amount: 100.0,
        status: 'PENDING',
        transactionId: 'DEP-' + Date.now() + '-1',
        description: 'Test deposit'
      }
    })
    
    console.log('Created deposit transaction:', deposit.id)
    
    // Create a test payout transaction
    const payout = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'PAYOUT',
        amount: 50.0,
        status: 'PENDING',
        transactionId: 'PAY-' + Date.now() + '-1',
        description: 'Test payout'
      }
    })
    
    console.log('Created payout transaction:', payout.id)
    
    console.log('Test data created successfully')
  } catch (error) {
    console.error('Error creating test data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestData()