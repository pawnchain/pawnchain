import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Helper function to verify user authentication
async function verifyUser(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value
    
    if (!sessionToken) {
      return null
    }
    
    const decoded = jwt.verify(
      sessionToken,
      process.env.NEXTAUTH_SECRET || 'fallback-secret'
    ) as { user: any }
    
    if (decoded && decoded.user) {
      return decoded.user
    }
    
    return null
  } catch (error) {
    console.error('Session verification error:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - User access required' },
        { status: 401 }
      )
    }
    
    // Fetch user with complete data
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        trianglePosition: {
          include: {
            triangle: {
              include: {
                positions: {
                  where: { userId: { not: null } }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        transactions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Calculate wallet statistics
    const balance = userData.balance
    const totalEarned = userData.totalEarned
    
    // Calculate referral bonus from transactions
    const referralBonus = userData.transactions
      .filter(tx => tx.type === 'REFERRAL_BONUS' && tx.status === 'CONFIRMED')
      .reduce((sum, tx) => sum + tx.amount, 0)
    
    // Calculate plan earnings (total earned minus referral bonus)
    const planEarnings = totalEarned - referralBonus
    
    // Get position info and calculate potential earnings based on user's current position
    let positionInfo = null
    let currentPositionEarnings = 0
    
    if (userData.trianglePosition && userData.trianglePosition.length > 0) {
      // Get the most recent triangle position (the first one in the array since we ordered by createdAt desc)
      const currentPosition = userData.trianglePosition[0]
      const triangle = currentPosition.triangle
      const filledPositions = triangle ? triangle.positions.length : 0
      
      // Get the plan payout amount
      const plan = await prisma.plan.findUnique({
        where: { name: userData.plan }
      })
      
      // Calculate potential earnings based on position level
      let potentialEarnings = 0
      let levelMultiplier = 0
      
      // Determine level multiplier based on position key
      if (currentPosition.positionKey === 'A') {
        levelMultiplier = 4 // 4x for level 1
      } else if (currentPosition.positionKey === 'AB1' || currentPosition.positionKey === 'AB2') {
        levelMultiplier = 3 // 3x for level 2
      } else if (currentPosition.positionKey.startsWith('B') && currentPosition.positionKey.includes('C')) {
        levelMultiplier = 2 // 2x for level 3
      } else if (currentPosition.positionKey.startsWith('C') && currentPosition.positionKey.includes('D')) {
        levelMultiplier = 1 // 1x for level 4
      }
      
      if (plan) {
        potentialEarnings = plan.price * levelMultiplier
        currentPositionEarnings = potentialEarnings
      }
      
      positionInfo = {
        positionKey: currentPosition.positionKey,
        triangleComplete: triangle ? triangle.isComplete : false,
        earnedFromPosition: planEarnings,
        filledPositions: filledPositions,
        potentialEarnings: potentialEarnings,
        levelMultiplier: levelMultiplier,
        currentPositionEarnings: currentPositionEarnings
      }
    }
    
    // Transform transaction history for frontend
    const transactionHistory = userData.transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      status: tx.status,
      transactionId: tx.transactionId || undefined,
      date: tx.createdAt.toISOString().split('T')[0],
      description: tx.description
    }))
    
    const responseData = {
      balance,
      pendingEarnings: currentPositionEarnings, // Show current position earnings as pending
      totalEarned,
      referralBonus,
      planEarnings,
      positionInfo,
      history: transactionHistory
    }
    
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching user wallet:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user wallet data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
