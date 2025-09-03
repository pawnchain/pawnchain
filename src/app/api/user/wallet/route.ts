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
          }
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
    
    // Get position info
    let positionInfo = null
    if (userData.trianglePosition) {
      const triangle = userData.trianglePosition.triangle
      const filledPositions = triangle.positions.length
      
      positionInfo = {
        positionKey: userData.trianglePosition.positionKey,
        triangleComplete: triangle.isComplete,
        earnedFromPosition: planEarnings,
        filledPositions: filledPositions
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
      pendingEarnings: 0, // Calculate if needed
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