const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testReferralAPI() {
  try {
    // Get a user with referrals
    const user = await prisma.user.findFirst({
      where: {
        downlines: {
          some: {}
        }
      },
      include: {
        downlines: {
          select: {
            id: true,
            username: true,
            plan: true,
            createdAt: true
          }
        },
        transactions: true
      }
    })

    if (!user) {
      console.log('No user with referrals found')
      return
    }

    console.log(`User: ${user.username}`)
    console.log(`Referral Code: ${user.referralCode}`)
    console.log(`Total Referrals: ${user.downlines.length}`)
    
    // Calculate referral statistics
    const referralBonuses = user.transactions.filter(tx => tx.type === 'REFERRAL_BONUS')
    console.log(`Total Referral Bonuses: ${referralBonuses.length}`)
    
    const totalCommission = referralBonuses.reduce((sum, tx) => sum + tx.amount, 0)
    console.log(`Total Commission: ${totalCommission}`)
    
    const pendingCommission = referralBonuses
      .filter(tx => tx.status === 'PENDING')
      .reduce((sum, tx) => sum + tx.amount, 0)
    console.log(`Pending Commission: ${pendingCommission}`)
    
    console.log('\nReferral History:')
    referralBonuses.forEach(tx => {
      console.log(`  - ${tx.description}: ${tx.amount} USDT (${tx.status})`)
    })
    
    console.log('\nReferred Users:')
    user.downlines.forEach(ref => {
      console.log(`  - ${ref.username} (${ref.plan}) - Joined: ${ref.createdAt}`)
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testReferralAPI()