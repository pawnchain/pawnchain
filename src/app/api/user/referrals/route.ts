import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

// Helper function to verify user authentication
async function verifyUser(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value
    
    if (!sessionToken) {
      return null
    }
    
    // Verify and decode the session token
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

const prisma = new PrismaClient()

// GET /api/user/referrals - Get user's referral data
export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const user = await verifyUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - User access required' },
        { status: 401 }
      )
    }
    
    // Fetch user with referral information
    const userData: any = await prisma.user.findUnique({
      where: { id: user.id },
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
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Calculate referral statistics
    const totalReferrals = userData.downlines.length
    const totalCommission = userData.transactions
      .filter((tx: any) => tx.type === 'REFERRAL_BONUS')
      .reduce((sum: number, tx: any) => sum + tx.amount, 0)
    
    // Calculate pending commissions (CONFIRMED transactions are not pending)
    const pendingCommission = userData.transactions
      .filter((tx: any) => tx.type === 'REFERRAL_BONUS' && tx.status === 'PENDING')
      .reduce((sum: number, tx: any) => sum + tx.amount, 0)
    
    // Transform referral history for frontend
    const referralHistory = userData.transactions
      .filter((tx: any) => tx.type === 'REFERRAL_BONUS')
      .map((tx: any) => {
        // Find the referral user associated with this transaction
        // We'll match based on the transaction description which includes the referred user's username
        const referredUsername = tx.description?.replace('Referral bonus for ', '') || 'Unknown User'
        const referralUser = userData.downlines.find((ref: any) => 
          ref.username === referredUsername
        )
        
        return {
          id: tx.id,
          amount: tx.amount,
          date: tx.createdAt.toISOString().split('T')[0],
          status: tx.status.toLowerCase(),
          username: referralUser?.username || referredUsername,
          plan: referralUser?.plan || 'Unknown Plan'
        }
      })
    
    // Transform referred users for frontend
    const referredUsers = userData.downlines.map((referral: any) => ({
      id: referral.id,
      username: referral.username,
      plan: referral.plan,
      joinedAt: referral.createdAt.toISOString().split('T')[0]
    }))
    
    // Transform data for frontend
    const responseData = {
      code: userData.referralCode,
      totalReferrals,
      totalCommission,
      pendingCommission,
      history: referralHistory,
      referredUsers
    }
    
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching user referrals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user referral data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}