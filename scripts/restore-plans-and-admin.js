const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function restoreDatabase() {
  try {
    console.log('🚀 Starting ForgeChain Networks database restoration...')

    // Initialize default plans
    console.log('📋 Creating investment plans...')
    const plans = [
      {
        name: 'King',
        price: 100,
        payout: 400,
        referralBonus: 10,
        description: 'Premium investment plan with highest returns'
      },
      {
        name: 'Queen',
        price: 50,
        payout: 200,
        referralBonus: 5,
        description: 'High-tier investment plan with excellent returns'
      },
      {
        name: 'Bishop',
        price: 25,
        payout: 100,
        referralBonus: 2.5,
        description: 'Mid-tier investment plan with good returns'
      },
      {
        name: 'Knight',
        price: 10,
        payout: 40,
        referralBonus: 1,
        description: 'Entry-level investment plan'
      }
    ]

    for (const planData of plans) {
      const existingPlan = await prisma.plan.findUnique({
        where: { name: planData.name }
      })

      if (!existingPlan) {
        await prisma.plan.create({ data: planData })
        console.log(`✅ Created plan: ${planData.name} (${planData.price} USDT)`)
      } else {
        // Update existing plan
        await prisma.plan.update({
          where: { name: planData.name },
          data: planData
        })
        console.log(`🔄 Updated plan: ${planData.name}`)
      }
    }

    // Initialize admin settings
    console.log('⚙️ Setting up admin configuration...')
    const settings = [
      { key: 'TRIANGLE_SIZE', value: '15', type: 'number' },
      { key: 'PAYOUT_PROCESSING_TIME', value: '48', type: 'number' },
      { key: 'REFERRAL_BONUS_ENABLED', value: 'true', type: 'boolean' },
      { key: 'MAINTENANCE_MODE', value: 'false', type: 'boolean' },
      { key: 'REGISTRATION_ENABLED', value: 'true', type: 'boolean' },
      { key: 'depositWallet', value: 'TBD...', type: 'string' },
      { key: 'depositCoin', value: 'USDT', type: 'string' },
      { key: 'depositNetwork', value: 'TRON (TRC20)', type: 'string' }
    ]

    for (const setting of settings) {
      const existingSetting = await prisma.adminSettings.findUnique({
        where: { key: setting.key }
      })

      if (!existingSetting) {
        await prisma.adminSettings.create({ data: setting })
        console.log(`⚙️ Created setting: ${setting.key}`)
      } else {
        await prisma.adminSettings.update({
          where: { key: setting.key },
          data: { value: setting.value, type: setting.type }
        })
        console.log(`🔄 Updated setting: ${setting.key}`)
      }
    }

    // Create admin user
    console.log('👑 Creating admin user...')
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@forgechain.com'

    const existingAdmin = await prisma.user.findFirst({
      where: { isAdmin: true }
    })

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12)
      const referralCode = `ADMIN_${Date.now()}`

      const admin = await prisma.user.create({
        data: {
          username: adminUsername,
          email: adminEmail,
          password: hashedPassword,
          walletAddress: `admin_wallet_${Date.now()}`,
          plan: 'King',
          referralCode,
          isAdmin: true,
          isActive: true,
          status: 'CONFIRMED',
          balance: 0,
          totalEarned: 0
        }
      })

      console.log('✅ Admin user created successfully!')
      console.log(`   Username: ${admin.username}`)
      console.log(`   Email: ${admin.email}`)
      console.log(`   Referral Code: ${admin.referralCode}`)
      console.log('   ⚠️ Please change the default password after first login.')
    } else {
      console.log('ℹ️ Admin user already exists:', existingAdmin.username)
    }

    console.log('🎉 Database restoration completed successfully!')
    console.log('')
    console.log('📊 Summary:')
    console.log(`   • Plans: ${plans.length} investment plans configured`)
    console.log(`   • Settings: ${settings.length} system settings configured`)
    console.log(`   • Admin: Ready for management operations`)
    console.log('')
    console.log('🚀 ForgeChain Networks is ready to launch!')

  } catch (error) {
    console.error('❌ Error during database restoration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the restoration
restoreDatabase()
  .catch((e) => {
    console.error('💥 Database restoration failed:', e)
    process.exit(1)
  })