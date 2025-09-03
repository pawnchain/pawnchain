import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { findReferrer } from '@/lib/triangle'

const prisma = new PrismaClient()

// Function to generate a short, unique referral code
async function generateReferralCode(username: string): Promise<string> {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  
  const usernamePrefix = username.substring(0, 3).toUpperCase()
  const referralCode = `${usernamePrefix}${result}`
  
  // Check if this code already exists
  const existingUser = await prisma.user.findFirst({
    where: { referralCode: referralCode }
  })
  
  if (existingUser) {
    return generateReferralCode(username)
  }
  
  return referralCode
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, walletAddress, planType, referrerId } = body

    console.log('Registration attempt:', { username, walletAddress, planType, referrerId })

    // Validate required fields
    if (!username || !password || !walletAddress || !planType) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { walletAddress }
        ]
      }
    })

    if (existingUser) {
      console.log('User already exists:', existingUser.username)
      return NextResponse.json(
        { message: 'Username or wallet address already exists' },
        { status: 400 }
      )
    }

    // Validate plan type
    const validPlans = ['King', 'Queen', 'Bishop', 'Knight']
    if (!validPlans.includes(planType)) {
      return NextResponse.json(
        { message: 'Invalid plan type' },
        { status: 400 }
      )
    }

    // Find upline user if referrer ID is provided
    let uplineId = null
    let finalPlanType = planType

    if (referrerId) {
      const upline = await findReferrer(referrerId)
      
      if (upline) {
        uplineId = upline.id
        // Automatically set plan to match referrer's plan
        finalPlanType = upline.plan
      }
    }

    // Hash password
    console.log('Hashing password for user:', username)
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('Password hashed successfully for user:', username)

    // Generate unique referral code
    const referralCode = await generateReferralCode(username)

    // Get plan details
    const plan = await prisma.plan.findUnique({
      where: { name: finalPlanType as any }
    })

    if (!plan) {
      return NextResponse.json(
        { message: 'Plan not found' },
        { status: 400 }
      )
    }

    // Generate a unique email if not provided
    const email = `${username}@forgechain.local`
    
    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        walletAddress,
        plan: finalPlanType as any,
        referralCode,
        uplineId,
        balance: 0,
        totalEarned: 0,
        isAdmin: false,
        isActive: true,
        status: 'PENDING',
        loginAttempts: 0
      }
    })

    console.log('User created successfully:', newUser.username, 'with ID:', newUser.id)

    // Generate deposit information
    const depositInfo = {
      transactionId: `DP${Date.now()}`,
      amount: plan.price,
      coin: 'USDT',
      network: 'TRC20',
      walletAddress: process.env.CRYPTO_WALLET_ADDRESS || 'TBD...',
      positionId: newUser.id,
      positionKey: newUser.referralCode
    }

    // Create pending deposit transaction
    await prisma.transaction.create({
      data: {
        userId: newUser.id,
        type: 'DEPOSIT',
        amount: plan.price,
        status: 'PENDING',
        transactionId: depositInfo.transactionId,
        description: `Initial deposit for ${finalPlanType} plan`,
        metadata: depositInfo
      }
    })

    console.log('User registered successfully:', newUser.username)
    
    return NextResponse.json({ 
      success: true,
      message: 'Registration successful',
      deposit: depositInfo
    })
    
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}