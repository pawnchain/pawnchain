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

export async function POST(request: NextRequest) {
  try {
    const user = await verifyUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - User access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { amount, walletAddress } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Get user's triangle position
    const userPosition = await prisma.trianglePosition.findUnique({
      where: { userId: user.id },
      include: {
        triangle: {
          include: {
            positions: {
              where: { userId: { not: null } }
            }
          }
        }
      }
    })

    if (!userPosition) {
      return NextResponse.json(
        { error: 'User not in any triangle' },
        { status: 400 }
      )
    }

    // Check if user is in position A (level 1, position 0)
    if (userPosition.level !== 1 || userPosition.position !== 0) {
      return NextResponse.json(
        { error: 'Only position A users can request payout' },
        { status: 400 }
      )
    }

    // Check if triangle is complete (15 positions filled)
    const filledPositions = userPosition.triangle.positions.length
    if (filledPositions !== 15) {
      return NextResponse.json(
        { error: `Triangle not complete. Only ${filledPositions}/15 positions filled` },
        { status: 400 }
      )
    }

    // Check if user has sufficient balance
    const userData = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!userData || userData.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    // Create payout transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'PAYOUT',
        amount: amount,
        status: 'PENDING',
        transactionId: `WD${Date.now()}`,
        description: 'User requested payout',
        metadata: {
          walletAddress: walletAddress || userData.walletAddress,
          triangleId: userPosition.triangleId
        }
      }
    })

    return NextResponse.json({
      success: true,
      transactionId: transaction.transactionId,
      message: 'Payout request submitted for admin approval'
    })

  } catch (error) {
    console.error('Payout request error:', error)
    return NextResponse.json(
      { error: 'Failed to process payout request' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}