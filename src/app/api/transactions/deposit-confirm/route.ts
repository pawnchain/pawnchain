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
    const { transactionId } = body
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      )
    }

    // Find the transaction
    const transaction = await prisma.transaction.findFirst({
      where: {
        OR: [
          { transactionId: transactionId },
          { id: transactionId }
        ],
        userId: user.id,
        type: 'DEPOSIT'
      }
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    if (transaction.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Transaction already processed' },
        { status: 400 }
      )
    }

    // Update transaction to indicate user has confirmed payment
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: { 
        confirmedAt: new Date(),
        description: (transaction.description || '') + ' - User confirmed payment'
      }
    })
    
    return NextResponse.json({ 
      success: true, 
      transaction: updatedTransaction 
    })
  } catch (error) {
    console.error('Error confirming deposit:', error)
    return NextResponse.json(
      { error: 'Failed to confirm deposit' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}