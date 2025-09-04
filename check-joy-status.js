const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkJoyStatus() {
  try {
    // Find Joy user
    const joy = await prisma.user.findUnique({
      where: { username: 'joy' },
      include: {
        trianglePosition: {
          include: {
            triangle: true
          }
        },
        upline: true
      }
    })
    
    if (!joy) {
      console.log('Joy user not found')
      return
    }
    
    console.log('Joy user details:')
    console.log(JSON.stringify({
      id: joy.id,
      username: joy.username,
      status: joy.status,
      plan: joy.plan,
      uplineId: joy.uplineId,
      upline: joy.upline ? { username: joy.upline.username } : null,
      trianglePosition: joy.trianglePosition ? {
        positionKey: joy.trianglePosition.positionKey,
        triangleId: joy.trianglePosition.triangleId,
        triangle: joy.trianglePosition.triangle ? {
          id: joy.trianglePosition.triangle.id,
          planType: joy.trianglePosition.triangle.planType,
          isComplete: joy.trianglePosition.triangle.isComplete
        } : null
      } : null
    }, null, 2))
    
    // Check Joy's transactions
    const transactions = await prisma.transaction.findMany({
      where: { userId: joy.id },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('\nJoy transactions:')
    console.log(JSON.stringify(transactions, null, 2))
    
  } catch (error) {
    console.error('Error checking Joy status:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkJoyStatus()