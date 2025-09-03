const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixTotalEarned() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      include: {
        transactions: true
      }
    })

    console.log('Fixing total earned values for users...')
    
    for (const user of users) {
      // Calculate total earned from transactions
      const referralBonuses = user.transactions
        .filter(tx => tx.type === 'REFERRAL_BONUS' && tx.status === 'CONFIRMED')
        .reduce((sum, tx) => sum + tx.amount, 0)
      
      const payouts = user.transactions
        .filter(tx => tx.type === 'PAYOUT' && tx.status === 'CONFIRMED')
        .reduce((sum, tx) => sum + tx.amount, 0)
      
      const totalEarned = referralBonuses + payouts
      
      // Update user if the calculated total earned differs from the stored value
      if (user.totalEarned !== totalEarned) {
        console.log(`Updating user ${user.username}: ${user.totalEarned} -> ${totalEarned}`)
        await prisma.user.update({
          where: { id: user.id },
          data: { totalEarned: totalEarned }
        })
      }
    }
    
    console.log('Finished fixing total earned values.')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixTotalEarned()