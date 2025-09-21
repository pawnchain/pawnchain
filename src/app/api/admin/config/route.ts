import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Helper function to verify admin status
async function verifyAdmin(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value
    
    if (!sessionToken) {
      return null
    }
    
    const decoded = jwt.verify(
      sessionToken,
      process.env.NEXTAUTH_SECRET || 'fallback-secret'
    ) as { user: any }
    
    if (decoded && decoded.user && decoded.user.isAdmin) {
      return decoded.user
    }
    
    return null
  } catch (error) {
    console.error('Session verification error:', error)
    return null
  }
}

// GET handler for public config (plans information)
export async function GET(request: NextRequest) {
  try {
    // Get all active plans
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      select: {
        name: true,
        price: true,
        payout: true,
        referralBonus: true
      }
    })

       // Use hardcoded wallet address if available
    const config: any = {
      plans,
      depositCoin: 'USDT',
      depositNetwork: 'TRON (TRC20)'
    }
    
    // Add depositWallet only if not using hardcoded value
    if (!process.env.CRYPTO_WALLET_ADDRESS) {
      config.depositWallet = undefined;
    }
    
    // Get admin settings from database
    const adminSettings = await prisma.adminSettings.findMany()
    
    // Merge database settings with config, but don't override hardcoded wallet
    adminSettings.forEach(setting => {
      // Skip depositWallet if we're using a hardcoded address
      if (setting.key === 'depositWallet' && process.env.CRYPTO_WALLET_ADDRESS) {
        return;
      }
      
      try {
        config[setting.key] = JSON.parse(setting.value)
      } catch {
        config[setting.key] = setting.value
      }
    })
    
    // If using hardcoded wallet address, set it in the response
    if (process.env.CRYPTO_WALLET_ADDRESS) {
      config.depositWallet = process.env.CRYPTO_WALLET_ADDRESS;
    }
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST handler for admin updates
export async function POST(request: NextRequest) {
  const adminUser = await verifyAdmin(request)
  if (!adminUser) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }
  
  try {
    const body = await request.json()
    
    // Update admin settings
    for (const [key, value] of Object.entries(body)) {
      // Skip depositWallet if we're using a hardcoded address
      if (key === 'depositWallet' && process.env.CRYPTO_WALLET_ADDRESS) {
        continue;
      }
      await prisma.adminSettings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { 
          key, 
          value: String(value),
          type: typeof value
        }
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating config:', error)
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
