const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testReferralBonus() {
  try {
    // Get all users with their referral bonuses
    const users = await prisma.user.findMany({
      include: {
        transactions: true,
        upline: true,
        downlines: true
      }
    })

    console.log('Users and their referral bonuses:')
    for (const user of users) {
      const referralBonuses = user.transactions.filter(tx => tx.type === 'REFERRAL_BONUS')
      const confirmedReferralBonuses = referralBonuses.filter(tx => tx.status === 'CONFIRMED')
      
      if (referralBonuses.length > 0) {
        console.log(`\nUser: ${user.username} (${user.id})`)
        console.log(`  Total referral bonuses: ${referralBonuses.length}`)
        console.log(`  Confirmed referral bonuses: ${confirmedReferralBonuses.length}`)
        console.log(`  Total referral bonus amount: ${referralBonuses.reduce((sum, tx) => sum + tx.amount, 0)}`)
        console.log(`  Confirmed referral bonus amount: ${confirmedReferralBonuses.reduce((sum, tx) => sum + tx.amount, 0)}`)
        console.log(`  User balance: ${user.balance}`)
        console.log(`  User total earned: ${user.totalEarned}`)
        console.log(`  Referrals: ${user.downlines.length}`)
        
        if (user.upline) {
          console.log(`  Referred by: ${user.upline.username}`)
        }
      }
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testReferralBonus()