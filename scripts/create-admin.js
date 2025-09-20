const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { isAdmin: true }
    })

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.username)
      return
    }

    // Get admin credentials from environment variables
    const username = process.env.ADMIN_USERNAME || 'admin'
    const password = process.env.ADMIN_PASSWORD || 'admin123'
    const email = process.env.ADMIN_EMAIL || 'admin@PawnChain.com'
    const walletAddress = '0x0000000000000000000000000000000000000000' // Default wallet address for admin

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate a unique referral code for admin
    const referralCode = `ADMIN_${Date.now()}`

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        plan: 'King',
        referralCode,
        walletAddress, // Add wallet address
        isAdmin: true,
        isActive: true,
        balance: 0,
        totalEarned: 0
      }
    })

    console.log('Admin user created successfully!')
    console.log('Username:', admin.username)
    console.log('Email:', admin.email)
    console.log('Referral Code:', admin.referralCode)
    console.log('Please change the default password after first login.')

  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Initialize default plans
async function initializePlans() {
  try {
    const plans = [
      {
        name: 'King',
        price: 1000,
        payout: 8000,
        referralBonus: 100,
        description: 'Premium investment plan with highest returns'
      },
      {
        name: 'Queen',
        price: 500,
        payout: 4000,
        referralBonus: 50,
        description: 'High-tier investment plan with excellent returns'
      },
      {
        name: 'Bishop',
        price: 250,
        payout: 2000,
        referralBonus: 25,
        description: 'Mid-tier investment plan with good returns'
      },
      {
        name: 'Knight',
        price: 100,
        payout: 800,
        referralBonus: 10,
        description: 'Entry-level investment plan'
      }
    ]

    for (const planData of plans) {
      const existingPlan = await prisma.plan.findUnique({
        where: { name: planData.name }
      })

      if (!existingPlan) {
        await prisma.plan.create({ data: planData })
        console.log(`Created plan: ${planData.name}`)
      } else {
        console.log(`Plan already exists: ${planData.name}`)
      }
    }

  } catch (error) {
    console.error('Error initializing plans:', error)
  }
}

// Initialize admin settings
async function initializeSettings() {
  try {
    const settings = [
      { key: 'TRIANGLE_SIZE', value: '15', type: 'number' },
      { key: 'PAYOUT_PROCESSING_TIME', value: '48', type: 'number' },
      { key: 'REFERRAL_BONUS_ENABLED', value: 'true', type: 'boolean' },
      { key: 'MAINTENANCE_MODE', value: 'false', type: 'boolean' },
      { key: 'REGISTRATION_ENABLED', value: 'true', type: 'boolean' }
    ]

    for (const setting of settings) {
      const existingSetting = await prisma.adminSettings.findUnique({
        where: { key: setting.key }
      })

      if (!existingSetting) {
        await prisma.adminSettings.create({ data: setting })
        console.log(`Created setting: ${setting.key}`)
      } else {
        console.log(`Setting already exists: ${setting.key}`)
      }
    }

  } catch (error) {
    console.error('Error initializing settings:', error)
  }
}

async function main() {
  console.log('Initializing PawnChain Networks database...')
  
  await initializePlans()
  await initializeSettings()
  await createAdmin()
  
  console.log('Database initialization complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })